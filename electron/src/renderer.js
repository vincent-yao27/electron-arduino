/**
 * electron-arduino
 * renderer.js
 * 
 * @author	Vincent Yao (姚裕欣)
 * @author	vincent_yao27@163.com
 * @version	1.0.0
 * 
 * Copyright © 2018 Vincent Yao (姚裕欣)
 * 
 * Released under GPL-3.0 license
 */

const { ipcRenderer } = require("electron");

window.onload = function() {
	const portSelect = document.querySelector("#port select");
	const baudInput = document.querySelector("#port #baud");

	portSelect.onchange = function(event) {
		console.log("port", event.target.value);
		ipcRenderer.send("set-port", event.target.value, baudInput.value);
	};

	document.querySelector("#refresh-port").onclick = function() {
		ipcRenderer.send("ports");
	};

	function listPorts(ports) {
		for (let opt of portSelect.childNodes) {
			if (opt.value) portSelect.removeChild(opt);
		}
		for (const port of ports) {
			let opt = document.createElement("option");
			opt.value = port.comName;
			opt.textContent = port.comName + " " + port.manufacturer;
			portSelect.appendChild(opt);
		}
	}

	ipcRenderer.on("ports", (event, ports) => {
		console.log(ports);
		listPorts(ports);
	});

	function drawPlainGraph(ctx, height, data) {
		ctx.strokeStyle = "#fd0";
		ctx.beginPath();
		ctx.moveTo(0, height / 2);
		ctx.lineTo(data.length, height / 2);
		ctx.stroke();

		ctx.strokeStyle = "#000";
		ctx.beginPath();
		data.forEach((value, idx) => {
			ctx.lineTo(idx + 1, height / 2 * (1 - value));
		});
		ctx.stroke();
	}

	function drawAdvancedGraph(ctx, height, data) {
		let indicator = 0, prev = 0;
		data.forEach((value, idx) => {
			if (indicator * value <= 0) {
				ctx.stroke();
				indicator = value;
				if (indicator >= 0) ctx.strokeStyle = "#e00";
				else ctx.strokeStyle = "#0c0";
				ctx.beginPath();
				ctx.lineTo(idx + 1, height * (1 - Math.abs(prev)));
			}
			ctx.lineTo(idx + 1, height * (1 - Math.abs(value)));
			prev = value;
		});
	}

	const params = document.querySelectorAll("#params input");

	function formatParams() {
		return [...params].map((input) => input.value || 0).join(" ") + "\t\n";
	}

	params.forEach((input) => {
		input.onkeydown = function(event) {
			if (event.key === "Enter") {
				ipcRenderer.send("params", formatParams());
			}
		}
	});

	document.querySelector("#send-params").onclick = function() {
		ipcRenderer.send("params", formatParams());
	}

	const graphs = document.querySelectorAll(".graph");
	const drawMethods = [drawPlainGraph, drawPlainGraph];
	const canvases = document.querySelectorAll("canvas");
	let graphData = [[], []];

	graphs.forEach((graph, idx) => {
		graph.querySelector("select").onchange = function(event) {
			if (event.target.value === "plain") {
				drawMethods[idx] = drawPlainGraph;
			} else {
				drawMethods[idx] = drawAdvancedGraph;
			}
		};
	});

	function resizeCanvas() {
		canvases.forEach((canvas) => {
			canvas.height = 0;
			setTimeout(function() {
				canvas.width = canvas.clientWidth;
				canvas.height = canvas.clientHeight;
			});
		});
	}

	resizeCanvas();
	window.onresize = resizeCanvas;

	ipcRenderer.on("data", (event, key, value) => {
		if (key[0] === "p") {
			console.log(key, value);
			params[key.slice(1)].value = value;
		} else if (key[0] === "g") {
			const num = key.slice(1);
			let data = graphData[num];
			data.push(Number(value));

			if (data.length > canvases[num].width) {
				graphData[num] = data.slice(-canvases[num].width);
			}
		} else {
			console.log("msg:", key);
		}
	});
	
	ipcRenderer.send("ports");

	setInterval(function() {
		canvases.forEach((canvas, idx) => {
			const ctx = canvas.getContext("2d");
			const { width, height } = canvas;
			ctx.clearRect(0, 0, width, height);
			drawMethods[idx](ctx, height, graphData[idx]);
		});
	}, 17);
};