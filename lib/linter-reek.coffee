{BufferedProcess, CompositeDisposable} = require 'atom'
helpers = require 'atom-linter'
path = require 'path'

module.exports =
  config:
    executablePath:
      type: 'string'
      description: 'The path to the Reek executable. Find by running `which reek` or `rbenv which reek`'
      default: 'reek'

  activate: ->
    require('atom-package-deps').install()
      .then -> console.log 'All dependencies installed.'
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.config.observe 'linter-reek.executablePath', (executablePath) =>
      @executablePath = executablePath
    console.log 'Reek linter is now activated.'
    console.log "Command path: #{@executablePath}"

  deactivate: ->
    @subscriptions.dispose

  messages: (output, params) ->
    helpers.parse(output, '(\\[)(?<line>\\d+)(, \\d+)*\\]:(?<message>.*)', params).map (message) ->
      message.type = 'warning'
      pattern = /\[(https:\/\/github\.com\/troessner\/reek\/blob\/master\/docs\/)(.+)(\.md)\]/
      messageHtml = message.text.replace(pattern, "[<a href='$1$2$3'>$2</a>]")
      message.html = messageHtml
      delete message['text']
      message

  provideLinter: ->
    provider =
      name: 'reek'
      grammarScopes: ['source.ruby', 'source.ruby.rails', 'source.ruby.rspec']
      scope: 'file'
      lintOnFly: true
      lint: (TextEditor) =>
        filePath = TextEditor.getPath()
        execOpts = {cwd: path.dirname(filePath), ignoreExitCode: true}
        helpers.exec(@executablePath, [filePath], execOpts).then (output) =>
          @messages(output, filePath: filePath)
