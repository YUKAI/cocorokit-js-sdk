import Konashi from "./konashi.js";

class _PioPin {
  constructor(pin) {
    this.number = pin;
    this.pwmMode = Konashi.PWM_DISABLE;
    this.pwmRatio = 0;
  }
}

const _BLE_DELAYS = {
  NORMAL: 50,
  LONG: 200,
};

class Cocoro {
  constructor(callback) {
    this._konashi = null;
    this._name = null;
    this._isSending = 0;
    this._onConnected = callback;

    this._pioPins = [
      new _PioPin(Konashi.PIO0),
      new _PioPin(Konashi.PIO1),
      new _PioPin(Konashi.PIO2),
      new _PioPin(Konashi.PIO3),
      new _PioPin(Konashi.PIO4),
      new _PioPin(Konashi.PIO5),
      new _PioPin(Konashi.PIO6),
      new _PioPin(Konashi.PIO7),
    ];
  }

  async sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async connect(prefix = "cocorokit") {
    if (this._konashi) this._konashi.disconnect();

    this._konashi = await Konashi.find(true, {
      filters: [
        {
          namePrefix: prefix,
        },
      ],
      optionalServices: [Konashi._serviceUUID],
    }).catch(() => null);

    if (this._konashi == null) {
      console.log("Could not find device");
      return;
    }

    this._name = this._konashi.deviceName;
    this._isSending = 0;

    for (let i in this._pioPins) {
      let pin = this._pioPins[i];
      await this._konashi.pwmMode(pin.number, Konashi.PWM_ENABLE_LED_MODE);
      await this.sleep(_BLE_DELAYS.LONG);
      pin.pwmMode = Konashi.PWM_ENABLE_LED_MODE;

      await this._konashi.pwmWrite(pin.number, 0);
      await this.sleep(_BLE_DELAYS.LONG);
      pin.pwmRatio = 0;

      if (pin.number == 7) {
        this._onConnected();
      }
    }
  }

  async setPwmRatio(pid, ratio) {
    if (pid < 0 || 7 < pid) return;
    if (this._isSending >= 3) return;
    if (ratio == this._pioPins[pid].pwmRatio) return;

    this._isSending++;
    await this._konashi.pwmWrite(pid, ratio).catch((error) => {
      console.log("cocorokit: " + error);
    });
    await this.sleep(_BLE_DELAYS.NORMAL);
    this._pioPins[pid].pwmRatio = ratio;
    if (this._isSending > 0) this._isSending--;
  }

  /**
   *
   * @param {*} type "all", "motor", "led"
   */
  async reset(type) {
    if (!this._konashi) return;

    if (type === "all") {
      for (let i in this._pioPins) {
        let pin = this._pioPins[i];
        await this._konashi.pwmWrite(pin.number, 0);
        await this.sleep(_BLE_DELAYS.NORMAL);
        pin.pwmRatio = 0;
      }
    }

    if (type === "motor") {
      for (let i = 0; i < 5; i++) {
        let pin = this._pioPins[i];
        await this._konashi.pwmWrite(pin.number, 0);
        await this.sleep(_BLE_DELAYS.NORMAL);
        pin.pwmRatio = 0;
      }
    }

    if (type === "led") {
      for (let i = 5; i < 8; i++) {
        let pin = this._pioPins[i];
        await this._konashi.pwmWrite(pin.number, 0);
        await this.sleep(_BLE_DELAYS.NORMAL);
        pin.pwmRatio = 0;
      }
    }
  }

  getPwmRatio(pid) {
    if (pid < 0 || 7 < pid) return;
    return this._pioPins[pid].pwmRatio;
  }
}

module.exports = Cocoro;
module.exports.default = Cocoro;
