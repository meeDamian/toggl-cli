/* eslint no-unused-expressions: 0 */
'use strict';

const should = require('chai').should();
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

		// it('should return the same amount of objects', () => {
		// 	const amount = 1024;
		// 	const arr = [...Array(amount).keys()];
		//
		// 	const obj = utils.objectify(arr)
		// });
	});
});
