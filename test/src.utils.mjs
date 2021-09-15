/* eslint no-unused-expressions: 0 */

import chai from 'chai';
import chaiSpies from 'chai-spies';
import utils from '../src/utils.mjs';

chai.use(chaiSpies);

const should = chai.should();

describe('utils.js', () => {
	describe('#objectify()', () => {
		it('should convert empty [array] to {empty: object}', () => {
			const emptyObject = utils.objectify([]);

			should.exist(emptyObject);
			emptyObject.should.be.an('object');
			emptyObject.should.be.empty;
		});

		it('should process numeric ID correctly', () => {
			const id = Math.floor(1e5 * Math.random());
			const array = [{id}];

			const object = utils.objectify(array);

			should.exist(object);
			object.should.be.an('object');
			object.should.not.be.empty;
			object.should.contain.all.keys(`${id}`);
			object[id].should.be.an('object');
			object[id].should.have.all.keys('id');
			object[id].id.should.be.a('number');
			object[id].id.should.equal(id);
		});

		it('should process string ID correctly', () => {
			const id = `${Math.floor(1e5 * Math.random())}`;
			const array = [{id}];

			const object = utils.objectify(array);

			should.exist(object);
			object.should.be.an('object');
			object.should.not.be.empty;
			object.should.contain.all.keys(id);
			object[id].should.be.an('object');
			object[id].should.have.all.keys('id');
			object[id].id.should.be.a('string');
			object[id].id.should.equal(id);
		});

		it('should keep the object unchanged', () => {
			const id = Math.floor(1e5 * Math.random());
			const string = 'string';
			const array = [1, string];
			const object = {string};

			const array_ = [{
				id,
				string,
				array,
				object,
			}];

			const object_ = utils.objectify(array_);

			should.exist(object_);
			object_.should.be.an('object');
			object_.should.not.be.empty;
			should.exist(object_[id]);

			const element = object_[id];
			element.should.be.an('object');
			element.should.contain.all.keys('id', 'string', 'array', 'object');
			element.id.should.equal(id);
			element.string.should.be.equal(string);
			element.array.should.be.equal(array);
			element.object.should.be.equal(object);
		});

		it('should return the same amount of valid objects', () => {
			const amount = 1024;
			const array = [...Array.from({length: amount})].map((v, id) => ({id}));
			array.length.should.equal(amount);

			const object = utils.objectify(array);

			should.exist(object);
			Object.keys(object).length.should.equal(amount);
			for (const i in Object.keys(object)) {
				if (Object.prototype.hasOwnProperty.call(object, i)) {
					object[i].should.have.property('id');
				}
			}
		});
	});

	describe('#combine()', () => {
		const parents = Object.freeze([
			{
				tid: 1,
				other: 'property',
			}, {
				tid: 7,
				other: 42,
			}, {
				tid: 33,
				other: true,
			},
		]);

		const testers = Object.freeze({
			1: {name: 'one'},
			7: {name: 'seven'},
			33: {name: 'two much'},
		});

		const SHORT = 'tid';
		const LONG = 'testers';

		let fn;
		it('should return a function', () => {
			fn = utils.combine(parents, SHORT, LONG);

			should.exist(fn);
			fn.should.be.a('function');
		});

		let merged;
		it('should replace id with object', () => {
			merged = fn(testers);

			should.exist(merged);
			merged.should.be.an('array');
			for (const element of merged) {
				element.should.not.have.property(SHORT);
				element.should.have.property(LONG);
				element[LONG].should.be.an('object');
				element[LONG].should.have.property('name');
			}
		});

		it('should preserve other properties', () => {
			for (const element of merged) {
				element.should.have.property('other');
				element.should.not.be.empty;
			}
		});

		it('should leave objects w/o id unchanged', () => {
			const OBJ = {only: 'other'};

			const fn = utils.combine([OBJ], SHORT, LONG);

			should.exist(fn);
			fn.should.be.a('function');

			const merged = fn(testers);
			should.exist(merged);
			merged.should.be.an('array');
			merged.should.not.be.empty;
			merged.length.should.equal(1);
			merged[0].should.equal(OBJ);
		});
	});

	describe('#attach()', () => {
		const dict = [{
			id: 1, sth: 'banana',
		}, {
			id: 3, sth: 'prime',
		}, {
			id: 5, sth: true,
		}];

		const parents = [{
			id: 1,
			name: 'one',
			tid: 1,
		}, {
			id: 2,
			name: 'three',
			tid: 3,
		}, {
			id: 3,
			name: 'five',
			tid: 5,
		}];

		const TOKEN = 'test token';
		const SHORT = 'tid';
		const LONG = 'testers';
		const DEPS = false;

		const spy = chai.spy(() => Promise.resolve(dict));

		let fn;
		it('should return a function', () => {
			fn = utils.attach(spy, TOKEN, SHORT, LONG, DEPS);
			should.exist(fn);
			fn.should.be.a('function');
		});

		it('should merge properly', done => {
			fn(parents)
				.then(out => {
					spy.should.have.been.called.once;
					spy.should.have.been.called.with(TOKEN, {ids: [1, 3, 5], deps: DEPS});
					for (const element of out) {
						element.should.contain.all.keys('name', 'id', LONG);
						element.should.not.have.property(SHORT);
						element.name.should.be.a('string');
						element.id.should.be.a('number');
						should.exist(element[LONG]);
						element[LONG].should.be.an('object');
						element[LONG].should.contain.all.keys('id', 'sth');
						element[LONG].id.should.be.a('number');
					}

					done();
				})
				.catch(done);
		});
	});

	describe('#pass()', () => {
		const ARG = 'random string';

		it('should be a noop for noarg', () => {
			const fn = utils.pass();
			should.exist(fn);
			fn.should.be.a('function');

			const output = fn(ARG);
			should.exist(output);
			output.should.equal(ARG);
		});

		it('should call passed fn', () => {
			const spy = chai.spy();
			const fn = utils.pass(spy);
			should.exist(fn);
			fn.should.be.a('function');

			const output = fn(ARG);
			should.exist(output);
			output.should.equal(ARG);
			spy.should.have.been.called.once;
		});
	});
});
