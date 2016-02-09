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
});
