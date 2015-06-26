path = require 'path'
child_process = require 'child_process'

module.exports = class LinterProvider
  # A regex pattern used to extract information from the executable's output.
  regex = ///
  '.+?\[(\d+)]:'
  '(.+)'
  ///
  getCommand = -> atom.config.get 'linter-reek.reekExecutablePath'
  getCommandWithFile = (file) -> "#{getCommand()} #{file}"

  lint: (TextEditor) ->
    new Promise (Resolve) ->
      file = path.basename TextEditor.getPath()
      cwd = path.dirname TextEditor.getPath()
      fullPath = TextEditor.getPath()
      data = []
      command = getCommandWithFile fullPath
      console.log "Linter command: #{command}"
      process = child_process.exec command, {cwd: cwd}
      process.stderr.on 'data', (d) -> data.push d.toString()
      process.on 'close', ->
        toReturn = []
        for line in data
          if line.match regex
            [line_number, message] = line.match(regex)[1..2]
            toReturn.push(
              type: 'warning'
              text: message
              filePath: path.join(cwd, file).normalize()
              range: line_number
            )
        Resolve toReturn
