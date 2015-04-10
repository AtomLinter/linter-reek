path = require 'path'

module.exports =
  configDefaults:
    reekExecutablePath: null

  activate: ->
    console.log 'activate linter-reek'
