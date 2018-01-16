# async-utility
Utilities to create Promises for async-await programming.
## Install
$ npm install async-utility
## Example
```js
const readFile = promisify(require("fs").readFile);
const fileNames = ["file1", "file2"];
(async () => {
	let files = await paralMap(fileNames, (val) => {
		return readFile(val, "utf8");
	});
	for (let f of files) {
		console.log(f);
	}
})();
```
## License
GPL-3.0