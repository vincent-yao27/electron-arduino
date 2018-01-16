### Electron Arduino

An Electron client and an Arduino library that exchange data with each other via serial.

Nice tools for developing a PID controller.

# Features

1. 8 params and 2 graphs are provided.
2. Simple APIs like `sendGraphData`, `readParams` in the Arduino library.
3. Adaptive layout is used in the Electron client. Free window size.
4. An additional PID controller library for Arduino.

![screenshot](https://vincent-yao27.github.io/res/electron-arduino/screenshot.png)

# Usage

1. Upload arduino/arduino.ino to your Arduino board.
2. Unzip electron/electron-arduino-win32-x64.zip and run electron-arduino.exe
3. Select the serial port that your Arduino connected to. Notice the baud setting.
4. Have fun and write your Arduino code.

# Development

### Arduino

Just change the arduino.ino code whatever you like.

### Electron

[Node](http://nodejs.org/) environment is required.
Open dir ./electron and run command
```
npm install
```
Source codes can be found in ./electron/src.

# License

GPL-3.0