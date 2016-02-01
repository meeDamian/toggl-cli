'use strict';

const should = require('chai').should();

const mocks = {
	pkg: {
		description: 'This is a test description'
	},
	chalk: {}
};

const help = require('../lib/help.js')(mocks);

describe('getShort', () => {
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

describe('getLong', () => {
	beforeEach(() => {
		mocks.chalk.gray = () => {};
	});

	it('should color \'x\' in \'xor\'', done => {
		mocks.chalk.gray = x => {
			done(x === 'x' ? undefined : new Error(`wrong letter: ${x}`));
		};

		help.getLong();
	});

	it('should be multiline', () => {
		const newLines = (help.getLong().match(/\n/g) || []).length;
		newLines.should.be.at.least(42);
	});
});
