'use babel';

import * as path from 'path';

const lint = require('../lib/linter-reek.js').provideLinter().lint;

const goodFile = path.join(__dirname, 'fixtures', 'good.rb');
const badFile = path.join(__dirname, 'fixtures', 'bad.rb');

describe('The reek provider for Linter', () => {
  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(() =>
      Promise.all([
        atom.packages.activatePackage('linter-reek'),
        atom.packages.activatePackage('language-ruby'),
      ]).then(() =>
        atom.workspace.open(goodFile),
      ),
    );
  });

  describe('checks a file with issues and', () => {
    let editor = null;
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => (editor = openEditor)),
      );
    });

    it('finds at least one message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages =>
          expect(messages.length).toBeGreaterThan(0),
        ),
      );
    });

    it('verifies the first message', () => {
      const messageHtml = 'IrresponsibleModule: Dirty has no descriptive comment ' +
        '[<a href="https://github.com/troessner/reek/blob/master/docs/Irresponsible-Module.md">Irresponsible-Module</a>]';
      waitsForPromise(() =>
        lint(editor).then((messages) => {
          expect(messages[0].type).toEqual('Warning');
          expect(messages[0].severity).toEqual('warning');
          expect(messages[0].text).not.toBeDefined();
          expect(messages[0].html).toEqual(messageHtml);
          expect(messages[0].filePath).toBe(badFile);
          expect(messages[0].range).toEqual([[0, 0], [0, 11]]);
        }),
      );
    });
  });

  it('finds nothing wrong with a valid file', () => {
    waitsForPromise(() =>
      atom.workspace.open(goodFile).then(editor =>
        lint(editor).then(messages =>
          expect(messages.length).toBe(0),
        ),
      ),
    );
  });
});
