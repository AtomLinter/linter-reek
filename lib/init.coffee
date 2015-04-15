module.exports =
  config:
    reekExecutablePath:
      type: 'string'
      default: ''

  activate: ->
    console.log 'activate linter-reek'
