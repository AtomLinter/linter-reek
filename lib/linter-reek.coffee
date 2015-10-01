{BufferedProcess, CompositeDisposable} = require 'atom'
OutputParser = require './output-parser'
helpers = require "atom-linter"

module.exports =
  config:
    executablePath:
      type: 'string'
      description: 'The path to the Reek executable. Find by running `which reek` or `rbenv which reek`'
      default: 'reek'

  activate: ->
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.config.observe 'linter-reek.executablePath', (executablePath) => @executablePath = executablePath
    atom.notifications.addError(
      'Linter package not found.',
      {
        detail: 'Please install or enable the `linter` package in your Settings view.'
      }
    ) unless atom.packages.getLoadedPackages 'linter'
    console.log 'Reek linter is now activated.'
    console.log "Command path: #{@executablePath}"

  deactivate: ->
    @subscriptions.dispose

  provideLinter: ->
    provider =
      grammarScopes: ['source.ruby', 'source.ruby.rails', 'source.ruby.rspec']
      scope: 'file'
      lintOnFly: true
      lint: (TextEditor) =>
        filePath = TextEditor.getPath()
        helpers.exec(@executablePath, [filePath]).then (output)->
          console.log output
          parsedOutput = new OutputParser(output, filePath)
          parsedOutput.messages()
