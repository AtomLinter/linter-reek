{BufferedProcess, CompositeDisposable} = require 'atom'
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

  messages: (output, params)->
    helpers.parse(output, '(\\[)(?<line>\\d+)(, \\d+)*\\]:(?<message>.*)', params).map (message)->
      message.type = 'warning'
      message

  provideLinter: ->
    provider =
      grammarScopes: ['source.ruby', 'source.ruby.rails', 'source.ruby.rspec']
      scope: 'file'
      lintOnFly: true
      lint: (TextEditor) =>
        filePath = TextEditor.getPath()
        helpers.exec(@executablePath, [filePath]).then (output)=>
          @messages(output, filePath: filePath)
