/**
 * electron-arduino
 * serial.h
 * 
 * @author	Vincent Yao (姚裕欣)
 * @author	vincent_yao27@163.com
 * @version	1.0.0
 * 
 * Copyright © 2017 Vincent Yao (姚裕欣)
 * 
 * Released under GPL-3.0 license
 */

#include <Arduino.h>

/**
 * Function sendData
 * send data in the form of 'name:value'
 * the name params begins with 'p' while that of graph data begins with 'g'
 */
void sendData(String name, float value, int precision = 3) {
	Serial.println(name + ":" + String(value, precision));
}

void sendData(String name, int value) {
	Serial.println(name + ":" + value);
}

/**
 * Function sendGraphData
 * send graph data in the form of 'g<id>:value'
 * @param id graph id
 * @param value ranges from -1 to 1
 */
void sendGraphData(int id, float value) {
	sendData(String("g") + id, value);
}

/**
 * Array params
 * params received from electron
 * It will be refreshed when readParams is called after electron sending new params.
 */
static const int paramsSize = 8;
float params[paramsSize] = {0};
																
/**
 * Function paramsFeedback
 * send params to electron
 */
void paramsFeedback() {
	for (int i = 0; i < paramsSize; i++) {
		sendData(String("p") + i, params[i]);
	}
}

/**
 * Function concatParamsBuffer
 * Data received by Serial.readBytesUntil may be not complete.
 * This function parses params after verifying the completeness of data.
 */
static String paramsStr;

void concatParamsBuffer(char *paramsBuffer) {
	paramsStr += String(paramsBuffer);

	if (paramsStr.endsWith("\t")) {
		const char *str = paramsStr.c_str();
		for (int i = 0, idx = 0; i < paramsStr.length() && idx < paramsSize; i++) {
			if (i == 0 || *(str + i - 1) ==  ' ') {
				params[idx++] = String(str + i).toFloat();
			}
		}
		paramsFeedback(); // send params back to electron to confirm receipt
		paramsStr = "";
	}
}

/**
 * Function readParams
 * try to read params from election
 * @params timeout wait or read until timeout in ms
 */
void readParams(int timeout = 1) {
	Serial.setTimeout(timeout);

	const int bufferLength = 50;
	char paramsBuffer[bufferLength] = {0};
	Serial.readBytesUntil('\n', paramsBuffer, bufferLength);

	if (paramsBuffer[0] != 0) {
		concatParamsBuffer(paramsBuffer);
	}
}