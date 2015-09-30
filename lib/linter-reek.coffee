{BufferedProcess, CompositeDisposable} = require 'atom'
OutputParser = require './output-parser'

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
      name: 'reek'
      grammarScopes: ['source.ruby', 'source.ruby.rails', 'source.ruby.rspec']
      scope: 'file'
      lintOnFly: true
      lint: (TextEditor) =>
        new Promise (resolve, reject) =>
          filePath = TextEditor.getPath()
          parsedOutput = null
          process = new BufferedProcess
            command: @executablePath
            args: [filePath]
            stdout: (output) ->
              console.log output
              parsedOutput = new OutputParser(output, filePath)
            exit: (code) ->
              return resolve [] unless code is 2
              resolve parsedOutput.messages()

          process.onWillThrowError ({error,handle}) ->
            atom.notifications.addError "Failed to run #{@executablePath}",
            detail: "#{error.message}"
            dismissable: true
            handle()
            resolve
