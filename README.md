linter-reek
=========================

This linter plugin for [Linter](https://github.com/AtomLinter/Linter) provides an interface to [Reek](https://github.com/troessner/reek). It will be used with files that have the “Ruby” syntax.

## Installation
Linter package must be installed in order to use this plugin. If Linter is not installed, please follow the instructions [here](https://github.com/AtomLinter/Linter).

### reek installation
Before using this plugin, you must ensure that `reek` is installed on your system. To install `reek`, do the following:

1. Install [ruby](https://www.ruby-lang.org/).

2. Install [Reek](https://github.com/troessner/reek) by typing the following in a terminal:
   ```
   gem install reek
   ```

Now you can proceed to install the linter-reek plugin.

### Plugin installation
```
$ apm install linter-reek
```

## Settings
You can configure linter-reek by editing ~/.atom/config.cson (choose Open Your Config in Atom menu):

#### reekExecutablePath
```
'linter-reek':
  'reekExecutablePath': null # reek path.
```
Run `which reek` to find the path,
if you using rbenv run `rbenv which reek`

**Note**: This plugin finds the nearest .reek.yml file and uses the --config command line argument to use that file, so you may not use the --config argument in the linter settings.

## Contributing
If you would like to contribute enhancements or fixes, please do the following:

1. Fork the plugin repository.
1. Hack on a separate topic branch created from the latest `master`.
1. Commit and push the topic branch.
1. Make a pull request.
1. welcome to the club

Please note that modifications should follow these coding guidelines:

- Indent is 2 spaces.
- Code should pass coffeelint linter.
- Vertical whitespace helps readability, don’t be afraid to use it.

Thank you for helping out!

## Donation
[![Share the love!](https://techtalkers.files.wordpress.com/2012/07/buy-me-a-beer-button.jpg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=Q7588UPXABV3A)
