/* eslint no-unused-expressions: 0 */

import chai from 'chai';
import chaiSpies from 'chai-spies';
import chaiAsPromised from 'chai-as-promised';
import configFactory from '../src/config.js';

chai.use(chaiSpies);
chai.use(chaiAsPromised);

const should = chai.should();

const pass = v => v;

const DEPS = {
	path: {
		resolve: chai.spy(pass)
	},
	fs: {
		outputJson: chai.spy(pass)
	},
	process: {
		env: {
			HOME: undefined,
			USERPROFILE: undefined
		}
	},
	require: chai.spy(pass)
};

const config = configFactory(DEPS);

describe('config.js', () => {
	describe('#getPath()', () => {
		beforeEach(() => {
			DEPS.path.resolve = chai.spy(pass);
		});

		afterEach(() => {
			DEPS.process.env.HOME = undefined;
			DEPS.process.env.USERPROFILE = undefined;
		});

		after(() => {
			DEPS.path.resolve = chai.spy(pass);
		});

		it('should use HOME if set', () => {
			DEPS.process.env.HOME = 'banana';
			config.getPath();
			DEPS.path.resolve.should.have.been.called.with('banana');
		});

		it('should fall back to USERPROFILE if HOME not set', () => {
			DEPS.process.env.USERPROFILE = 'orange';
			config.getPath();
			DEPS.path.resolve.should.have.been.called.with('orange');
		});

		it('should resolve on the right path', () => {
			config.getPath();
			DEPS.path.resolve.should.have.been.called.with(undefined, '.config/toggl-cli/config.json');
		});
	});

	describe('#open()', () => {
		let getPath;

		before(() => {
			getPath = config.getPath;
		});

		afterEach(() => {
			config.getPath = chai.spy(pass);
			DEPS.require = chai.spy(pass);
		});

		after(() => {
			config.getPath = getPath;
		});

		it('should call require with output of getPath()', () => {
			config.getPath = chai.spy(() => 'a path');
			const out = config.open();
			config.getPath.should.have.been.called.once;
			DEPS.require.should.have.been.called.with('a path');
			should.exist(out);
			out.should.equal('a path');
		});

		it('should return null if require throws', () => {
			DEPS.require = chai.spy(() => {
				throw new Error('fake error');
			});

			const out = config.open();
			config.getPath.should.have.been.called.once;
			DEPS.require.should.have.been.called.once;
			should.not.exist(out);
		});
	});

	describe('#get()', () => {
		let open;

		before(() => {
			open = config.open;
		});

		after(() => {
			config.open = open;
		});

		const mock = {
			something: 'here'
		};

		it('should reject if no config', () => {
			config.open = chai.spy(() => undefined);
			return config.get().should.be.rejectedWith('no config exists');
		});

		it('should resolve with config', () => {
			config.open = chai.spy(() => mock);
			return config.get().should.eventually.equal(mock);
		});
	});

	describe('#save()', () => {
		let getPath;
		let open;

		before(() => {
			getPath = config.getPath;
			open = config.open;
		});

		beforeEach(() => {
			DEPS.fs.outputJson = chai.spy((_, __, ___, cb) => cb());
			config.getPath = chai.spy(() => 'a path');
			config.open = chai.spy();
		});

		after(() => {
			config.getPath = getPath;
			config.open = open;
			DEPS.fs.outputJson = chai.spy(pass);
		});

		const mock = {
			token: 'AAAAaaaaaaaa1'
		};

		it('should create new config', () => {
			config.open = chai.spy(() => undefined);
			return config.save(mock).should.eventually.deep.equal(mock);
		});

		it('should override invalid config', () => {
			config.open = chai.spy(() => 'not an object');
			return config.save(mock).should.eventually.deep.equal(mock);
		});

		it('should merge config with existing', () => {
			config.open = chai.spy(() => ({dark: true}));
			return config.save(mock).should.eventually.deep.equal({
				dark: true,
				token: mock.token
			});
		});

		it('should save correctly', () => {
			config.save(mock);
			DEPS.fs.outputJson.should.have.been.called.once.with('a path', mock, {spaces: 2});
		});

		it('should reject if save fails', () => {
			DEPS.fs.outputJson = chai.spy((_, __, ___, cb) => cb(new Error('fake error')));
			return config.save(mock).should.eventually.be.rejectedWith('fake error');
		});
	});
});
