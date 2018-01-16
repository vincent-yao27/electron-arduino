/**
 * electron-arduino
 * pid.h
 * 
 * @author	Vincent Yao (姚裕欣)
 * @author	vincent_yao27@163.com
 * @version	1.0.0
 * 
 * Copyright © 2018 Vincent Yao (姚裕欣)
 * 
 * Released under GPL-3.0 license
 */

#include <Arduino.h>
#include <math.h>

static float pidIntegral = 0;      // integral storage
static float pidPrevious = INFINITY; // previous delta value. INFINITY means no previous value.

/**
 * Function pid
 * @param delta current error
 * @param interval time elapsed since previous call
 * @param integralDecay integral value decays per second
 */
float pid(float delta, float interval, float kp, float ki, float kd, float integralDecay
				, float *pp = NULL, float *pi = NULL, float *pd = NULL) {
	float diff = 0;
	pidIntegral *= pow(integralDecay, interval);
	
	if (pidPrevious == INFINITY) {
		pidIntegral += delta * interval;
	} else {
		diff = (delta - pidPrevious) / interval;
		pidIntegral += (delta + pidPrevious) / 2 * interval;
	}
	
	pidPrevious = delta;

	if (pp) *pp = kp * delta;
	if (pi) *pi = ki * pidIntegral;
	if (pd) *pd = kd * diff;
	
	return kp * delta + ki * pidIntegral + kd * diff;
}

/**
 * Function pidReset
 * reset pid variables
 */
void pidReset() {
	pidIntegral = 0;
	pidPrevious = INFINITY;
}

/**
 * Function getRotationDelta
 * get difference of 2 rotation values that range from 0 to 1
 */
float getRotationDelta(float target, float actuall) {
	float d = target - actuall;
	if (d < -0.5)   return d + 1;
	else if (d > 0.5) return d - 1;
	else        return d;
}

/**
 * Function map
 * map a value from one range to another linearly
 */
float mapLinearly(float x, float in_min, float in_max, float out_min, float out_max) {
	return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}