import input from './input.mjs';
import interactive from './interactive/index.mjs';
import meeEsm from './mee-esm.mjs';
import simple from './simple.mjs';
import views from './views.mjs';

function main({input, simple, interactive, views}) {
	input.parse()
		.then(input => {
			views.dark = input.dark;
			views.debug = input.debug;

			if (!input.cmd) {
				interactive.start(input);
				return;
			}

			simple.execute(input);
		})
		.catch(views.err);
}

export default meeEsm({main}, {views, input, simple, interactive});

