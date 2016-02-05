/* eslint no-unused-expressions: 0 */
'use strict';

const chai = require('chai');
chai.use(require('chai-spies'));
const should = chai.should();

const utils = require('../src/utils.js');

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
			const arr = [{id}];

			const obj = utils.objectify(arr);

			should.exist(obj);
			obj.should.be.an('object');
			obj.should.not.be.empty;
			obj.should.contain.all.keys(`${id}`);
			obj[id].should.be.an('object');
			obj[id].should.have.all.keys('id');
			obj[id].id.should.be.a('number');
			obj[id].id.should.equal(id);
		});

		it('should process string ID correctly', () => {
			const id = `${Math.floor(1e5 * Math.random())}`;
			const arr = [{id}];

			const obj = utils.objectify(arr);

			should.exist(obj);
			obj.should.be.an('object');
			obj.should.not.be.empty;
			obj.should.contain.all.keys(id);
			obj[id].should.be.an('object');
			obj[id].should.have.all.keys('id');
			obj[id].id.should.be.a('string');
			obj[id].id.should.equal(id);
		});

		it('should keep the object unchanged', () => {
			const id = Math.floor(1e5 * Math.random());
			const string = 'string';
			const array = [1, string];
			const object = {string};

			const arr = [{
				id,
				string,
				array,
				object
			}];

			const obj = utils.objectify(arr);

			should.exist(obj);
			obj.should.be.an('object');
			obj.should.not.be.empty;
			should.exist(obj[id]);

			const el = obj[id];
			el.should.be.an('object');
			el.should.contain.all.keys('id', 'string', 'array', 'object');
			el.id.should.equal(id);
			el.string.should.be.equal(string);
			el.array.should.be.equal(array);
			el.object.should.be.equal(object);
		});

		it('should return the same amount of valid objects', () => {
			const amount = 1024;
			const arr = Array(...Array(amount)).map((v, id) => ({id}));
			arr.length.should.equal(amount);

			const obj = utils.objectify(arr);

			should.exist(obj);
			Object.keys(obj).length.should.equal(amount);
			for (const i in Object.keys(obj)) {
				if (obj.hasOwnProperty(i)) {
					obj[i].should.have.property('id');
				}
			}
		});
	});

	describe('#combine()', () => {
		const parents = Object.freeze([
			{
				tid: 1,
				other: 'property'
			}, {
				tid: 7,
				other: 42
			}, {
				tid: 33,
				other: true
			}
		]);

		const testers = Object.freeze({
			1: {name: 'one'},
			7: {name: 'seven'},
			33: {name: 'two much'}
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
			for (const el of merged) {
				el.should.not.have.property(SHORT);
				el.should.have.property(LONG);
				el[LONG].should.be.an('object');
				el[LONG].should.have.property('name');
			}
		});

		it('should preserve other properties', () => {
			for (const el of merged) {
				el.should.have.property('other');
				el.should.not.be.empty;
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
		const dict = [
			{
				id: 1,
				sth: 'banana'
			},
			{
				id: 3,
				sth: 'prime'
			},
			{
				id: 5,
				sth: true
			}
		];

		const parents = [
			{
				id: 1,
				name: 'one',
				tid: 1
			},
			{
				id: 2,
				name: 'three',
				tid: 3
			},
			{
				id: 3,
				name: 'five',
				tid: 5
			}
		];

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
					for (const el of out) {
						el.should.contain.all.keys('name', 'id', LONG);
						el.should.not.have.property(SHORT);
						el.name.should.be.a('string');
						el.id.should.be.a('number');
						el[LONG].should.be.an('object');
						el[LONG].should.contain.all.keys('id', 'sth');
						el[LONG].id.should.be.a('number');
					}
					done();
				})
				.catch(done);
		});
	});

	describe('#getPackage()', () => {
		let pkg;

		before(() => {
			pkg = utils.getPackage();
		});

		it('should return a valid object', () => {
			should.exist(pkg);
			pkg.should.be.an('object');
		});

		it('should have all required properties', () => {
			pkg.should.contain.all.keys('description', 'version', 'name');
			pkg.version.should.be.a('string');
			pkg.version.should.match(/^\d{0,3}\.\d{0,3}\.\d{0,3}$/);
			pkg.description.should.be.a('string');
			pkg.description.should.not.be.empty;
			pkg.name.should.be.a('string');
			pkg.name.should.not.be.empty;
		});
	});
});
