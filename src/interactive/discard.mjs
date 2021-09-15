import logger from 'log-update';
import meeEsm from '../mee-esm.mjs';
import toggl from '../toggl.mjs';
import views from '../views.mjs';
import utils from '../utils.mjs';

const me = {};

me.getState = function ({toggl}, token, id, exit) {
	function confirm() {
		toggl.deleteTimeEntry(token, id)
			.then(exit, exit);
	}

	return {
		y: confirm,
		n: exit,
	};
};

me.act = function ({toggl, views, logger, utils}, token, state) {
	toggl.getCurrentTimeEntry(token, true)
		.then(utils.pass(entry => {
			state.set(this.getState(token, entry.id, state.exit));
		}))
		.then(views.discard)
		.then(x => logger(x.join('\n')));
};

export default meeEsm(me, {logger, toggl, views, utils});
