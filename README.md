[![apm](https://img.shields.io/apm/dm/linter-reek.svg)](https://atom.io/packages/linter-reek) [![apm](https://img.shields.io/apm/v/linter-reek.svg)](https://atom.io/packages/linter-reek) [![apm](https://img.shields.io/apm/l/linter-reek.svg)](https://atom.io/packages/linter-reek)
[![Build Status](https://travis-ci.org/AtomLinter/linter-reek.svg?branch=master)](https://travis-ci.org/AtomLinter/linter-reek)

# linter-reek

This plugin for [Linter](https://github.com/AtomLinter/Linter) provides an
interface to [Reek](https://github.com/troessner/reek). It will be used with
files that use the Ruby syntax.

## Installation

Linter must be installed in order to use this plugin. It is a hard dependency.
If Linter is not installed, please follow the instructions
[here](https://github.com/AtomLinter/Linter).

### Installing Reek

Before using this plugin, you must ensure that `reek` is installed on your
system. To install `reek`, do the following:

1.  Install [ruby](https://www.ruby-lang.org/).

2.  Install [Reek](https://github.com/troessner/reek) by typing the following
    in a terminal:

    ```ShellSession
    gem install reek
    ```

Now you can proceed to install the linter-reek plugin.

### Installing the Plugin

```ShellSession
$ apm install linter-reek
```

## Settings

You can configure linter-reek from its settings panel or by editing
`~/.atom/config.cson` (choose Open Your Config in Atom menu). The only thing
that needs to be configured is the path to the `reek` executable.

### Executable Path

```coffeescript
'linter-reek':
  'reekExecutablePath': /path/to/your/reek/here
```

Run `which reek` to find the path (if you're using rbenv run
`rbenv which reek`).

**Note**: This plugin finds the nearest `config.reek` file and will
automatically use it if it exists. If it does not, `reek` will run with its
default settings.
