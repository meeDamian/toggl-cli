/* eslint no-unused-expressions: 0 */

import chai from 'chai';
import chaiSpies from 'chai-spies';
import viewsFactory from '../src/views.mjs';

chai.use(chaiSpies);

const should = chai.should();

const pass = v => v;
const ERR_MSG = 'error message';
const ERR = new Error(ERR_MSG);

const DEPS = {
	chalk: {
		red: chai.spy(pass),
		green: chai.spy(pass),
		blue: chai.spy(pass),
		dim: chai.spy(pass),
		black: chai.spy(pass),
		white: chai.spy(pass),
		bold: chai.spy(pass),
		cyan: chai.spy(pass)
	},
	core: {
		getDuration: chai.spy()
	},
	console: {
		log: chai.spy(),
		error: chai.spy()
	}
};

DEPS.chalk.cyan.bold = chai.spy(pass);

describe('views.js', () => {
	const views = viewsFactory(DEPS);

	describe('initial state', () => {
		it('should set right initial state', () => {
			should.exist(views);
			views.should.contain.keys('debug', 'dark');
			views.debug.should.be.false;
			views.dark.should.be.true;
		});
	});

	describe('#dim()', () => {
		afterEach(() => {
			DEPS.chalk.white = chai.spy(pass);
			DEPS.chalk.black = chai.spy(pass);
		});

		it('should work with dark theme', () => {
			views.dark = true;

			const val = views.dim('random text');

			should.exist(val);
			val.should.be.a('string');
			val.should.equal('random text');
			DEPS.chalk.black.should.have.been.called.once;
			DEPS.chalk.white.should.not.have.been.called();
		});

		it('should work with light theme', () => {
			views.dark = false;

			const val = views.dim('random text');

			should.exist(val);
			val.should.be.a('string');
			val.should.equal('random text');
			DEPS.chalk.white.should.have.been.called.once;
			DEPS.chalk.black.should.not.have.been.called();
		});
	});

	describe('#accent()', () => {
		afterEach(() => {
			DEPS.chalk.white = chai.spy(pass);
			DEPS.chalk.black = chai.spy(pass);
		});

		it('should work with dark theme', () => {
			views.dark = true;

			const val = views.accent('random text');

			should.exist(val);
			val.should.be.a('string');
			val.should.equal('random text');
			DEPS.chalk.white.should.have.been.called.once;
			DEPS.chalk.black.should.not.have.been.called();
		});

		it('should work with light theme', () => {
			views.dark = false;

			const val = views.accent('random text');

			should.exist(val);
			val.should.be.a('string');
			val.should.equal('random text');
			DEPS.chalk.black.should.have.been.called.once;
			DEPS.chalk.white.should.not.have.been.called();
		});
	});

	describe('#pad()', () => {
		it('should work with a string', () => {
			const out = views.pad('something');
			should.exist(out);
			out.should.be.a('string').and.contain('something');
		});

		it('should work with an array', () => {
			const out = views.pad(['something']);
			should.exist(out);
			out.should.be.a('string').and.contain('something');
		});

		it('should work consistently', () => {
			views.pad('x').should.equal(views.pad(['x']));
		});

		it('should add new lines', () => {
			const out = views.pad(['one', 'two']);
			out.split('\n').length.should.equal(4);
		});

		it('should pad non-empty lines', () => {
			const out = views.pad(['one', 'two']);
			out.should.match(/ {2}one/).and.match(/ {2}two/);
		});
	});

	describe('#errMsg()', () => {
		let err;

		before(() => {
			err = views.err;
		});

		after(() => {
			views.err = err;
		});

		it('should return function', () => {
			const out = views.errMsg();
			should.exist(out);
			out.should.be.a('function');
		});

		it('should pass re-formatted error to views.err()', done => {
			views.err = err => {
				should.exist(err);
				err.should.be.an('error');
				err.message.should.be.a('string')
					.and.contain('user message')
					.and.contain(ERR_MSG)
					.and.match(/[\w]*: [\w]*/);
				done();
			};

			const fn = views.errMsg('user message');
			fn(ERR);
		});
	});

	describe('#formatErr()', () => {
		afterEach(() => {
			DEPS.chalk.red = chai.spy(pass);
		});

		after(() => {
			views.debug = false;
		});

		it('should color error red', () => {
			const out = views.formatErr(ERR);
			should.exist(out);
			out.should.contain(ERR_MSG);
			DEPS.chalk.red.should.have.been.called.once;
		});

		it('should pad returned string', () => {
			const out = views.formatErr(ERR);
			should.exist(out);
			out.split('\n').length.should.equal(3);
			out.should.match(new RegExp(`  ${ERR_MSG}`));
		});

		it('should attach stack if debug is enabled', () => {
			views.debug = true;

			const out = views.formatErr(ERR);
			should.exist(out);
			out.split('\n').length.should.be.at.least(6);
			out.should.match(new RegExp(`  ${ERR_MSG}`))
				.and.match(/\.js:[0-9]{0,3}:[0-9]{0,3}/);
			DEPS.chalk.red.should.have.been.called.once.with(ERR_MSG);
		});
	});

	describe('#err()', () => {
		let formatErr;

		before(() => {
			formatErr = views.formatErr;
		});

		beforeEach(() => {
			views.formatErr = chai.spy(pass);
		});

		afterEach(() => {
			DEPS.console.error = chai.spy(pass);
		});

		after(() => {
			views.formatErr = formatErr;
		});

		it('should call console.error() with formatted error', () => {
			views.err(ERR);
			views.formatErr.should.have.been.called.once;
			DEPS.console.error.should.have.been.called.with(ERR);
		});

		it('should call custom fn() with formatted error', () => {
			const spy = chai.spy();

			views.err(ERR, spy);
			views.formatErr.should.have.been.called.once;
			DEPS.console.error.should.not.have.been.called();
			spy.should.have.been.called.with(ERR);
		});

		it('should respect "ignore"', () => {
			const spy = chai.spy();

			views.err(new Error('ignore'), spy);
			views.formatErr.should.not.have.been.called();
			DEPS.console.error.should.not.have.been.called();
			spy.should.not.have.been.called();

			views.err(new Error('ignore'));
			views.formatErr.should.not.have.been.called();
			DEPS.console.error.should.not.have.been.called();
		});
	});

	describe('#log()', () => {
		let pad;

		before(() => {
			pad = views.pad;
		});

		beforeEach(() => {
			views.pad = chai.spy(pass);
		});

		afterEach(() => {
			DEPS.console.log = chai.spy(pass);
		});

		after(() => {
			views.pad = pad;
		});

		it('should call console.log() with raw input', () => {
			views.log('some text');
			views.pad.should.not.have.been.called();
			DEPS.console.log.should.have.been.called.with('some text');
		});

		it('should pad when asked', () => {
			views.log('some text', true);
			views.pad.should.have.been.called.with('some text');
			DEPS.console.log.should.have.been.called.with('some text');
		});
	});

	describe('#details()', () => {
		let descriptionLine;
		let timeLine;
		let metaLine;

		before(() => {
			descriptionLine = views.descriptionLine;
			timeLine = views.timeLine;
			metaLine = views.metaLine;
		});

		beforeEach(() => {
			views.descriptionLine = chai.spy(pass);
			views.timeLine = chai.spy(pass);
			views.metaLine = chai.spy(pass);
		});

		after(() => {
			views.descriptionLine = descriptionLine;
			views.timeLine = timeLine;
			views.metaLine = metaLine;
		});

		it('should throw when no Time Entry is given', () => {
			views.details.should.throw('No timer is running.');
		});

		it('should return array of lines', () => {
			const fakeTe = {};
			views.details(fakeTe);
			views.descriptionLine.should.have.been.called.with(fakeTe);
			views.timeLine.should.have.been.called.with(fakeTe);
			views.metaLine.should.have.been.called.with(fakeTe);
		});
	});

	describe('#list()', () => {
		let listLine;

		const arr = [
			{one: 1},
			{two: 2},
			{three: 3}
		];

		before(() => {
			listLine = views.listLine;
		});

		beforeEach(() => {
			views.listLine = chai.spy(pass);
		});

		after(() => {
			views.listLine = listLine;
		});

		it('should return array with the some # of elements', () => {
			const out = views.list(arr);
			should.exist(out);
			out.should.be.an('array');
			out.length.should.equal(3);
		});

		it('should call #listLine() on each element', () => {
			views.list(arr);
			views.listLine.should.have.been.called.exactly(arr.length);
		});
	});

	describe('#started()', () => {
		let getDescription;
		let get24hour;
		let getId;

		before(() => {
			getDescription = views.getDescription;
			get24hour = views.get24hour;
			getId = views.getId;
		});

		beforeEach(() => {
			views.getDescription = chai.spy(pass);
			views.get24hour = chai.spy(pass);
			views.getId = chai.spy(pass);
		});

		afterEach(() => {
			DEPS.chalk.green = chai.spy(pass);
		});

		after(() => {
			views.getDescription = getDescription;
			views.get24hour = get24hour;
			views.getId = getId;
		});

		const mock = {
			id: 42,
			description: 'hababababab',
			start: new Date()
		};

		it('should return space-separated string', () => {
			const out = views.started(mock);
			should.exist(out);
			out.should.be.a('string');
			out.split(' ').length.should.be.at.least(4);
		});

		it('Should color action green', () => {
			views.started(mock);
			DEPS.chalk.green.should.have.been.called.with('Started');
		});

		it('should call for relevant lines', () => {
			views.started(mock);
			views.getDescription.should.have.been.called.with(mock.description);
			views.get24hour.should.have.been.called.with(mock.start);
			views.getId.should.have.been.called.with({id: mock.id});
		});
	});

	describe('#renamed()', () => {
		let getDescription;
		let getId;

		before(() => {
			getDescription = views.getDescription;
			getId = views.getId;
		});

		beforeEach(() => {
			views.getDescription = chai.spy(pass);
			views.getId = chai.spy(pass);
		});

		afterEach(() => {
			DEPS.chalk.blue = chai.spy(pass);
		});

		after(() => {
			views.getDescription = getDescription;
			views.getId = getId;
		});

		const mock = {
			id: 42,
			description: 'hababababab'
		};

		const mockName = 'oldName';

		it('should return function first', () => {
			const out = views.renamed(mockName);
			should.exist(out);
			out.should.be.a('function');
		});

		it('should return space-separated string', () => {
			const out = views.renamed(mockName)(mock);
			should.exist(out);
			out.should.be.a('string');
			out.split(' ').length.should.be.at.least(4);
		});

		it('Should color action blue', () => {
			views.renamed(mockName)(mock);
			DEPS.chalk.blue.should.have.been.called.with('Renamed');
		});

		it('should call for relevant lines', () => {
			views.renamed(mockName)(mock);
			views.getDescription.should.have.been.called.twice;
			views.getId.should.have.been.called.with({id: mock.id});
		});
	});

	describe('#stopped()', () => {
		let getDescription;
		let getDuration;
		let get24hour;
		let getId;

		before(() => {
			getDescription = views.getDescription;
			getDuration = views.getDuration;
			get24hour = views.get24hour;
			getId = views.getId;
		});

		beforeEach(() => {
			views.getDescription = chai.spy(pass);
			views.getDuration = chai.spy(pass);
			views.get24hour = chai.spy(pass);
			views.getId = chai.spy(pass);
		});

		afterEach(() => {
			DEPS.chalk.red = chai.spy(pass);
		});

		after(() => {
			views.getDescription = getDescription;
			views.getDuration = getDuration;
			views.get24hour = get24hour;
			views.getId = getId;
		});

		const mock = {
			id: 42,
			description: 'hababababab',
			stop: new Date(),
			start: new Date(),
			duration: 42
		};

		it('should return space-separated string', () => {
			const out = views.stopped(mock);
			should.exist(out);
			out.should.be.a('string');
			out.split(' ').length.should.be.at.least(6);
		});

		it('Should color action red', () => {
			views.stopped(mock);
			DEPS.chalk.red.should.have.been.called.with('Stopped');
		});

		it('should call for relevant lines', () => {
			views.stopped(mock);
			views.getDescription.should.have.been.called.with(mock.description);
			views.getDuration.should.have.been.called.with({duration: mock.duration, start: mock.start});
			views.get24hour.should.have.been.called.with(mock.start);
			views.getId.should.have.been.called.with({id: mock.id});
		});
	});

	describe('#discard()', () => {
		let pad;
		let details;

		before(() => {
			pad = views.pad;
			details = views.details;
		});

		beforeEach(() => {
			views.pad = chai.spy(pass);
			views.details = chai.spy(pass);
		});

		afterEach(() => {
			DEPS.chalk.red = chai.spy(pass);
			DEPS.chalk.cyan = {
				bold: chai.spy(pass)
			};
		});

		after(() => {
			views.pad = pad;
			views.details = details;
		});

		const mock = {
			dummy: 'property'
		};

		it('should return an array with 7 lines', () => {
			const out = views.discard(mock);
			should.exist(out);
			out.should.be.an('array');
			out.length.should.equal(7);
		});

		it('should have a red header', () => {
			views.discard(mock);
			DEPS.chalk.red.should.have.been.called.with('Discard time entry:');
		});

		it('should show padded details', () => {
			views.discard(mock);
			views.pad.should.have.been.called.with(mock);
			views.details.should.have.been.called.with(mock);
		});

		it('should show call to action', () => {
			views.discard(mock);
			DEPS.chalk.cyan.bold.should.have.been.called.with('Are you sure [y,n]?');
		});
	});

	describe('#listLine()', () => {
		let getDescription;
		let getDuration;
		let getBrackets;

		before(() => {
			getDescription = views.getDescription;
			getDuration = views.getDuration;
			getBrackets = views.getBrackets;
		});

		beforeEach(() => {
			views.getDescription = chai.spy(pass);
			views.getDuration = chai.spy(pass);
			views.getBrackets = chai.spy(pass);
		});

		afterEach(() => {
			DEPS.chalk.blue = chai.spy(pass);
		});

		after(() => {
			views.getDescription = getDescription;
			views.getDuration = getDuration;
			views.getBrackets = getBrackets;
		});

		const mock = {
			description: 'banana republic',
			duration: 42,
			start: new Date(),
			project: {}
		};

		it('should return a one-line string', () => {
			const out = views.listLine(mock, 0);
			should.exist(out);
			out.should.be.a('string');
			out.split(' ').length.should.be.at.least(3);
		});

		it('should return incremented blue idx', () => {
			views.listLine(mock, 98);
			DEPS.chalk.blue.should.have.been.called.with('99)');
		});

		it('should pad one digit idx with a space', () => {
			views.listLine(mock, 0);
			DEPS.chalk.blue.should.have.been.called.with(' 1)');
		});

		it('should call for relevant elements', () => {
			views.listLine(mock, 0);
			views.getDuration.should.have.been.called.with({duration: mock.duration, start: mock.start}, true);
			views.getDescription.should.have.been.called.with(mock.description);
			views.getBrackets.should.have.been.called.with(mock.project, true);
		});
	});

	describe('#descriptionLine()', () => {
		let getDescription;
		let getBrackets;

		before(() => {
			getDescription = views.getDescription;
			getBrackets = views.getBrackets;
		});

		beforeEach(() => {
			views.getDescription = chai.spy(pass);
			views.getBrackets = chai.spy(pass);
		});

		after(() => {
			views.getDescription = getDescription;
			views.getBrackets = getBrackets;
		});

		const mock = {
			description: 'Some random description',
			project: {}
		};

		it('should return space-separated string', () => {
			const out = views.descriptionLine(mock);
			should.exist(out);
			out.should.be.a('string');
			out.split(' ').length.should.be.at.least(2);
		});

		it('should call for relevant elements', () => {
			views.descriptionLine(mock);
			views.getDescription.should.have.been.called.with(mock.description);
			views.getBrackets.should.have.been.called.with(mock.project, true);
		});
	});

	describe('#timeLine()', () => {
		let accent;
		let getDuration;
		let get24hour;

		before(() => {
			accent = views.accent;
			getDuration = views.getDuration;
			get24hour = views.get24hour;
		});

		beforeEach(() => {
			views.accent = chai.spy(pass);
			views.getDuration = chai.spy(pass);
			views.get24hour = chai.spy(pass);
		});

		after(() => {
			views.accent = accent;
			views.getDuration = getDuration;
			views.get24hour = get24hour;
		});

		const mock = {
			duration: 42,
			start: new Date()
		};

		it('should return space-separated string', () => {
			const out = views.timeLine(mock);
			should.exist(out);
			out.should.be.a('string');
			out.split(' ').length.should.be.at.least(5);
			out.should.contain('\t');
		});

		it('should accent right stuff', () => {
			views.timeLine(mock);
			views.accent.should.have.been.called.twice;
		});

		it('should call for relevant elements', () => {
			views.timeLine(mock);
			views.getDuration.should.have.been.called.with(mock);
			views.get24hour.should.have.been.called.with(mock.start);
		});
	});

	describe('#metaLine()', () => {
		let getId;

		before(() => {
			getId = views.getId;
		});

		beforeEach(() => {
			views.getId = chai.spy(pass);
		});

		after(() => {
			views.getId = getId;
		});

		const mock = {
			id: 42
		};

		const mockProject = {
			id: 42,
			project: {}
		};

		const mockFull = {
			id: 42,
			project: {
				client: {}
			}
		};

		it('should return space-separated string', () => {
			const out = views.metaLine(mockFull);
			should.exist(out);
			out.should.be.a('string');
			out.split(' ').length.should.be.at.least(3);
		});

		it('should work without project and client', () => {
			const out = views.metaLine(mock);
			should.exist(out);
			out.should.be.a('string');
			views.getId.should.have.been.called.with({id: mock.id});
		});

		it('should work without client', () => {
			const out = views.metaLine(mockProject);
			should.exist(out);
			out.should.be.a('string');
			views.getId.should.have.been.called.twice;
		});

		it('should work when everything is present', () => {
			const out = views.metaLine(mockFull);
			should.exist(out);
			out.should.be.a('string');
			views.getId.should.have.been.called.exactly(3);
		});
	});

	describe('#getId()', () => {
		let dim;

		before(() => {
			dim = views.dim;
		});

		beforeEach(() => {
			views.dim = chai.spy(pass);
		});

		after(() => {
			views.dim = dim;
		});

		const mock = {
			id: 42
		};

		it('should return a well formatted string', () => {
			const out = views.getId(mock);
			should.exist(out);
			out.should.be.a('string');
			out.should.match(/\[\w*:#\w*\]/);
		});

		it('should dim the string', () => {
			views.getId(mock);
			views.dim.should.have.been.called.once;
		});

		it('should use "id" as a default label', () => {
			const out = views.getId(mock);
			out.should.equal('[id:#42]');
		});

		it('should use provided label instead', () => {
			const out = views.getId(mock, 'label');
			out.should.equal('[label:#42]');
		});
	});

	describe('#getDescription()', () => {
		afterEach(() => {
			DEPS.chalk.bold = chai.spy(pass);
		});

		const mock = 'Mock description';

		it('should return default description', () => {
			const out = views.getDescription();
			should.exist(out);
			out.should.be.a('string');
			out.should.equal('(no description)');
			DEPS.chalk.bold.should.not.have.been.called();
		});

		it('should return bold description', () => {
			const out = views.getDescription(mock);
			should.exist(out);
			out.should.be.a('string');
			out.should.equal(mock);
			DEPS.chalk.bold.should.have.been.called.once.with(mock);
		});
	});

	describe('#getDuration()', () => {
		beforeEach(() => {
			DEPS.core.getDuration = chai.spy(d => `${d.duration}s`);
		});

		afterEach(() => {
			DEPS.chalk.bold = chai.spy(pass);
			DEPS.chalk.green = chai.spy(pass);
		});

		after(() => {
			DEPS.core.getDuration = chai.spy();
		});

		const mockPast = {
			duration: 42,
			start: new Date().toISOString()
		};

		const start = new Date();
		start.setHours(start.getHours() - 1);

		const mockRunning = {
			duration: -42,
			start: start.toISOString()
		};

		it('should work for past entries', () => {
			const out = views.getDuration(mockPast);
			should.exist(out);
			out.should.be.a('string');
			DEPS.core.getDuration.should.have.been.called.with({duration: mockPast.duration});
		});

		it('should work for running entries', () => {
			const out = views.getDuration(mockRunning);
			should.exist(out);
			out.should.be.a('string');
			DEPS.core.getDuration.should.have.been.called.with({duration: 3600});
		});

		it('should color returned string green', () => {
			views.getDuration(mockPast);
			DEPS.chalk.green.should.have.been.called.once;
		});

		it('should bold the running entry', () => {
			views.getDuration(mockRunning);
			DEPS.chalk.bold.should.have.been.called.once;
		});

		it('should not bold the past entry', () => {
			views.getDuration(mockPast);
			DEPS.chalk.bold.should.not.have.been.called();
		});

		it('should pad to 7 characters when asked', () => {
			let out = views.getDuration(mockPast, true);
			out.length.should.equal(7);

			out = views.getDuration(mockRunning, true);
			out.length.should.equal(7);
		});
	});

	describe('#getBrackets()', () => {
		afterEach(() => {
			DEPS.chalk.red = chai.spy(pass);
			DEPS.chalk.bold = chai.spy(pass);
		});

		const mock = {
			name: 'project 42'
		};

		const mockClient = {
			name: 'project 42',
			client: {
				name: 'mice'
			}
		};

		it('should return empty string on no project', () => {
			const out = views.getBrackets();
			should.exist(out);
			out.should.be.a('string');
			out.should.be.empty;
		});

		it('should return project only', () => {
			const out = views.getBrackets(mock);
			should.exist(out);
			out.should.be.a('string');
			out.should.equal('[project 42]');
		});

		it('should color in red', () => {
			views.getBrackets(mock);
			DEPS.chalk.red.should.have.been.called.once;
		});

		it('should return project and client', () => {
			const out = views.getBrackets(mockClient);
			should.exist(out);
			out.should.be.a('string');
			out.should.match(/^\[project 42 .? mice\]$/);
		});

		it('should use • as separator', () => {
			const out = views.getBrackets(mockClient);
			should.exist(out);
			out.should.be.a('string');
			out.should.contain('•');
		});

		it('should bold the client when requested', () => {
			const out = views.getBrackets(mockClient, true);
			should.exist(out);
			out.should.be.a('string');
			out.should.contain('project 42');
			out.should.contain('mice');
			DEPS.chalk.bold.should.have.been.called.once;
		});
	});

	describe('#get24hour()', () => {
		afterEach(() => {
			DEPS.chalk.blue = chai.spy(pass);
		});

		const mock01 = new Date(0, 0, 0, 13, 1, 0).toISOString(); // 13:01
		const mock10 = new Date(0, 0, 0, 13, 10, 0).toISOString(); // 13:10

		it('should return a valid string', () => {
			const time = views.get24hour(mock01);
			should.exist(time);
			time.should.be.a('string');
			time.should.have.length.within(4, 5);
			time.should.match(/^\d{1,2}:\d{2}$/);
		});

		it('should color it blue', () => {
			views.get24hour(mock01);
			DEPS.chalk.blue.should.have.been.called.once;
		});

		it('should use colon as a separator', () => {
			const time = views.get24hour(mock01);
			time.should.contain(':');
		});

		it('should return minutes as two digits', () => {
			const time = views.get24hour(mock01);
			const hours = time.split(':')[1];
			hours.length.should.equal(2);
			hours.should.equal('01');
		});

		it('should return hour in 24-hours format', () => {
			const time = views.get24hour(mock01);
			time.split(':')[0].should.equal('13');
		});

		it('should skip prepending 0 if not necessary', () => {
			const time = views.get24hour(mock10);
			const minutes = time.split(':')[1];
			minutes.length.should.equal(2);
			minutes.should.equal('10');
		});
	});
});
