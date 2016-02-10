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
	describe('#getMicro()', () => {
		it('should contain all available options', () => {
			const micro = help.getMicro();

			should.exist(micro);
			micro.split('[')[1]
				.should.contain('s')
				.and.contain('r')
				.and.contain('d')
				.and.contain('p')
				.and.contain('l')
				.and.contain('L')
				.and.contain('o')
				.and.contain('v')
				.and.contain('q')
				.and.contain('h')
				.and.contain('?');
		});
	});

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
			shortHelp.should.contain(' s -');
			shortHelp.should.contain(' r -');
			shortHelp.should.contain(' d -');
			shortHelp.should.contain(' p -');
			shortHelp.should.contain(' l -');
			shortHelp.should.contain(' L -');
			shortHelp.should.contain(' o -');
			shortHelp.should.contain(' v -');
			shortHelp.should.contain(' q -');
			shortHelp.should.contain(' ? -');
			shortHelp.should.contain(' h, ');
		});

		it('should be multiline', () => {
			const newLines = (help.getShort().match(/\n/g) || []).length;
			newLines.should.be.at.least(10);
		});
	});

	describe('#getLong()', () => {
		beforeEach(() => {
			mocks.pad = chai.spy(v => v);
		});

		it('should use standard view', () => {
			help.getLong();
			mocks.pad.should.have.been.called.once;
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
