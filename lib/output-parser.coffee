class OutputParser
  constructor: (@output, @filePath)->

  messages: ->
    messages = @output.split('\n').filter (message) -> message != ''
    messages.shift()

    messages.map (message) =>
      type: 'warning'
      text: @formattedMessage(message)
      filePath: @filePath
      range: @range(message)


  formattedMessage: (message)->
    message.match(/[^:]*$/g)[0]

  range: (message)->
    rangeStart = message.match(/\[([0-9]+)(, [0-9]+)*\]/)
    return 0 unless rangeStart?

    rangeStart = parseInt(rangeStart[1])
    columnEnd = @formattedMessage(message).length

    [[rangeStart - 1, 0], [rangeStart - 1, columnEnd - 1]]

module.exports = OutputParser
