import Konashi from './konashi.js';

class _PioPin {
  constructor(pin) {
    this.number = pin;
    this.pwmMode = Konashi.consts.KONASHI_PWM_DISABLE;
    this.pwmRatio = 0;
  }
}

class Queue {
  constructor() {
    this.queue = Promise.resolve(true);
    this.stopQueue = false;
  }

  add(job, delay) {
    var p = function () {
      return new Promise((resolve) => {
        setTimeout(function () {
          job();
          resolve();
        }, delay);
      });
    };
    this.queue = this.queue.then(p);
  }
}

const _BLE_DELAYS = {
  NONE: 0,
  NORMAL: 50,
  LONG: 200,
  DEBUG: 1000
}

class Cocoro {
  constructor(callback) {
    this._queue = new Queue();
    this._konashi = null;
    this._name = null;
    this._isSending = 0;
    this._onConnected = callback;

    this._pioPins = [
      new _PioPin(Konashi.consts.PIO0),
      new _PioPin(Konashi.consts.PIO1),
      new _PioPin(Konashi.consts.PIO2),
      new _PioPin(Konashi.consts.PIO3),
      new _PioPin(Konashi.consts.PIO4),
      new _PioPin(Konashi.consts.PIO5),
      new _PioPin(Konashi.consts.PIO6),
      new _PioPin(Konashi.consts.PIO7)
    ];
  }

  connect(prefix = 'cocorokit') {
    if (this._konashi) this._konashi.disconnect();

    return Konashi.find(true, {
        filters: [{
          namePrefix: prefix
        }],
        optionalServices: [Konashi._serviceUUID]
      })
      .then((k) => {
        this._konashi = k;
        this._name = k.name();
        this._isSending = 0;
      })
      .then(() => {
        var that = this;
        this._pioPins.forEach(pin => {
          this._queue.add(function () {
            that._konashi.pwmMode(pin.number, Konashi.consts.KONASHI_PWM_ENABLE_LED_MODE);
            pin.pwmMode = Konashi.consts.KONASHI_PWM_ENABLE_LED_MODE;
          }, _BLE_DELAYS.LONG);

          this._queue.add(function () {
            that._konashi.pwmLedDrive(pin.number, 0);
            pin.pwmRatio = 0;

            if (pin.number == 7) { // Last
              that._onConnected();
            }
          }, _BLE_DELAYS.LONG);
        });
      })
  }

  // type: 'all', 'motor', 'led'
  reset(type) {
    if (!this._konashi) return;

    if (type === "all") {
      this._pioPins.forEach(pin => {
        var that = this;
        this._queue.add(function () {
          that._konashi.pwmLedDrive(pin.number, 0);
          pin.pwmRatio = 0;
        }, _BLE_DELAYS.NORMAL);
      });
    }

    if (type === "motor") {
      this._pioPins.slice(1, 5).forEach(pin => {
        var that = this;
        this._queue.add(function () {
          that._konashi.pwmLedDrive(pin.number, 0);
          pin.pwmRatio = 0;
        }, _BLE_DELAYS.NORMAL);
      });
    }

    if (type === "led") {
      this._pioPins.slice(5, 8).forEach(pin => {
        var that = this;
        this._queue.add(function () {
          that._konashi.pwmLedDrive(pin.number, 0);
          pin.pwmRatio = 0;
        }, _BLE_DELAYS.NORMAL);
      });
    }
  }

  getPwmRatio(pid) {
    if (pid < 0 || 7 < pid) return;

    return this._pioPins[pid].pwmRatio;
  }

  _errorCallback(error) {
    log.log("cocorokit error: " + error);

    const disconnectError = /disconnected/;
    if (disconnectError.test(error)) {}

    const alreadyUsedError = /already in progress/;
    if (alreadyUsedError.test(error)) {
      this._queue = new Queue();
      this._isSending = 0;
      this._konashi.reset();
    }
  }

  setPwmRatio(pid, ratio) {
    if (pid < 0 || 7 < pid) return;
    if (this._isSending >= 3) return;
    if (ratio == this._pioPins[pid].pwmRatio) return;

    this._isSending++;
    var that = this;
    this._queue.add(function () {
      that._konashi.pwmLedDrive(pid, ratio)
        .then(() => {
          that._pioPins[pid].pwmRatio = ratio;
          if (that._isSending > 0) that._isSending--;
        })
        .catch(that._errorCallback);
    }, _BLE_DELAYS.NORMAL);
  }
}

module.exports = Cocoro;
module.exports.default = Cocoro;