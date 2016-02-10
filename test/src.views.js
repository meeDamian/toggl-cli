/* eslint no-unused-expressions: 0 */
'use strict';

const chai = require('chai');
chai.use(require('chai-spies'));
const should = chai.should();

const pass = v => v;

const mocks = {
	chalk: {
		red: chai.spy(pass),
		green: chai.spy(pass),
		blue: chai.spy(pass),
		dim: chai.spy(pass),
		black: chai.spy(pass),
		white: chai.spy(pass),
		bold: chai.spy(pass)
	},
	core: {
		getDuration: chai.spy()
	},
	console: {
		log: chai.spy(),
		error: chai.spy()
	}
};

describe('views.js', () => {
	const views = require('../src/views.js')(mocks);

	describe('#get24hour()', () => {
		const iso8601string = new Date(0, 0, 0, 13, 1, 0).toISOString(); // 13:01

		const time = views.get24hour(iso8601string);

		it('should return a valid string', () => {
			should.exist(time);
			time.should.be.a('string');
			time.should.have.length.within(4, 5);
			time.should.match(/^\d{1,2}:\d{2}$/);
		});

		it('should color it blue', () => {
			mocks.chalk.blue.should.have.been.called.once;
		});

		it('should use colon as a separator', () => {
			time.should.contain(':');
		});

		it('should return minutes as two digits', () => {
			const hours = time.split(':')[1];

			hours.length.should.equal(2);
			hours.should.equal('01');
		});

		it('should return hour in 24-hours format', () => {
			time.split(':')[0].should.equal('13');
		});

		it('should skip prepending 0 if not necessary', () => {
			const iso8601string = new Date(0, 0, 0, 13, 10, 0).toISOString();

			const time = views.get24hour(iso8601string);

			const minutes = time.split(':')[1];
			minutes.length.should.equal(2);
			minutes.should.equal('10');
		});

		after(() => {
			mocks.chalk.blue = chai.spy(pass);
		});
	});

	describe('#getDuration()', () => {
		before(() => {
			mocks.core.getDuration = () => '';
		});

		it('should return a string', () => {
			const dur = views.getDuration({duration: 1});

			should.exist(dur);
			dur.should.be.a('string');
		});

		it('should color it green', () => {
			mocks.chalk.green.should.have.been.called.once;
		});

		it('should return unpadded string', () => {
			const dur = views.getDuration({duration: 1}, false);

			should.exist(dur);
			dur.should.be.a('string');
			dur.length.should.be.at.most(1);
			mocks.chalk.bold.should.not.have.been.called();
		});

		it('should return padded string', () => {
			const dur = views.getDuration({duration: 1}, true);

			should.exist(dur);
			dur.should.be.a('string');
			dur.length.should.equal(7);
			mocks.chalk.bold.should.not.have.been.called();
		});

		it('should return current duration of ongoing timer', () => {
			const FORMATTED = '10m 3s';

			const start = new Date();
			start.setMinutes(start.getMinutes() - 10);
			start.setSeconds(start.getSeconds() - 3);

			mocks.core.getDuration = chai.spy(() => FORMATTED);

			const dur = views.getDuration({duration: -1, start: start.toISOString()});

			should.exist(dur);
			dur.should.be.a('string');
			dur.should.equal('10m 3s');
			mocks.chalk.bold.should.have.been.called.once;
			mocks.core.getDuration.should.have.been.called.once.with({duration: 603});
		});

		after(() => {
			mocks.chalk.bold = chai.spy(pass);
			mocks.chalk.green = chai.spy(pass);
			mocks.core.getDuration = chai.spy();
		});
	});

	describe('#getBrackets()', () => {
		it('should return empty string on no project', () => {
			const brackets = views.getBrackets(undefined);

			should.exist(brackets);
			brackets.should.be.a('string');
			brackets.should.be.empty;
		});

		it('should return project only', () => {
			const mock = {
				name: 'project 42'
			};

			const brackets = views.getBrackets(mock);

			should.exist(brackets);
			brackets.should.be.a('string');
			brackets.should.equal('[project 42]');
		});

		it('should color in red', () => {
			mocks.chalk.red.should.have.been.called.once;
		});

		it('should return project and client', () => {
			const mock = {
				name: 'project 42',
				client: {
					name: 'mice'
				}
			};

			const brackets = views.getBrackets(mock);

			should.exist(brackets);
			brackets.should.be.a('string');
			brackets.should.match(/^\[project 42 .? mice\]$/);
		});

		it('should use • as separator', () => {
			const mock = {
				name: 'project 42',
				client: {
					name: 'mice'
				}
			};

			const brackets = views.getBrackets(mock);

			should.exist(brackets);
			brackets.should.be.a('string');
			brackets.should.contain('•');
		});

		it('should bald the client, if asked', () => {
			const mock = {
				name: 'project 42',
				client: {
					name: 'mice'
				}
			};

			const brackets = views.getBrackets(mock, true);

			should.exist(brackets);
			brackets.should.be.a('string');
			brackets.should.contain('project 42');
			brackets.should.contain('mice');
			mocks.chalk.bold.should.have.been.called.once;
		});

		after(() => {
			mocks.chalk.bold = chai.spy(pass);
			mocks.chalk.red = chai.spy(pass);
		});
	});
});
