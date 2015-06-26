module.exports =
  config:
    reekExecutablePath:
      type: 'string'
      description: 'The path to the Reek executable. Find by running `which reek` or `rbenv which reek`'
      default: 'reek'

  activate: ->
    atom.notifications.addError(
      'Linter package not found.',
      {
        detail: 'Please install or enable the `linter` package in your Settings view.'
      }
    ) unless atom.packages.getLoadedPackages 'linter'
    console.log 'Reek linter is now activated.'

  provideLinter: ->
    LinterProvider = require './provider'
    provider = new LinterProvider()
    return {
      grammarScopes: ['source.ruby', 'source.ruby.rails', 'source.ruby.rspec']
      scope: 'file'
      lint: provider.lint
      lintOnFly: true
    }
