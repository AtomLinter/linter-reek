'use babel';

/* eslint-disable import/no-extraneous-dependencies, import/extensions */
import { CompositeDisposable } from 'atom';
/* eslint-enable import/no-extraneous-dependencies, import/extensions */

import * as helpers from 'atom-linter';
import path from 'path';

// Local variables
const parseRegex = /\[(\d+)(?:, \d+)*\]:(.*) \[.+\/(.+).md\]/g;
// Options
let executablePath;

export default {
  activate() {
    require('atom-package-deps').install('linter-reek').then(() => {
      if (atom.inDevMode()) {
        console.log('linter-reek: All dependencies installed.');
      }
    });

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.config.observe('linter-reek.executablePath', (value) => {
        executablePath = value;
      })
    );

    if (atom.inDevMode()) {
      console.log('linter-reek: Reek linter is now activated.');
      console.log(`linter-reek: Command path: ${executablePath}`);
    }
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'reek',
      grammarScopes: ['source.ruby', 'source.ruby.rails', 'source.ruby.rspec'],
      scope: 'file',
      lintOnFly: false,
      lint: (TextEditor) => {
        const filePath = TextEditor.getPath();
        const fileText = TextEditor.getText();
        const execOpts = { cwd: path.dirname(filePath), ignoreExitCode: true };
        return helpers.exec(executablePath, [filePath], execOpts).then((output) => {
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
              range: helpers.rangeFromLineNumber(TextEditor, line),
            });
            match = parseRegex.exec(output);
          }
          return messages;
        });
      },
    };
  },
};