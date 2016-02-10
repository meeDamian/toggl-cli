# toggl-cli
[![Build Status](https://travis-ci.org/meeDamian/toggl-cli.svg?branch=master)](https://travis-ci.org/meeDamian/toggl-cli) [ ![Codeship Status for meeDamian/toggl-cli](https://codeship.com/projects/4651ffa0-ae14-0133-e229-0eeab60c84ba/status?branch=master)](https://codeship.com/projects/132211) [![npm version](https://badge.fury.io/js/toggl-cli.svg)](https://badge.fury.io/js/toggl-cli) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

Manage your Toggl.com time entries from the familiarity of the nearby CLI.

## Download

```
$ npm i -g toggl-cli
```

## Usage (Simple)

```
$ toggl --help

	Manage your Toggl.com time entries from the familiarity of the nearby CLI.

	Usage:
		Interactive mode:
			$ toggl

		Single request:
			$ toggl <cmd>

	Flags:
		-v --version - output version
		-h --help    - output this help
		--examples   - show usage examples
		--no-colors  - disable colors
		--save-token - save provided token and exit
		-t --token   - run with a custom token (will not be saved)
		-f --force   - (NOT recomended) prevent all confirmations

	Commands:
		c current            - see details of currently running time entry (if any).
		l list [number]      - list last <number> of time entries (default: 8)
		s smart [name]       - start or stop the entry, whatever makes more sense.
		r rename <new-name>  - rename currently running entry to <new name>.
		start [name]         - start new time entry with the given name.
		stop                 - stop running entry.
		d delete [name]      - delete latest entry with a matching name. Asks to confirm.
		b browser            - open Toggl timer in default browser.

	Note:
		→ Values in [square brackets] are optional.


$ toggl --examples

	Set default token for all future launches:
		$ toggl --save-token d9db051bf06be16c2027d3cb08769451

	List last 17 time entries for a different account:
		$ toggl --token a1ad615af03be16c2027d3dc08291457 list 17

	Run interactive mode with a different token and force no confirmations:
		$ toggl --force --token a1ad615af03be16c2027d3dc08291457

	Start a new task named "Writing toggl-cli docs":
		$ toggl start Writing toggl-cli docs
```

## Usage (Interactive)

```
Time entry management:
  s - start or stop
  r - rename
  d - delete
  p - assign to project
Recent:
  l - list last 8
  L - list last 16
Other:
  b - open Toggl in browser
  v - version
  q - quit
  h, ? - help
What do you want to do [s,r,d,p,l,L,b,v,q,h,?]?
```

## TODO

### Simple
- [ ] **delete**

### Interactive

- [ ] _almost_ everything


## Bugs and feedback

If you discover a bug please report it [here](https://github.com/meeDamian/toggl-cli/issues/new).

Mail me at bugs@meedamian.com, on twitter I'm [@meeDamian](http://twitter.com/meedamian).


## License

MIT @ [Damian Mee](https://meedamian.com)
