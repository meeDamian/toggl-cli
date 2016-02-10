/* eslint no-unused-expressions: 0 */
'use strict';

const chai = require('chai');
chai.use(require('chai-spies'));
const should = chai.should();

const mocks = {
	pkg: {
		description: 'This is a test description'
	},
	chalk: {},
	pad: chai.spy(v => v)
};

const help = require('../src/help.js')(mocks);

describe('help.js', () => {
	describe('#getShort()', () => {
		it('should mention all categories', () => {
			const shortHelp = help.getShort();
			should.exist(shortHelp);
			shortHelp.should.not.be.empty;

			const lowerShortHelp = shortHelp.toLowerCase();
			lowerShortHelp.should.contain('time entry management:');
			lowerShortHelp.should.contain('recent:');
			lowerShortHelp.should.contain('other:');
		});

		it('should mention all commands', () => {
			const shortHelp = help.getShort();
			shortHelp.should.contain(' s -').and.match(/(\[|,)s(\]|,)/);
			shortHelp.should.contain(' r -').and.match(/(\[|,)r(\]|,)/);
			shortHelp.should.contain(' d -').and.match(/(\[|,)d(\]|,)/);
			shortHelp.should.contain(' p -').and.match(/(\[|,)p(\]|,)/);
			shortHelp.should.contain(' l -').and.match(/(\[|,)l(\]|,)/);
			shortHelp.should.contain(' L -').and.match(/(\[|,)L(\]|,)/);
			shortHelp.should.contain(' o -').and.match(/(\[|,)o(\]|,)/);
			shortHelp.should.contain(' v -').and.match(/(\[|,)v(\]|,)/);
			shortHelp.should.contain(' q -').and.match(/(\[|,)q(\]|,)/);
			shortHelp.should.contain(' h, ').and.match(/(\[|,)h(\]|,)/);
			shortHelp.should.contain(' ? -').and.match(/(\[|,)\?(\]|,)/);
		});

		it('should be multiline', () => {
			const newLines = (help.getShort().match(/\n/g) || []).length;
			newLines.should.be.at.least(10);
		});
	});

	describe('#getLong()', () => {
		beforeEach(() => {
			mocks.chalk.gray = chai.spy();
			mocks.pad = chai.spy(v => v);
		});

		it('should use standard view', () => {
			help.getLong();
			mocks.pad.should.have.been.called.once;
		});

		it('should color \'x\' in \'xor\'', () => {
			help.getLong();
			mocks.chalk.gray.should.have.been.called.once;
		});

		it('should be multiline', () => {
			const arr = help.getLong();

			should.exist(arr);
			arr.should.be.an('array');
			arr.length.should.be.at.least(30);
		});
	});

	describe('#getHint()', () => {
		beforeEach(() => {
			mocks.pad = chai.spy(v => v);
		});

		it('should use standard view', () => {
			help.getHint();
			mocks.pad.should.have.been.called.once;
		});

		it('should contain more important keywords', () => {
			const hint = help.getHint().join('\n');

			should.exist(hint);
			hint.should.contain('current', 'start', 'stop', 'browser', 'help', 'list', 'rename', 'delete');
		});

		it('should be multiline', () => {
			const arr = help.getHint();

			should.exist(arr);
			arr.should.be.an('array');
			arr.length.should.be.at.least(5);
		});
	});

	describe('#getExamples()', () => {
		beforeEach(() => {
			mocks.chalk.white = chai.spy();
			mocks.pad = chai.spy(v => v);
		});

		it('should use standard view', () => {
			help.getExamples();
			mocks.pad.should.have.been.called.once;
		});

		it('should color descriptions', () => {
			help.getExamples();
			mocks.chalk.white.should.have.been.called.exactly(4);
		});

		it('should be multiline', () => {
			const arr = help.getExamples();

			should.exist(arr);
			arr.should.be.an('array');
			arr.length.should.be.at.least(10);
		});
	});
});
