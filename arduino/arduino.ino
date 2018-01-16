#include "serial.h"
#include "pid.h"

const int ANALOG_IN = 0;
const int LED_OUT = 13;

void setup() {
	Serial.begin(250000); // baud must be coincident with electron
	while (!Serial);      // wait until serial's ready

	params[0] = 0.5;      // test initial value
	paramsFeedback();     // send params to electron
}

void loop() {
	int beginTime = micros();

	readParams(); // read params from electron

	// test code
	int analogIn = analogRead(ANALOG_IN);
	float graphValue = mapLinearly(analogIn, 0, 1023, -1, 1);
	sendGraphData(0, graphValue);

	// test code
	int ledPwm = mapLinearly(params[0], 0, 1, 0, 255);
	analogWrite(LED_OUT, ledPwm);

	sendData("p7", int(micros() - beginTime));	// log time and display it in param 7

	delay(5);
}
