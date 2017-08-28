'use babel';

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions
import { CompositeDisposable } from 'atom';

let helpers;
let path;

// Local variables
const parseRegex = /\[(\d+)(?:, \d+)*\]:(.*) \[.+\/(.+).md\]/g;

const loadDeps = () => {
  if (!helpers) {
    helpers = require('atom-linter');
  }
  if (!path) {
    path = require('path');
  }
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
    this.subscriptions.add(
      atom.config.observe('linter-reek.executablePath', (value) => {
        this.executablePath = value;
      }),
    );

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
      grammarScopes: ['source.ruby', 'source.ruby.rails', 'source.ruby.rspec'],
      scope: 'file',
      lintOnFly: false,
      lint: async (TextEditor) => {
        const filePath = TextEditor.getPath();
        if (!filePath) {
          // Somehow a TextEditor without a path was passed in
          return null;
        }

        const fileText = TextEditor.getText();
        loadDeps();

        const execOpts = {
          cwd: path.dirname(filePath),
          ignoreExitCode: true,
        };

        const output = await helpers.exec(this.executablePath, [filePath], execOpts);

        if (TextEditor.getText() !== fileText) {
          // Editor contents have changed, tell Linter not to update
          return null;
        }

        const messages = [];

        let match = parseRegex.exec(output);
        while (match !== null) {
          const line = Number.parseInt(match[1], 10) - 1;
          const urlBase = 'https://github.com/troessner/reek/blob/master/docs/';
          const ruleLink = `[<a href="${urlBase}${match[3]}.md">${match[3]}</a>]`;
          messages.push({
            filePath,
            type: 'Warning',
            severity: 'warning',
            html: `${match[2]} ${ruleLink}`,
            range: helpers.generateRange(TextEditor, line),
          });
          match = parseRegex.exec(output);
        }
        return messages;
      },
    };
  },
};
