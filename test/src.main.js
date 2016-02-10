/* eslint no-unused-expressions: 0 */
'use strict';

const chai = require('chai');
chai.use(require('chai-spies'));
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

describe('main.js#main()', () => {
	it('should export correctly', () => {
		const main = require('../src/main.js')(mocks);
		should.exist(main);
		main.main.should.exist;
		main.main.should.be.a('function');
	});

	describe('interactive mode', () => {
		const mockInput = {
			cmd: undefined,
			token: 'fakeToken',
			force: false
		};

		before(() => {
			mocks.input.parse = chai.spy(() => Promise.resolve(mockInput));

			require('../src/main.js')(mocks).main();
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

	describe('[temp] interactive mode', () => {
		const mockInput = {
			cmd: undefined
		};

		before(() => {
			mocks.interactive.FINISHED = false;
			mocks.input.parse = chai.spy(() => Promise.resolve(mockInput));
			mocks.interactive.start = chai.spy();

			require('../src/main.js')(mocks).main();
		});

		it('should invoke input#parse()', () => {
			mocks.input.parse.should.have.been.called.once;
		});

		it('should print err message', () => {
			mocks.views.log.should.have.been.called.once;
			mocks.help.getHint.should.have.been.called.once;
			mocks.interactive.start.should.not.have.been.called();
			mocks.simple.execute.should.not.have.been.called();
			mocks.views.err.should.not.have.been.called();
		});
	});

	describe('simple mode', () => {
		const mockInput = {
			cmd: ['l'],
			token: 'fakeToken',
			farce: true
		};

		before(() => {
			mocks.input.parse = chai.spy(() => Promise.resolve(mockInput));
			mocks.views.log = chai.spy();

			require('../src/main.js')(mocks).main();
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

			require('../src/main.js')(mocks).main();
		});

		it('should print the error', () => {
			mocks.views.err.should.have.been.called.once;
			mocks.simple.execute.should.not.have.been.called();
			mocks.interactive.start.should.not.have.been.called();
			mocks.views.log.should.not.have.been.called();
		});
	});
});
