'use strict';

let me = {};

me.xxx = function (_) { };

me = require('mee')(module, me, {
	toggl: require('../toggl.js')
});
