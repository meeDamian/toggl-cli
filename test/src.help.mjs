/* eslint no-unused-expressions: 0 */

import chai from 'chai';
import chaiSpies from 'chai-spies';
import helpFactory from '../src/help.mjs';

chai.use(chaiSpies);

const should = chai.should();

const mocks = {
	pkg: {
		description: 'This is a test description',
	},
	chalk: {
		bold: chai.spy(v => v),
		dim: chai.spy(v => v),
		white: chai.spy(v => v),
		black: chai.spy(v => v),
	},
	pad: chai.spy(v => v),
};

const help = helpFactory(mocks);

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
				.and.contain('b')
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
			lowerShortHelp.should.contain('time entry');
			lowerShortHelp.should.contain('other');
		});

		it('should mention all commands', () => {
			const shortHelp = help.getShort();
			shortHelp.should.contain(' c ⇾');
			shortHelp.should.contain(' s ⇾');
			shortHelp.should.contain(' r ⇾');
			shortHelp.should.contain(' d ⇾');
			shortHelp.should.contain(' p ⇾');
			shortHelp.should.contain(' l ⇾');
			shortHelp.should.contain(' L ⇾');
			shortHelp.should.contain(' b ⇾');
			shortHelp.should.contain(' v ⇾');
			shortHelp.should.contain(' q ⇾');
			shortHelp.should.contain(' ? ⇾');
			shortHelp.should.contain(' h, ');
		});

		it('should be multiline', () => {
			const newLines = (help.getShort().match(/\n/g) || []).length;
			newLines.should.be.equal(7);
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
			const array = help.getLong();

			should.exist(array);
			array.should.be.an('array');
			array.length.should.be.at.least(31);
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
			const array = help.getHint();

			should.exist(array);
			array.should.be.an('array');
			array.length.should.be.at.least(5);
		});
	});

	describe('#getExamples()', () => {
		beforeEach(() => {
			mocks.chalk.bold = chai.spy();
			mocks.pad = chai.spy(v => v);
		});

		it('should use standard view', () => {
			help.getExamples();
			mocks.pad.should.have.been.called.once;
		});

		it('should have at least 2 examples.', () => {
			help.getExamples();
			mocks.chalk.bold.should.have.been.called.at.least(2);
		});

		it('should be multiline', () => {
			const array = help.getExamples();

			should.exist(array);
			array.should.be.an('array');
			array.length.should.be.at.least(10);
		});
	});
});
