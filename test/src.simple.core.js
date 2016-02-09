/* eslint no-unused-expressions: 0 */
'use strict';

const chai = require('chai');
chai.use(require('chai-spies'));
const should = chai.should();

describe('simple/core.js', () => {
	const core = require('../src/simple/core.js');

	describe('CONSTANTS', () => {
		it('should export MIN_IN_SEC', () => {
			should.exist(core.MIN_IN_SEC);
			core.MIN_IN_SEC.should.be.a('number');
			core.MIN_IN_SEC.should.equal(60);
		});

		it('should export HOUR_IN_SEC', () => {
			should.exist(core.HOUR_IN_SEC);
			core.HOUR_IN_SEC.should.be.a('number');
			core.HOUR_IN_SEC.should.equal(60 * 60);
		});

		it('should export DAY_IN_SEC', () => {
			should.exist(core.DAY_IN_SEC);
			core.DAY_IN_SEC.should.be.a('number');
			core.DAY_IN_SEC.should.equal(60 * 60 * 24);
		});
	});

	describe('#isEntryRunning()', () => {
		it('should work for positive values', () => {
			const state = core.isEntryRunning({duration: Number(new Date())});
			should.exist(state);
			state.should.be.a('boolean');
			state.should.be.false;
		});

		it('should work for negative values', () => {
			const state = core.isEntryRunning({duration: -new Date()});
			should.exist(state);
			state.should.be.a('boolean');
			state.should.be.true;
		});
	});

	describe('#to24hour()', () => {
		const iso8601string = new Date(0, 0, 0, 13, 1, 0).toISOString(); // 13:01

		const time = core.to24hour(iso8601string);

		it('should return a valid string', () => {
			should.exist(time);
			time.should.be.a('string');
			time.should.have.length.within(4, 5);
			time.should.match(/^\d{1,2}:\d{2}$/);
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

			const time = core.to24hour(iso8601string);

			const minutes = time.split(':')[1];
			minutes.length.should.equal(2);
			minutes.should.equal('10');
		});
	});

	describe('#getDurationStr()', () => {
		it('should return empty string for zero duration', () => {
			const zeroDur = core.getDurationStr({duration: 0});
			should.exist(zeroDur);
			zeroDur.should.be.a('string');
			zeroDur.should.be.empty;
		});

		it('should skip empty outer values', () => {
			let dur = core.getDurationStr({duration: 42});
			should.exist(dur);
			dur.should.equal('42s');

			dur = core.getDurationStr({duration: 5 * 60});
			should.exist(dur);
			dur.should.equal('5m');

			dur = core.getDurationStr({duration: 2 * 60 * 60});
			should.exist(dur);
			dur.should.equal('2h');

			dur = core.getDurationStr({duration: 15 * 60 * 60 * 24});
			should.exist(dur);
			dur.should.equal('15d');
		});

		it('should skip empty middle values', () => {
			let duration = 15 + 1 * 60 * 60;
			let dur = core.getDurationStr({duration});
			should.exist(dur);
			dur.should.equal('1h 15s');

			duration = 30 * 60 + 2 * 60 * 60 * 24;
			dur = core.getDurationStr({duration});
			should.exist(dur);
			dur.should.equal('2d 30m');

			duration = 45 + 3 * 60 * 60 * 24;
			dur = core.getDurationStr({duration});
			should.exist(dur);
			dur.should.equal('3d 45s');
		});

		it('should return neighbour combinations', () => {
			let duration = 5 + 4 * 60;
			let dur = core.getDurationStr({duration});
			should.exist(dur);
			dur.should.equal('4m 5s');

			duration = 5 * 60 + 4 * 60 * 60;
			dur = core.getDurationStr({duration});
			should.exist(dur);
			dur.should.equal('4h 5m');

			duration = 5 * 60 * 60 + 3 * 60 * 60 * 24;
			dur = core.getDurationStr({duration});
			should.exist(dur);
			dur.should.equal('3d 5h');
		});

		it('should truncate the least significant fields', () => {
			let duration = 1 + 2 * 60 + 3 * 60 * 60;
			let dur = core.getDurationStr({duration});
			should.exist(dur);
			dur.should.equal('3h 2m');

			duration = 59 + 23 * 60 * 60 + 1 * 60 * 60 * 24;
			dur = core.getDurationStr({duration});
			should.exist(dur);
			dur.should.equal('1d 23h');
		});
	});

	describe('#getDuration()', () => {
		it('should return an object', () => {
			const dur = core.getDuration({duration: 1});

			should.exist(dur);
			dur.should.be.an('object');
			dur.should.have.all.keys('durStr', 'isCurrent');
			dur.durStr.should.be.a('string');
			dur.isCurrent.should.be.a('boolean');
		});

		it('should return unpadded string', () => {
			const dur = core.getDuration({duration: 1}, false);

			should.exist(dur);
			dur.should.be.an('object');
			dur.durStr.should.exist;
			dur.durStr.length.should.be.at.most(6);
			dur.isCurrent.should.equal(false);
		});

		it('should return padded string', () => {
			const dur = core.getDuration({duration: 1}, true);

			should.exist(dur);
			dur.should.be.an('object');
			dur.durStr.should.exist;
			dur.durStr.length.should.equal(7);
			dur.isCurrent.should.equal(false);
		});

		it('should return current duration of ongoing timer', () => {
			const start = new Date();
			start.setMinutes(start.getMinutes() - 10);
			start.setSeconds(start.getSeconds() - 3);

			const dur = core.getDuration({duration: -1, start: start.toISOString()});

			should.exist(dur);
			dur.should.be.an('object');
			dur.durStr.should.exist;
			dur.durStr.should.equal('10m 3s');
			dur.isCurrent.should.equal(true);
		});
	});

	describe('#getBrackets()', () => {
		it('should return empty string on no project', () => {
			const brackets = core.getBrackets(undefined);

			should.exist(brackets);
			brackets.should.be.a('string');
			brackets.should.be.empty;
		});

		it('should return project only', () => {
			const mock = {
				name: 'project 42'
			};

			const brackets = core.getBrackets(mock);

			should.exist(brackets);
			brackets.should.be.a('string');
			brackets.should.equal('[project 42]');
		});

		it('should return project and client', () => {
			const mock = {
				name: 'project 42',
				client: {
					name: 'mice'
				}
			};

			const brackets = core.getBrackets(mock);

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

			const brackets = core.getBrackets(mock);

			should.exist(brackets);
			brackets.should.be.a('string');
			brackets.should.contain('•');
		});

		it('should run provided function on client', () => {
			const mock = {
				name: 'project 42',
				client: {
					name: 'mice'
				}
			};

			const mockFn = chai.spy(v => v);

			const brackets = core.getBrackets(mock, mockFn);

			should.exist(brackets);
			brackets.should.be.a('string');
			brackets.should.contain('project 42');
			brackets.should.contain('mice');
			mockFn.should.have.been.called.once;
		});
	});
});
