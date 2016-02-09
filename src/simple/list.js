'use strict';

let me = {};

me.printList = function ({views}, entries) {
	views.log(entries.map(views.oneLine).join('\n'));
};

me.show = function ({views, toggl}, token, amount) {
	toggl.getTimeEntries(token, {amount, deps: true})
		.then(me.printList)
		.catch(views.err);
};

me = require('mee')(module, me, {
	views: require('../views.js'),
	toggl: require('../toggl.js')
});
