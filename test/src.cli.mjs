/* eslint no-unused-expressions: 0 */

import chai from 'chai';
import chaiSpies from 'chai-spies';
import cliFactory from '../src/cli.js';

chai.use(chaiSpies);

const should = chai.should();

const mocks = {
	input: {
		parse: chai.spy()
	},
	simple: {
		execute: chai.spy()
	},
	interactive: {
		FINISHED: true,
		start: chai.spy()
	},
	help: {
		getHint: chai.spy()
	},
	views: {
		log: chai.spy(),
		err: chai.spy()
	}
};

describe('cli.js#main()', () => {
	it('should export correctly', () => {
		const cli = cliFactory(mocks);

		should.exist(cli);
		cli.main.should.exist;
		cli.main.should.be.a('function');
	});

	describe('interactive mode', () => {
		const mockInput = {
			cmd: undefined,
			token: 'fakeToken'
		};

		before(() => {
			mocks.input.parse = chai.spy(() => Promise.resolve(mockInput));

			cliFactory(mocks).main();
		});

		it('should invoke input#parse()', () => {
			mocks.input.parse.should.have.been.called.once;
		});

		it('should call interactive#start() with right args', () => {
			mocks.interactive.start.should.have.been.called.once.with(mockInput);
			mocks.simple.execute.should.not.have.been.called();
			mocks.views.log.should.not.have.been.called();
			mocks.views.err.should.not.have.been.called();
		});
	});

	describe('simple mode', () => {
		const mockInput = {
			cmd: ['l'],
			token: 'fakeToken'
		};

		before(() => {
			mocks.input.parse = chai.spy(() => Promise.resolve(mockInput));
			mocks.views.log = chai.spy();
			mocks.interactive.start = chai.spy();

			cliFactory(mocks).main();
		});

		it('should invoke input#parse()', () => {
			mocks.input.parse.should.have.been.called.once;
		});

		it('should invoke simple#execute() with right args', () => {
			mocks.simple.execute.should.have.been.called.once.with(mockInput);
			mocks.interactive.start.should.not.have.been.called();
			mocks.views.log.should.not.have.been.called();
			mocks.views.err.should.not.have.been.called();
		});
	});

	describe('input parse error', () => {
		before(() => {
			mocks.input.parse = chai.spy(() => Promise.reject(new Error('Fake Error')));
			mocks.simple.execute = chai.spy();

			cliFactory(mocks).main();
		});

		it('should print the error', () => {
			mocks.views.err.should.have.been.called.once;
			mocks.simple.execute.should.not.have.been.called();
			mocks.interactive.start.should.not.have.been.called();
			mocks.views.log.should.not.have.been.called();
		});
	});
});
