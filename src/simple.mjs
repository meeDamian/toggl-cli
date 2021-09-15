import open from 'open';
import toggl from './toggl.mjs';
import help from './help.mjs';
import views from './views.mjs';
import meeEsm from './mee-esm.mjs';

const me = {};

me.getCurrent = function ({toggl}, token, deps = true) {
	return toggl.getCurrentTimeEntry(token, deps);
};

me.showCurrent = function ({views}, token) {
	this.getCurrent(token)
		.then(views.details)
		.then(views.pad)
		.then(views.log)
		.catch(views.err);
};

me.list = function ({views, toggl}, token, parameters) {
	Promise.resolve()
		.then(() => {
			if (parameters[0] === undefined || !isNaN(parameters[0])) {
				return {limit: parameters[0]};
			}

			return Promise.resolve(parameters.map(p => p.toLowerCase()))
				.then(parameters => {
					if (parameters[0] === 'today') {
						return 0;
					}

					if (parameters[0] === 'yesterday') {
						return 1;
					}

					if (parameters[0] === 'last') {
						const days = ['sun', 'sat', 'fri', 'thu', 'wed', 'tue', 'mon'];

						// Shift array so that item at [0] is yesterday
						let i = new Date().getDay();
						while (--i) {
							days.unshift(days.pop());
						}

						// Add one dummy value as idx [0], to have `days.indexOf(day)` match the shift required
						days.unshift(undefined);

						const requested = parameters[1].trim().slice(0, 3);
						if (!days.includes(requested)) {
							throw new Error(`Sorry, I don't know how to show entries from "last ${requested}".`);
						}

						return days.indexOf(requested);
					}
				})
				.then(shift => new Date(new Date().setDate(new Date().getDate() - shift)))
				.then(date => ({date}));
		})
		.then(options => {
			toggl.getTimeEntries(token, options)
				.then(views.list)
				.then(views.pad)
				.then(views.log)
				.catch(views.err);
		});
};

me.projects = function ({toggl, views}, token) {
	Promise.resolve()
		.then(() => {
			toggl.getProjects(token, {})
				.then(views.projects)
				.then(views.pad)
				.then(views.log)
				.catch(views.err);
		});
};

me.clients = function ({toggl, views}, token) {
	Promise.resolve()
		.then(() => {
			toggl.fetchClientList(token)
				.then(views.clients)
				.then(views.pad)
				.then(views.log)
				.catch(views.err);
		});
};

me.start = function ({toggl, views}, token, description) {
	Promise.resolve(description)
		.then(which => {
			if (!which || isNaN(which) || which > 16) {
				return {description};
			}

			const limit = Number.parseFloat(which);

			return toggl.getTimeEntries(token, {limit, deps: false})
				.then(entries => entries[limit - 1])
				.then(({description, pid, billable, tags}) => ({description, pid, billable, tags}));
		})
		.then(this.recurseDescriptionTags)
		.then(entryData => this.parseProjectToken(token, entryData))
		.then(entryData => toggl.startTimeEntry(token, entryData))
		.then(views.started)
		.then(views.pad)
		.then(views.log)
		.catch(views.err);
};

me.recurseDescriptionTags = function (_, timeEntry) {
	const {description} = timeEntry;

	const words = description.split(' ');
	const firstWord = words.shift();

	if (!firstWord.includes(':')) {
		return timeEntry;
	}

	const [key, value] = firstWord.split(':');

	switch (key) {
		case 'project': case 'proj':
			timeEntry.projectToken = value;
			timeEntry.description = words.join(' ');
			return this.recurseDescriptionTags(timeEntry);

		case 'billable': case 'bill':
			timeEntry.billable = (value === 'yes' || value === '1');
			timeEntry.description = words.join(' ');
			return this.recurseDescriptionTags(timeEntry);

		case 'tag':
			if (!Array.isArray(timeEntry.tags)) {
				timeEntry.tags = [];
			}

			timeEntry.tags.push(value);
			timeEntry.description = words.join(' ');
			return this.recurseDescriptionTags(timeEntry);
		default:
			// If we don't recognize the tag, assume that colon must be part of the name of the task.
			return timeEntry;
	}
};

me.parseProjectToken = function ({toggl}, token, timeEntry) {
	const {projectToken} = timeEntry;

	// Time Entry has no project defined
	if (projectToken === undefined) {
		return timeEntry;
	}

	const projectTokenInt = Number.parseInt(projectToken, 10);
	// The project defined is probably Toggl project ID
	if (!isNaN(projectTokenInt) && projectTokenInt > 16) {
		timeEntry.pid = projectToken;
		return timeEntry;
	}

	// The project defined is either an internal number, or a partial string
	return Promise.resolve()
		.then(() => toggl.fetchProjectsList(token))
		.then(projects => {
			if (isNaN(projectTokenInt)) {
				const foundProject = projects.find(item => {
					const itemName = item.name.toLowerCase().replace('_', ' ');
					const tokenName = projectToken.toLowerCase().replace('_', ' ');

					return (itemName.includes(tokenName));
				});

				if (foundProject !== undefined) {
					timeEntry.pid = foundProject.id;
					delete timeEntry.projectToken;
				}
			} else {
				const projectIndex = projectTokenInt - 1;
				timeEntry.pid = projects[projectIndex].id;
				delete timeEntry.projectToken;
			}

			return timeEntry;
		});
};

me.rename = function ({toggl, views}, token, newName) {
	this.getCurrent(token)
		.then(entry => {
			if (!entry) {
				throw new Error('No timer is running…');
			}

			const {id, description} = entry;
			if (description === newName) {
				throw new Error('Can\'t rename to the same…');
			}

			return {id, description};
		})
		.then(({id, description}) => toggl.updateTimeEntry(token, id, {description: newName})
			.then(views.renamed(description))
			.then(views.pad)
			.then(views.log))
		.catch(views.err);
};

me.smart = function (_, token, description) {
	if (description) {
		this.start(token, description);
		return;
	}

	this.getCurrent(token, false)
		.then(current => {
			if (!current) {
				this.start(token, description);
				return;
			}

			this.stop(token, current.id);
		});
};

me.stop = function ({toggl, views}, token, id) {
	return toggl.stopTimeEntry(token, id)
		.then(views.stopped)
		.then(views.pad)
		.then(views.log);
};

me.stopCurrent = function ({views}, token) {
	this.getCurrent(token)
		.then(entry => {
			if (!entry) {
				throw new Error('No timer is running…');
			}

			return this.stop(token, entry.id);
		})
		.catch(views.err);
};

me.execute = function ({open, help, views, toggl}, {cmd, token}) {
	switch (cmd[0].toLowerCase()) {
		case 'list': case 'l': case 'ls':
			this.list(token, cmd.splice(1));
			break;

		case 'current': case 'c': case 'top':
			this.showCurrent(token);
			break;

		case 'smart': case 's':
			this.smart(token, cmd.splice(1).join(' '));
			break;

		case 'start': case 'up':
			this.start(token, cmd.splice(1).join(' '));
			break;

		case 'stop': case 'down':
			this.stopCurrent(token);
			break;

		case 'rename': case 'r': case 'mv':
			this.rename(token, cmd.splice(1).join(' '));
			break;

		case 'browser': case 'b': case 'open':
			open(toggl.TIMER_URL);
			break;

		case 'projects': case 'pr':
			this.projects(token);
			break;

		case 'clients': case 'cl':
			this.clients(token);
			break;

		default:
			views.log(help.getHint());
	}
};

export default meeEsm(me, {open, toggl, help, views});
