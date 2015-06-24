linterPath = atom.packages.getLoadedPackage("linter").path
Linter = require "#{linterPath}/lib/linter"
findFile = require "#{linterPath}/lib/util"
{CompositeDisposable} = require "atom"

class LinterReek extends Linter
  # The syntax that the linter handles. May be a string or
  # list/tuple of strings. Names should be all lowercase.
  @syntax: ['source.ruby', 'source.ruby.rails', 'source.ruby.rspec']

  # A string, list, tuple or callable that returns a string, list or tuple,
  # containing the command line (with arguments) used to lint.
  cmd: 'reek'

  linterName: 'Reek'

  # The default level for info gained from linting with this linter.
  defaultLevel: 'info'

  # A regex pattern used to extract information from the executable's output.
  regex:
    '.+?\\[(?<line>\\d+)\\]:' +
    '(?<message>.+)'

  constructor: (editor)->
    super(editor)

    @disposables = new CompositeDisposable

    config = findFile @cwd, ['config.reek']
    if config
      @cmd.concat  ['-c', config]

    @disposables.add atom.config.observe 'linter-reek.reekExecutablePath', @formatShellCommand

  formatShellCommand: ->
    reekExecutablePath = atom.config.get 'linter-reek.reekExecutablePath'
    @executablePath = "#{reekExecutablePath}"

  destroy: ->
    super
    @disposables.dispose()

module.exports = LinterReek
