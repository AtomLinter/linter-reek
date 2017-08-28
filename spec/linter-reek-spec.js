'use babel';

import * as path from 'path';
// eslint-disable-next-line no-unused-vars
import { it, fit, wait, beforeEach, afterEach } from 'jasmine-fix';

const lint = require('../lib/linter-reek.js').provideLinter().lint;

const goodFile = path.join(__dirname, 'fixtures', 'good.rb');
const badFile = path.join(__dirname, 'fixtures', 'bad.rb');

describe('The reek provider for Linter', () => {
  beforeEach(async () => {
    atom.workspace.destroyActivePaneItem();
    await atom.packages.activatePackage('language-ruby');
    await atom.packages.activatePackage('linter-reek');
  });

  it('checks a file with issues and reports the correct message', async () => {
    const messageHtml = 'IrresponsibleModule: Dirty has no descriptive comment ' +
      '[<a href="https://github.com/troessner/reek/blob/master/docs/Irresponsible-Module.md">Irresponsible-Module</a>]';
    const editor = await atom.workspace.open(badFile);
    const messages = await lint(editor);

    expect(messages.length).toBe(1);
    expect(messages[0].type).toEqual('Warning');
    expect(messages[0].severity).toEqual('warning');
    expect(messages[0].text).not.toBeDefined();
    expect(messages[0].html).toEqual(messageHtml);
    expect(messages[0].filePath).toBe(badFile);
    expect(messages[0].range).toEqual([[0, 0], [0, 11]]);
  });

  it('finds nothing wrong with a valid file', async () => {
    const editor = await atom.workspace.open(goodFile);
    const messages = await lint(editor);
    expect(messages.length).toBe(0);
  });
});
