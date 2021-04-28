'use strict';

const should = require('chai').should();

describe('toggl.js', () => {
	const toggl = require('../src/toggl.js')({});

	describe('#DEFS', () => {
		it('should have URLs defined', () => {
			should.exist(toggl.URL);
			should.exist(toggl.TIMER_URL);
			should.exist(toggl.API_URL);

			toggl.URL.should.be.a('string');
			toggl.API_URL.should.be.a('string');
			toggl.TIMER_URL.should.be.a('string');
			toggl.URL.should.match(/^https:\/\//);
			toggl.URL.should.match(/api.track.toggl.com/);
			toggl.API_URL.should.match(/\/api/);
			toggl.TIMER_URL.should.match(/\/timer/);
		});

		it('should have API_VER defined', () => {
			should.exist(toggl.API_VER);
			toggl.API_VER.should.be.a('string');
			toggl.API_VER.should.match(/^v8$/);
		});

		const ENDPOINT_PROPS = ['method', 'endpoint'];

		it('should have "time_entries" endpoints properly defined', () => {
			should.exist(toggl.DEFS);
			toggl.DEFS.should.be.an('object');
			toggl.DEFS.should.have.any.keys('timeEntry');

			const keys = [
				'create',
				'current',
				'delete',
				'details',
				'list',
				'start',
				'stop',
				'update'
			];

			const te = toggl.DEFS.timeEntry;
			te.should.contain.all.keys(keys);
			for (const key of keys) {
				te[key].should.contain.all.keys(ENDPOINT_PROPS);
			}
		});

		it('should have "projects" endpoints properly defined', () => {
			should.exist(toggl.DEFS);
			toggl.DEFS.should.be.an('object');
			toggl.DEFS.should.have.any.keys('project');

			const keys = [
				'details'
			];

			const p = toggl.DEFS.project;
			p.should.contain.all.keys(keys);
			for (const key of keys) {
				p[key].should.contain.all.keys(ENDPOINT_PROPS);
			}
		});

		it('should have "clients" endpoints properly defined', () => {
			should.exist(toggl.DEFS);
			toggl.DEFS.should.be.an('object');
			toggl.DEFS.should.have.any.keys('client');

			const keys = [
				'details'
			];

			const c = toggl.DEFS.client;
			c.should.contain.all.keys(keys);
			for (const key of keys) {
				c[key].should.contain.all.keys(ENDPOINT_PROPS);
			}
		});
	});

	describe('#buildUrl()', () => {
		it('should exist and be exported', () => {
			should.exist(toggl.buildUrl);
			toggl.buildUrl.should.be.a('function');
		});

		it('should throw on no endpoint', () => {
			const fn = () => {
				toggl.buildUrl(toggl.API_VER, undefined);
			};

			fn.should.throw(Error, /endpoint/);
		});

		const endpoint = 'endpoint_test';

		it('should return a string', () => {
			const url = toggl.buildUrl(undefined, endpoint);

			should.exist(url);
			url.should.be.a('string');
		});

		it('should contain Toggl url', () => {
			const url = toggl.buildUrl(undefined, endpoint);

			should.exist(url);
			url.should.be.a('string');
			url.should.match(new RegExp(`^${toggl.URL}`));
		});

		it('should set endpoint from `string` correctly', () => {
			const url = toggl.buildUrl(undefined, endpoint);

			should.exist(url);
			url.should.be.a('string');
			url.should.match(new RegExp(`/${endpoint}$`));
		});

		it('should set endpoint from `array` correctly', () => {
			const endpoint = ['time_entries', 'start'];
			const url = toggl.buildUrl(undefined, endpoint);

			should.exist(url);
			url.should.be.a('string');
			url.should.match(new RegExp(`/${endpoint[0]}/`));
			url.should.match(new RegExp(`/${endpoint[1]}$`));
		});

		it('should use default version', () => {
			const DEFAULT_VERSION = 'v8';

			const url = toggl.buildUrl(undefined, endpoint);

			should.exist(url);
			url.should.be.a('string');
			url.should.match(new RegExp(`/${DEFAULT_VERSION}/`));
		});

		it('should set custom API version', () => {
			const version = 'v9';

			const url = toggl.buildUrl(version, endpoint);

			should.exist(url);
			url.should.be.a('string');
			url.should.match(new RegExp(`/${version}/`));
		});

		it('should replace with :id with `id` provided', () => {
			const endpoint = ['time_entries', ':id', 'stop'];
			const id = 6666;

			const url = toggl.buildUrl(undefined, endpoint, id);

			should.exist(url);
			url.should.be.a('string');
			url.should.match(new RegExp(`/${endpoint[0]}/`));
			url.should.match(new RegExp(`/${id}/`));
			url.should.match(new RegExp(`/${endpoint[2]}$`));
		});
	});
});