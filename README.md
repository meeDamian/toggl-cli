# toggl-cli
[![Build Status](https://travis-ci.org/chester1000/toggl-cli.svg?branch=master)](https://travis-ci.org/chester1000/toggl-cli) [![npm version](https://badge.fury.io/js/toggl-cli.svg)](https://badge.fury.io/js/toggl-cli) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

Manage your Toggl.com time entries from the familiarity of the nearby CLI.

## Download

```
$ npm i -g toggl-cli
```

## Notice

**Everything is subject to change.**

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
	--save-token - save provided token and exit
	-t --token   - run with a custom token (will not be saved)
	-f --force   - (NOT recomended) prevent all confirmations

Commands:
	b                    - open in default browser.
	n now                - see details of currently running time entry (if any).
	s [name]             - start xor stop the entry, whatever makes more sense.
	start [name]         - start new time entry with the given name.
	stop [name]          - stop running entry. If name is provided, stop only if matches.
	r rename <new-name>  - rename the last entry to <new name>. Asks to confirm.
	d delete [name]      - delete latest entry with matching name. Asks to confirm.
	l list [number]      - list last <number> of time entries (default: 8)
	p project "<name>" "<project>"  - add project to time entry
	c client  "<name>" "<client>"   - add client to time entry

Notes:
	→ Two last commands require quotes.
	→ All values in [square brackets] are optional.

Examples:
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
  o - open Toggl in browser
  v - version
  q - quit
  h, ? - help
What do you want to do [s,r,d,p,l,L,o,v,q,h,?]?

```

## TODO

### Simple
- [ ] **list** of entries with an optional amount
- [ ] get the entry running **now**
- [ ] smart start/stop
- [ ] start
- [ ] stop
- [ ] launch in browser
- [ ] change description
- [ ] change project
- [ ] finish this list

### Interactive

- [ ] create this list


## Bugs and feedback

If you discover a bug please report it [here](https://github.com/chester1000/toggl-cli/issues/new).

Mail me at bugs@meedamian.com, on twitter I'm [@meeDamian](http://twitter.com/meedamian).


## License

MIT @ [Damian Mee](https://meedamian.com)
