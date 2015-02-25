LinterReekView = require './linter-reek-view'
{CompositeDisposable} = require 'atom'

module.exports = LinterReek =
  linterReekView: null
  modalPanel: null
  subscriptions: null

  activate: (state) ->
    @linterReekView = new LinterReekView(state.linterReekViewState)
    @modalPanel = atom.workspace.addModalPanel(item: @linterReekView.getElement(), visible: false)

    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace', 'linter-reek:toggle': => @toggle()

  deactivate: ->
    @modalPanel.destroy()
    @subscriptions.dispose()
    @linterReekView.destroy()

  serialize: ->
    linterReekViewState: @linterReekView.serialize()

  toggle: ->
    console.log 'LinterReek was toggled!'

    if @modalPanel.isVisible()
      @modalPanel.hide()
    else
      @modalPanel.show()
