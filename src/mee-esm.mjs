function wrap(me, fn, dependencies) {
	fn = fn.__orig || fn;
	const newFn = fn.bind(me, dependencies);
	newFn.__orig = fn;
	return newFn;
}

function dependify(exportedObject, fieldsToExport, dependencies) {
	if (dependencies) {
		for (const key in fieldsToExport) {
			if (Object.prototype.hasOwnProperty.call(fieldsToExport, key)) {
				const field = fieldsToExport[key];
				if (typeof field === 'function') {
					const wrappedFunction = wrap(exportedObject, field, dependencies);
					exportedObject[key] = wrappedFunction.bind(exportedObject);
				} else {
					exportedObject[key] = field;
				}
			}
		}
	}

	return exportedObject;
}

export default function meeEsm(fieldsToExport, dependencies) {
	const exportedFunc = overriddenDependencies => dependify({}, fieldsToExport, overriddenDependencies);
	return dependify(exportedFunc, fieldsToExport, dependencies);
}
