/**
 * electron-arduino
 * main.js
 * 
 * @author	Vincent Yao (姚裕欣)
 * @author	vincent_yao27@163.com
 * @version	1.0.0
 * 
 * Copyright © 2017 Vincent Yao (姚裕欣)
 * 
 * Released under GPL-3.0 license
 */

const path = require("path");
const url = require("url");
const { app, BrowserWindow, ipcMain } = require("electron");
const SerialPort = require("serialport");
const { promisify } = require("./async-utility");

["list"].forEach((name) => SerialPort[name] = promisify(SerialPort[name]));

let win;

async function createWindow() {
	win = new BrowserWindow({ width: 1024, height: 768 });
	win.loadURL(url.format({
		pathname: path.join(__dirname, "index.html"),
		protocol: "file:",
		slashes: true
	}));
	win.on("close", function () {
		win = null;
	})
	// win.webContents.openDevTools();
}

let port;

app.on("ready", createWindow);

app.on("window-all-closed", () => {
	if (port) {
		port.close(() => {
			app.quit()
		});
	} else {
		app.quit();
	}
});

app.on("activate", () => win === null && createWindow());

ipcMain.on("ports", async (event) => event.sender.send("ports", await SerialPort.list()));

let comName;

ipcMain.on("set-port", (event, com, baud) => {
	if (comName !== com) {
		if (port) {
			let name = comName;
			port.close((err) => console.log(err || `${name} closed`));
			port = null;
		}
		comName = com;
		if (com) {
			console.log("connect to port", com);
			port = new SerialPort(com, { baudRate: Number(baud) });
		} else {
			return;
		}
	} else {
		return;
	}

	let data = "";
	port.on("data", (trunk) => {
		data += trunk.toString("utf8");

		if (data.endsWith("\n")) {
			const array = data.split(/\s/);

			for (const item of array) {
				if (item) {
					const [key, value] = item.split(":");
					win.webContents.send("data", key, value);
				}
			}
			data = "";
		}
	});
});

ipcMain.on("params", (event, params) => {
	port.write(params);
});