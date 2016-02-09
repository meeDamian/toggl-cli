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
		});

		it('should export HOUR_IN_SEC', () => {
			should.exist(core.HOUR_IN_SEC);
			core.HOUR_IN_SEC.should.be.a('number');
		});

		it('should export DAY_IN_SEC', () => {
			should.exist(core.DAY_IN_SEC);
			core.DAY_IN_SEC.should.be.a('number');
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
		const iso8601string = '2000-01-01T19:01:00.000Z';
		const out = core.to24hour(iso8601string);

		it('should return a valid string', () => {
			should.exist(out);
			out.should.be.a('string');
			out.should.have.length.within(4, 5);
			out.should.match(/^\d{1,2}:\d{2}$/);
		});

		it('should use colon as a separator', () => {
			out.should.contain(':');
		});

		it('should return minutes as two digits', () => {
			out.split(':')[1].length.should.equal(2);
		});

		it('should return hour in 24-hours format', () => {
			out.split(':')[0].should.equal(13);
		});
	});
});
