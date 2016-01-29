'use strict';

const mocks = {
	pkg: {
		description: 'This is a test description'
	},
	chalk: {
		gray: v => {
			console.log(v);
		}
	}
};

const help = require('../lib/help.js')(mocks);


console.log(help.getLong());
