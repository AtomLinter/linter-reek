'use babel';

import * as path from 'path';

const lint = require('../lib/linter-reek.coffee').provideLinter().lint;

const goodFile = path.join(__dirname, 'fixtures', 'good.rb');
const badFile = path.join(__dirname, 'fixtures', 'bad.rb');

describe('The reek provider for Linter', () => {
  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(() => {
      atom.packages.activatePackage('linter-reek');
      return atom.packages.activatePackage('language-ruby').then(() =>
        atom.workspace.open(goodFile)
      );
    });
  });

  describe('checks a file with issues and', () => {
    let editor = null;
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => (editor = openEditor))
      );
    });

    it('finds at least one message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages =>
          expect(messages.length).toBeGreaterThan(0)
        )
      );
    });

    it('verifies the first message', () => {
      waitsForPromise(() => {
        const messageHtml = 'IrresponsibleModule: Dirty has no descriptive comment ' +
          '[<a href=\'https://github.com/troessner/reek/blob/master/docs/Irresponsible-Module.md\'>Irresponsible-Module</a>]';
        return lint(editor).then((messages) => {
          expect(messages[0].type).toBeDefined();
          expect(messages[0].type).toEqual('warning');
          expect(messages[0].text).not.toBeDefined();
          expect(messages[0].html).toBeDefined();
          expect(messages[0].html).toEqual(messageHtml);
          expect(messages[0].filePath).toBeDefined();
          expect(messages[0].filePath).toMatch(/.+bad\.rb$/);
          expect(messages[0].range).toBeDefined();
          expect(messages[0].range.length).toBeDefined();
          expect(messages[0].range.length).toEqual(2);
          expect(messages[0].range).toEqual([[0, 0], [0, 0]]);
        });
      });
    });
  });

  it('finds nothing wrong with a valid file', () => {
    waitsForPromise(() =>
      atom.workspace.open(goodFile).then(editor =>
        lint(editor).then(messages =>
          expect(messages.length).toEqual(0)
        )
      )
    );
  });
});
