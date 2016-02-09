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
	console: {
		log: chai.spy(),
		error: chai.spy()
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
		});
	});

	describe('[temp] interactive mode', () => {
		const mockInput = {
			cmd: undefined
		};

		before(() => {
			mocks.interactive.FINISHED = false;
			mocks.input.parse = chai.spy(() => Promise.resolve(mockInput));

			require('../src/main.js')(mocks).main();
		});

		it('should invoke input#parse()', () => {
			mocks.input.parse.should.have.been.called.once;
		});

		it('should print err message', () => {
			mocks.console.log.should.have.been.called.once;
			mocks.help.getHint.should.have.been.called.once;
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

			require('../src/main.js')(mocks).main();
		});

		it('should invoke input#parse()', () => {
			mocks.input.parse.should.have.been.called.once;
		});

		it('should invoke simple#execute() with right args', () => {
			mocks.simple.execute.should.have.been.called.once.with(mockInput);
		});
	});

	describe('input parse error', () => {
		before(() => {
			mocks.input.parse = chai.spy(() => Promise.reject(new Error('Fake Error')));

			require('../src/main.js')(mocks).main();
		});

		it('should print the error', () => {
			mocks.console.error.should.have.been.called.once;
		});
	});
});
