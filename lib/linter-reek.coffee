{BufferedProcess, CompositeDisposable} = require 'atom'

module.exports =
  config:
    executablePath:
      type: 'string'
      description: 'The path to the Reek executable. Find by running `which reek` or `rbenv which reek`'
      default: 'reek'

  activate: ->
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.config.get 'linter-reek.executablePath', (executablePath) =>
      @executablePath = executablePath
    atom.notifications.addError(
      'Linter package not found.',
      {
        detail: 'Please install or enable the `linter` package in your Settings view.'
      }
    ) unless atom.packages.getLoadedPackages 'linter'
    console.log 'Reek linter is now activated.'

  deactivate: ->
    @subscriptions.dispose

  provideLinter: ->
    provider =
      grammarScopes: ['source.ruby', 'source.ruby.rails', 'source.ruby.rspec']
      scope: 'file'
      lintOnFly: true
      lint: (TextEditor) =>
        new Promise (resolve, reject) =>
          file = TextEditor.getPath()
          data = []
          process = new BufferedProcess
            command: @reekExecutablePath
            args: [file, '-f json']
            stdout: (output) ->
              data.push output
            exit: (code) ->
              return resolve [] unless code is 2
              info = try JSON.parse data.join('\n')
              return resolve [] unless info?
              return resolve [] if info.passed
              resolve info.errors.map (error) ->
                type: 'warning'
                text: "#{error.context} #{error.message} (#{error.smell_type})"
                filePath: error.source or file
                range: [error.lines - 1]

          process.onWillThrowError ({error,handle}) ->
            atom.notifications.addError "Failed to run #{@executablePath}",
            detail: "#{error.message}"
            dismissable: true
            handle()
            resolve
