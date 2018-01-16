/**
 * async-utility
 * 
 * @desc	Utilities for async-await programming
 * @author	vincent-yao27 (姚裕欣)
 * @version	0.3.0
 * 
 * Copyright © 2017 vincent-yao27 (姚裕欣)
 * 
 * https://github.com/vincent-yao27/async-utility.git
 * Released under GPL-3.0 license
 */

/**
 * import dependency
 */
const assert = require("assert");

/**
 * Syntactic sugar for making a Promise
 * @param {function} func	a promisable function, whose params are (resolve, reject)
 * @return {Promise}
 */
let mkp = exports.mkp = function(func) {
	assert(typeof func === "function", "mkp: function required");
	return new Promise(func);
};

/**
 * Delays in an async function, used by following await
 * Example: async () => { someWork(); await delay(1000); someWork(); }
 * @param {number} milliseconds
 * @return {Promise}
 */
exports.delay = function delay(milliseconds) {
	return mkp(resolve => {
		setTimeout(resolve, milliseconds);
	});
};

/**
 * Promisify an async function
 * @param {function} func		a nodejs function, whose last param is a callback(err, result)
 * @param {Number} returnValues	number of return values. An array will be returned if it is not set to 1. 0 means return all as an array.
 * @return {Promise}
 */
exports.promisify = function promisify(func, returnValues = 1) {
	assert("function" === typeof func, "func requires a function type arg");
	assert(returnValues >= 0, "returnValues must not be less than 0");

	return function(...args) {
		return new Promise((resolve, reject) => {
			func(...args, (err, ...result) => {
				if (err) return reject(err);

				if (returnValues === 0) {
					return resolve(result);
				} else if (returnValues === 1) {
					return resolve(result[0]);
				} else {
					return resolve(result.slice(0, returnValues));
				}
			});
		});
	};
};

/**
 * Class Queue
 * Every instance is a function. Call the instance to enqueue async functions.
 * The async functions will be invoked in sequence.
 * 
 * The instance function returns a Promise, which is resolved with the return value of the async function.
 * And the promise is resolved without a return value when errors occurred in current or
 * previous async functions, while it is never rejected.
 * 
 * If there are errors occurred in from any async function in the queue,
 * the queue will be emptied and a rejected Promise with error info will be returned when call done().
 */
exports.Queue = class Queue {
	constructor() {
		/**
		 * The instance function to enqueue an async function or an array
		 * @param {function | Array} item
		 * @param {*} args
		 * @returns {Promise}
		 */
		function queue(item, ...args) {
			if (typeof item === "function") {
				return queueFunc(item, args);
			} else if (item instanceof Array) {
				return queueArray(item);
			} else {
				assert(false, "queue: require an async function or an array");
			}
		}

		let functionQueue = [];

		let isFinished = true;

		function queueFunc(func, args) {
			let done;
			let promise = mkp(resolve => done = resolve);
			functionQueue.push({ func, args, done });
			if (isFinished) {
				runner();
				isFinished = false;
			}
			return promise;
		}

		function queueArray(array) {
			let results = [];
			for (const elem of array) {
				results.push(queue(elem));
			}
			return Promise.all(results);
		}

		async function runner() {
			let done;
			queue.donePromise = mkp(resolve => done = resolve);

			let next;
			while (typeof(next = functionQueue.shift()) !== "undefined") {
				if (queue.rejection) {
					next.done();
					continue;
				}

				try {
					let result = await next.func(...next.args);
					next.done(result);
				} catch (err) {
					next.done();
					queue.rejection = err;
				}
			}
			isFinished = true;
			done();
		}
		
		Object.setPrototypeOf(queue, Object.getPrototypeOf(this));

		return queue;
	}

	/**
	 * Returns a Promise, which is resolved when this queue is empty
	 * and is rejected when errors occurred in the queue.
	 * @returns {Promise}
	 */
	async done() {
		await this.donePromise;
		if (this.rejection) {
			let rejection = this.rejection;
			delete this.rejection;
			return Promise.reject(rejection);
		}
	}
};