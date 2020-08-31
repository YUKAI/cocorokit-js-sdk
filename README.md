[English](./README_en.md)

# ココロキット javascript SDK

ココロキットを JavaScript から動かすための SDK です．

## 必要な環境

この SDK は Web Bluetooth API という機能を使っています．  
Web Bluetooth API は対応しているデバイスに制限があります．一例として，Android は標準の Chrome で Web Bluetooth API を利用できますが，iPhone では別途アプリのインストールが必要です．

## 使い方

以下は動かすサンプルです．

```javascript
import CocoroKit from "@ux-xu/cocorokit-js-sdk";

window.cocorokit = new CococoKit(onConnected); // 接続したときのCallback関数を設定します．
window.cocorokit.connect();

// after connected
window.cocorokit.spin(CocoroKit.CONST.SPIN.RIGHT, 100); // 右のモータを100%のパワーで動かします
window.cocorokit.reverse(CocoroKit.CONST.REVERSE.RIGHT, 100); // 右のモータを100%のパワーで逆回転させます．
```

## 関数についての説明

```javascript
/**
 * モータを正回転させる
 * @param {Object} motorSet Cocorokit.CONST.SPIN.RIGHT|LEFT
 * @param {Number} ratio 0 - 100
 */
spin(motorSet, ratio)

/**
 * モータを逆回転させる
 * @param {Object} motorSet Cocorokit.CONST.REVERSE.RIGHT|LEFT
 * @param {Number} ratio 0 - 100
 */
reverse(motorSet, ratio)

/**
 * モータを止める
 * @param {Array} motorSet Cocorokit.CONST.STOP.RIGHT|LEFT
 */
stop(motorSet)

/**
 * 付いているLEDの色を変える
 * @param {Object} color Cocorokit.CONST.COLOR.RED|GREEN|BLUE
 * @param {Number} ratio 0 - 100
 */
color(color, ratio)

/**
 * リセット（全て，モータのみ，LEDのみ）
 * @param {Object} type Cocorokit.CONST.RESET.ALL|MOTOR|LED
 */
reset(type)
```
