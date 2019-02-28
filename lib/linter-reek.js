'use babel';

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions
import { CompositeDisposable } from 'atom';
import * as RuleHelpers from './rule-helpers';

let helpers;
let path;

const loadDeps = () => {
  if (!helpers) {
    helpers = require('atom-linter');
  }
  if (!path) {
    path = require('path');
  }
};

const parseReekSyntaxError = (error, filePath, editor) => {
  const exceptionMessage = /Exception message:\s*(.*)/g.exec(error);
  return [{
    severity: 'error',
    excerpt: exceptionMessage ? `linter-reek: ${exceptionMessage[1]}` : 'linter-reek: unexpected error',
    location: {
      file: filePath,
      // first line of the file
      position: helpers.generateRange(editor, 0),
    },
  }];
};

const reekSmellToLinter = (smell, file, editor) => smell.lines.map(line => ({
  url: smell.documentation_link,
  description: () => RuleHelpers.getRuleMarkDown(smell.smell_type, smell.documentation_link),
  excerpt: `${smell.smell_type}: ${smell.context} ${smell.message}`,
  severity: 'warning',
  location: {
    file,
    position: helpers.generateRange(editor, line - 1),
  },
}));

const parseJSON = (stdout) => {
  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch (error) {
    atom.notifications.addError('linter-reek: Unexpected error', { description: error.message });
  }
  return parsed;
};

export default {
  activate() {
    this.idleCallbacks = new Set();
    let depsCallbackID;
    const installLinterReekDeps = () => {
      this.idleCallbacks.delete(depsCallbackID);
      if (!atom.inSpecMode()) {
        require('atom-package-deps').install('linter-reek');
      }
      loadDeps();
      if (atom.inDevMode()) {
        // eslint-disable-next-line no-console
        console.log('linter-reek: All dependencies installed.');
      }
    };
    depsCallbackID = window.requestIdleCallback(installLinterReekDeps);
    this.idleCallbacks.add(depsCallbackID);

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.config.observe(
      'linter-reek.executablePath',
      (value) => { this.executablePath = value; },
    ));

    if (atom.inDevMode()) {
      /* eslint-disable no-console */
      console.log('linter-reek: Reek linter is now activated.');
      console.log(`linter-reek: Command path: ${this.executablePath}`);
      /* eslint-enable no-console */
    }
  },

  deactivate() {
    this.idleCallbacks.forEach(callbackID => window.cancelIdleCallback(callbackID));
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'reek',
      grammarScopes: [
        'source.ruby',
        'source.ruby.rails',
        'source.ruby.rspec',
      ],
      scope: 'file',
      lintsOnChange: false,
      lint: async (editor) => {
        const filePath = editor.getPath();
        if (!filePath) {
          // Somehow a TextEditor without a path was passed in
          return null;
        }

        const fileText = editor.getText();
        loadDeps();

        const args = [];
        args.push('--format', 'json');
        args.push(filePath);

        const execOpts = {
          cwd: path.dirname(filePath),
          ignoreExitCode: true,
        };

        let output;
        try {
          output = await helpers.exec(this.executablePath, args, execOpts);
        } catch (e) {
          if (e.message !== 'Process execution timed out') {
            if (/Error: !!!/g.exec(e) === null) {
              throw e;
            } else {
              return parseReekSyntaxError(e, filePath, editor);
            }
          } else {
            atom.notifications.addInfo('linter-reek: reek timed out', {
              description: 'A timeout occured while executing reek, it could be due to lower resources '
              + 'or a temporary overload.',
            });
            return null;
          }
        }

        if (editor.getText() !== fileText) {
          // Editor contents have changed, tell Linter not to update
          return null;
        }

        return (parseJSON(output) || []).map(
          offense => reekSmellToLinter(offense, filePath, editor),
        ).reduce((offenses, offense) => offenses.concat(offense), []);
      },
    };
  },
};
