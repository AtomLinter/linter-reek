process = new BufferedProcess
            command: @executablePath
            args: [filePath, '--json']
            stdout: (data) ->
              json.push data
            exit: (code) ->
              return resolve [] unless code is 0
              info = try JSON.parse json.join('\n')
              return resolve [] unless info?
              return resolve [] if info.passed
              resolve info.errors.map (error) ->
                type: error.type,
                text: error.message,
                filePath: error.file or filePath,
                range: [
                  # Atom expects ranges to be 0-based
                  [error.lineStart - 1, error.charStart - 1],
                  [error.lineEnd - 1, error.charEnd]
                ]

          process.onWillThrowError ({error,handle}) ->
            atom.notifications.addError "Failed to run #{@executablePath}",
              detail: "#{error.message}"
              dismissable: true
            handle()
            resolve []
