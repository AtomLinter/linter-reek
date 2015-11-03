{BufferedProcess, CompositeDisposable} = require 'atom'
helpers = require "atom-linter"

module.exports =
  config:
    executablePath:
      type: 'string'
      description: 'The path to the Reek executable. Find by running `which reek` or `rbenv which reek`'
      default: 'reek'

  activate: ->
    require('atom-package-deps').install('linter-reek', true)
      .then -> console.log 'All dependencies installed.'
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.config.observe 'linter-reek.executablePath', (executablePath) => @executablePath = executablePath
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
      name: 'reek'
      grammarScopes: ['source.ruby', 'source.ruby.rails', 'source.ruby.rspec']
      scope: 'file'
      lintOnFly: true
      lint: (TextEditor) =>
        filePath = TextEditor.getPath()
        helpers.exec(@executablePath, [filePath]).then (output)=>
          @messages(output, filePath: filePath)
