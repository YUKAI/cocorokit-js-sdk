[日本語](./README.md)

# cocoro kit javascript SDK

You can run cocorokit with javascript.

## Requirements

This module uses Web Bluetooth API. The support of API is limited.
Please confirm your device following the link (https://caniuse.com/#feat=web-bluetooth).

## Usage

Before run below script, please get cocorokit board and turn on.

```javascript
import CocoroKit from "@ux-xu/cocorokit-js-sdk";

window.cocorokit = new CococoKit(onConnected); // callback on connected.
window.cocorokit.connect();

// after connected
window.cocorokit.spin(CocoroKit.CONST.SPIN.RIGHT, 100); // Spin right motor by 100% power.
window.cocorokit.reverse(CocoroKit.CONST.REVERSE.RIGHT, 100); // Reverse right motor by 100% power.
```

## Functions

```javascript
/**
 * Spin motor
 * @param {Object} motorSet Cocorokit.CONST.SPIN.RIGHT|LEFT
 * @param {Number} ratio 0 - 100
 */
spin(motorSet, ratio) {}

/**
 * Reverse motor
 * @param {Object} motorSet Cocorokit.CONST.REVERSE.RIGHT|LEFT
 * @param {Number} ratio 0 - 100
 */
reverse(motorSet, ratio) {}

/**
 * Stop motor
 * @param {Array} motorSet Cocorokit.CONST.STOP.RIGHT|LEFT
 */
stop(motorSet) {}

/**
 * Change LED color
 * @param {Object} color Cocorokit.CONST.COLOR.RED|GREEN|BLUE
 * @param {Number} ratio 0 - 100
 */
color(color, ratio) {}

/**
 * Clear current values
 * @param {Object} type Cocorokit.CONST.RESET.ALL|MOTOR|LED
 */
reset(type) {}
```
