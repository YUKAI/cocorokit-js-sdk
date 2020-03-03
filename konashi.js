class Konashi {
  /**
   * Create konashi UUID
   *
   * @param {String} part 4 characters hex
   * @returns {String}
   */
  static _createUUID(part) {
    return '229b' + part + '-03fb-40da-98a7-b0def65c2d4b';
  }

  /**
   * Returns konashi's service UUID
   *
   * @returns {String}
   */
  static get _serviceUUID() {
    return Konashi._createUUID('ff00');
  }

  /**
   * Returns konashi's UUID with label
   *
   * @returns {Object<String, String>} key: label, value: UUID
   */
  static get _c12cUUIDs() {
    return {
      pioSetting:           Konashi._createUUID('3000'),
      pioPullUp:            Konashi._createUUID('3001'),
      pioOutput:            Konashi._createUUID('3002'),
      pioInputNotification: Konashi._createUUID('3003'),
      pwmConfig:            Konashi._createUUID('3004'),
      pwmParameter:         Konashi._createUUID('3005'),
      pwmDuty:              Konashi._createUUID('3006'),
      analogDrive:          Konashi._createUUID('3007'),
      analogInput:          Konashi._createUUID('3008'),
      analogRead0:          Konashi._createUUID('3008'),
      analogRead1:          Konashi._createUUID('3009'),
      analogRead2:          Konashi._createUUID('300a'),
      i2cConfig:            Konashi._createUUID('300b'),
      i2cStartStop:         Konashi._createUUID('300c'),
      i2cWrite:             Konashi._createUUID('300d'),
      i2cReadParameter:     Konashi._createUUID('300e'),
      i2cRead:              Konashi._createUUID('300f'),
      uartConfig:           Konashi._createUUID('3010'),
      uartBaudRate:         Konashi._createUUID('3011'),
      uartTx:               Konashi._createUUID('3012'),
      uartRxNotification:   Konashi._createUUID('3013'),
      hardwareReset:        Konashi._createUUID('3014'),
      hardwareLowBatteryNotification:
                            Konashi._createUUID('3015'),
    };
  }

  /**
   * Returns konashi's constant values with label
   * 
   * @returns {Object<String, Number>} key: label, value: Number
   */
  static get consts() {
    return {
      HIGH: 1,
      LOW: 0,
      OUTPUT: 1,
      INPUT: 0,
      PULLUP: 1,
      NO_PULLS: 0,
      ENABLE: 1,
      DISABLE: 0,
      TRUE: 1,
      FALSE: 0,
      KONASHI_SUCCESS: 0,
      KONASHI_FAILURE: -1,
    
      // Konashi I/0 pin
      PIO0: 0,
      PIO1: 1,
      PIO2: 2,
      PIO3: 3,
      PIO4: 4,
      PIO5: 5,
      PIO6: 6,
      PIO7: 7,
      S1: 0,
      LED2: 1,
      LED3: 2,
      LED4: 3,
      LED5: 4,
      AIO0: 0,
      AIO1: 1,
      AIO2: 2,
      I2C_SDA: 6,
      I2C_SCL: 7,
    
      // Konashi PWM
      KONASHI_PWM_DISABLE: 0,
      KONASHI_PWM_ENABLE: 1,
      KONASHI_PWM_ENABLE_LED_MODE: 2,
      KONASHI_PWM_LED_PERIOD: 10000,  // 10ms
    
      // Konashi analog I/O
      KONASHI_ANALOG_REFERENCE: 1300, // 1300mV
    
      // Konashi UART baudrate
      KONASHI_UART_RATE_2K4: 0x000a,
      KONASHI_UART_RATE_9K6: 0x0028,
    
      // Konashi I2C
      KONASHI_I2C_DATA_MAX_LENGTH: 18,
      KONASHI_I2C_DISABLE: 0,
      KONASHI_I2C_ENABLE: 1,
      KONASHI_I2C_ENABLE_100K: 1,
      KONASHI_I2C_ENABLE_400K: 2,
      KONASHI_I2C_STOP_CONDITION: 0,
      KONASHI_I2C_START_CONDITION: 1,
      KONASHI_I2C_RESTART_CONDITION: 2,
    
      // Konashi UART
      KONASHI_UART_DATA_MAX_LENGTH: 19,
      KONASHI_UART_DISABLE: 0,
      KONASHI_UART_ENABLE: 1,
    
      // Konashi SPI
      KOSHIAN_SPI_SPEED_200K: 20,
      KOSHIAN_SPI_SPEED_500K: 50,
      KOSHIAN_SPI_SPEED_1M: 100,
      KOSHIAN_SPI_SPEED_2M: 200,
      KOSHIAN_SPI_SPEED_3M: 300,
      KOSHIAN_SPI_SPEED_6M: 600,
      
      KOSHIAN_SPI_MODE_CPOL0_CPHA0: 0,
      KOSHIAN_SPI_MODE_CPOL0_CPHA1: 1,
      KOSHIAN_SPI_MODE_CPOL1_CPHA0: 2,
      KOSHIAN_SPI_MODE_CPOL1_CPHA1: 3,
      KOSHIAN_SPI_MODE_DISABLE: -1,
      
      KOSHIAN_SPI_BIT_ORDER_LSB_FIRST: 0,
      KOSHIAN_SPI_BIT_ORDER_MSB_FIRST: 1
    };
  }

  /**
   * Find konasih device
   *
   * @param {Boolean} [autoConnect]
   * @param {Object} [options] default: `{filters: [{namePrefix: 'konashi'}], optionalServices: ['229bff00-03fb-40da-98a7-b0def65c2d4b']}`
   * @returns {Promise<Konashi>}
   */
  static find(autoConnect, options) {
    if (typeof autoConnect == undefined) {
      autoConnect = true;
    }
    options = options || {filters: [{namePrefix: 'konashi'}], optionalServices: [Konashi._serviceUUID]};
    return new Promise((resolve, reject) => {
      navigator.bluetooth
        .requestDevice(options)
        .then(
          (d) => {
            var konashi = new Konashi(d);
            if (autoConnect) {
              konashi.connect().then(resolve, reject);
            } else {
              resolve(konashi);
            }
          },
          (e) => {
            reject(e)
          }
        );
    });
  }

  /**
   * constructor
   *
   * @param {BluetoothDevice} device
   */
  constructor(device) {
    /** BluetoothDevice */
    this._device = device;
    /** BluetoothGATTRemoteServer */
    this._gatt = null;
    /** BluetoothGATTService */
    this._service = null;
    /** Object<String, BluetoothGATTCharacteristic> */
    this._c12c = {};
    /** Object<String, Number> */
    this._state = {pioOutputs: 0,
                   pwmModes: 0};

    for (let key in this.consts) {
        this[key] = this.consts[key];
    }
  }

  /**
   * Connect to konashi
   *
   * Assign `_gatt` and `_service` properties when the connection has been made.
   *
   * @returns {Promise<Konashi>}
   */
  connect() {
    var that = this;
    return new Promise((resolve, reject) => {
      that._device.gatt.connect()
        .then(
          (gatt) => {
            that._gatt = gatt;
            return gatt.getPrimaryService(Konashi._serviceUUID);
          },
          (e) => reject(e)
        )
        .then(
          (service) => {
            that._service = service;
            var promises = [], keys = [];
            for (let key in Konashi._c12cUUIDs) {
              keys.push(key);
            }
            keys.forEach((label, i) => {
              promises.push(
                that._service.getCharacteristic(Konashi._c12cUUIDs[label]).then(
                  (c) => {
                    // TODO: Watch changes of all characteristics
                    // https://github.com/WebBluetoothCG/web-bluetooth/issues/176
                    that._c12c[label] = c;
                    Promise.resolve();
                  }
                )
              );
            });
            return Promise.all(promises);
          },
          (e) => reject(e)
        )
        .then(
          () => resolve(that),
          (e) => reject(e)
        );
    });
  }  

  /**
   * Return connection condition
   * 
   * @returns {Boolean}
   */
  isConnected() {
    var connected = false;
    if (this._gatt) {
      connected = this._gatt.connected;
    }
    return connected;
  }

  /**
   * Returns peripheral name
   *
   * @returns {String}
   */
  name() {
    return this._device.name;
  }

  // { Digital I/O

  /**
   * Set konashi's pin mode
   *
   * @param {Number} pin Konashi.consts.PIO[0-7]
   * @param {Number} flag Konashi.consts.(INPUT|OUTPUT)
   * @returns {Promise<void>}
   */
  pinMode(pin, flag) {
    var that = this;
    return new Promise((resolve, reject) => {
      that._c12c.pioSetting.readValue()
        .then((v) => {
          var data = v.getUint8(0);
          if (flag == Konashi.consts.OUTPUT) {
            data |= 0x01 << pin;
          } else {
            data &= ~(0x01 << pin) & 0xff;
          }
          this._c12c.pioSetting.writeValue(new Uint8Array([data]))
            .then(resolve, reject);
        });
    });
  }

  /**
   * Set konashi's all pin modes at once
   * 0=INPUT, 1=OUTPUT, e.g. 00101001(0:OUT, 4:OUT, 5:OUT, other:IN)
   * 
   * @param {Number} flags Hex value "0x29"
   * @return {Promise<void>}
   */
  pinModeAll(flags) {
    var that = this;
    return new Promise((resolve, reject) => {
      if(flags >= 0x00 && flags <= 0xFF) {
        that._c12c.pioSetting.writeValue(new Uint8Array([flags]))
          .then(resolve, reject);
      }
    })
  }

  /**
   * Set pullup mode
   *
   * @param {Number} pin Konashi.consts.PIO[0-7]
   * @param {Number} mode Konashi.consts.(PULLUP|NO_PULLS)
   * @returns {Promise<Void>}
   */
  pinPullup(pin, mode) {
      var that = this;
      return new Promise((resolve, reject) => {
        that._c12c.pioPullUp.readValue()
          .then(v => {
            var data = v.getUint8(0);
            if (mode == Konashi.consts.PULLUP) {
              data |= 0x01 << pin;
            } else {
              data &= ~(0x01 << pin);
            }
            this._c12c.pioPullUp.writeValue(new Uint8Array([data]))
              .then(resolve, reject);
          });
      });
  }

  /**
   * Read a value of digital pin
   *
   * @param {Number} pin Konashi.consts.PIO[0-7]
   * @returns {Promise<Number>} Konashi.consts.(LOW|HIGH)
   */
  digitalRead(pin) {
    return this._c12c.pioInputNotification.readValue()
      .then((buf) => {
        return (buf.getUint8(0) >> pin) & 0x01;
      });
  }

  
  /**
   * Write value to a digital pin
   *
   * @param {Number} pin Konashi.consts.PIO[0-7]
   * @param {Number} value Konashi.consts.(LOW|HIGH)
   * @returns {Promise<Void>} 
   */
  digitalWrite(pin, value) {
    if (value == Konashi.consts.HIGH) {
      this._state.pioOutputs |= 0x01 << pin;
    } else {
      this._state.pioOutputs &= ~(0x01 << pin) & 0xff;
    }
    return this._c12c.pioOutput.writeValue(new Uint8Array([this._state.pioOutputs]));
  }

  /**
   * Write value to all digital pins at once.
   * 0=LOW, 1=HIGH, e.g. 00101001(0:HIGH, 4:HIGH, 5:HIGH, other:LOW)
   * 
   * @param {Number} flags Hex value "0x29"
   */
  digitalWriteAll(flags) {
    var that = this;
    return new Promise((resolve, reject) => {
      if(flags >= 0x00 && flags <= 0xFF) {
        that._c12c.pioOutput.writeValue(new Uint8Array([flags]))
          .then(resolve, reject);
      }
    })
  }

  // Digital I/O }

  // { Analog Input

  /**
   * Read an analog pin
   *
   * @param {Number} pin Konashi.consts.AIO[1-3]
   * @returns {Promise<Number>}
   */
  analogRead(pin) {
    var c;
    switch (pin) {
      case Konashi.consts.AIO0:
        c = this._c12c.analogRead0;
        break;
      case Konashi.consts.AIO1:
        c = this._c12c.analogRead1;
        break;
      case Konashi.consts.AIO2:
        c = this._c12c.analogRead2;
        break;
    }
    return c.readValue().then((buf) => {
      return buf.getUint8(0) << 8 | buf.getUint8(1);
    });
  }
  // Analog Input }

  // { PWM

  /**
   * Set PWM mode
   *
   * @param {Number} pin Konashi.consts.PIO[0-7]
   * @param {Number} mode Konashi.consts.(KONASHI_PWM_ENABL|KONASHI_PWM_ENABLE_LED_MODE)
   * @returns {Promise<Void>}
   */
  pwmMode(pin, mode) {
    if (mode == Konashi.consts.KONASHI_PWM_ENABLE || mode == Konashi.consts.KONASHI_PWM_ENABLE_LED_MODE) {
      this._state.pwmModes |= 0x01 << pin;
    } else {
      this._state.pwmModes &= ~(0x01 << pin) & 0xff;
    }
    var that = this,
        data = new Uint8Array([this._state.pwmModes]);
    if (mode == Konashi.consts.KONASHI_PWM_ENABLE_LED_MODE) {
        return this._c12c.pwmConfig.writeValue(data)
          .then(() => that.pwmPeriod(pin, Konashi.consts.KONASHI_PWM_LED_PERIOD))
          .then(() => that.pwmDuty(pin, 0));
    }
    return this._c12c.pwmConfig.writeValue(data);
  }

  /**
   * Set the PWM cycle
   *
   * @param {Number} pin Konashi.consts.PIO[0-7]
   * @param {Number} period
   * @returns {Promise<Void>}
   */
  pwmPeriod(pin, period) {
    var data = new Uint8Array([pin,
                               (period >> 24) & 0xff,
                               (period >> 16) & 0xff,
                               (period >> 8) & 0xff,
                               (period >> 0) & 0xff]);
    return this._c12c.pwmParameter.writeValue(data);
  }

  /**
   * Set the duty cycle
   *
   * @param {Number} pin Konashi.consts.PIO[0-7]
   * @param {Number} duty Please specify the units as microseconds (us) in 32bits or use value from consts.
   * @returns {Promise<Void>}
   */
  pwmDuty(pin, duty) {
    duty = parseInt(duty);
    var data = new Uint8Array([pin,
                               (duty >> 24) & 0xff,
                               (duty >> 16) & 0xff,
                               (duty >> 8) & 0xff,
                               (duty >> 0) & 0xff]);
    return this._c12c.pwmDuty.writeValue(data);
  }

  /**
   * Write PWM ratio for the LEDs on Konashi board.
   * This function is also useful to control DC motors.
   * 
   * @param {*} pin Konashi.consts.PIO[0-7]
   * @param {*} ratio (0 - 100)
   */
  pwmLedDrive(pin, ratio) {
    ratio = Math.min(100.0, Math.max(0.0, ratio));
    var duty = Konashi.consts.KONASHI_PWM_LED_PERIOD * ratio / 100;
    return this.pwmDuty(pin, duty);
  }

  /**
   * Write PWM ratio
   *
   * @param {Number} pin Konashi.consts.PIO[0-7]
   * @param {Number} ratio (0-100)
   * @returns {Promise<Void>}
   */
  pwmWrite(pin, ratio) {
    ratio = Math.min(100, Math.max(0, ratio));
    var duty = Konashi.consts.KONASHI_PWM_LED_PERIOD * ratio / 100;
    return this.pwmDuty(pin, duty);
  }

  // PWM }

  // { UART

  /**
   * Set UART mode
   *
   * @param {Number} mode Konashi.consts.KONASHI_UART_(DISABLE|ENABLE)
   * @returns {Promise<Void>}
   */
  uartMode(mode) {
    if (mode != Konashi.consts.KONASHI_UART_DISABLE
        && mode != Konashi.consts.KONASHI_UART_ENABLE) {
      return Promise.reject(new Error('Invalid UART mode.'));
    }
    return this._c12c.uartConfig.writeValue(new Uint8Array([mode]));
  }

  /**
   * Set the baud rate of UART
   *
   * @param {Number} rate Konashi.consts.KONASHI_UART_RATE_(2K4|9K6)
   * @returns {Promise<Void>}
   */
  uartBaudRate(rate) {
    if (rate != Konashi.consts.KONASHI_UART_RATE_2K4
        && rate != Konashi.consts.KONASHI_UART_RATE_9K6) {
      return Promise.reject(new Error('Invalid UART baud rate.'));
    }
    var data = new Uint8Array([(rate >> 8) & 0xff,
                               rate & 0xff]);
    return this._c12c.uartBaudRate.writeValue(data);
  }

  /**
   * Write UART data
   *
   * @param {Uint8Array} data
   * @returns {Promise<Void>}
   */
  uartWrite(data) {
    var chunkSize = Konashi.consts.KONASHI_UART_DATA_MAX_LENGTH;
    if (data.length <= chunkSize) {
      return this._uartWrite(data);
    }
    var chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    return this._uartWriteChunks(chunks, 0);
  }

  /**
   * Write data chunks recursively
   * 
   * @param {*} chunks 
   * @param {*} index 
   */
  _uartWriteChunks(chunks, index) {
    if (chunks.length <= index) {
      return Promise.resolve();
    }
    var that = this;
    return this._uartWrite(chunks[index]).then(() => {
      return that._uartWriteChunks(chunks, index + 1);
    });
  }

  /**
   * Base function to write UART data.
   * 
   * @param {*} data 
   */
  _uartWrite(data) {
    if (Konashi.consts.KONASHI_UART_DATA_MAX_LENGTH < data.length) {
      return Promise.reject(new Error('The data size has to be less then ' + Konashi.KONASHI_UART_DATA_MAX_LENGTH + '.'));
    }
    var writeData = new Uint8Array(data.length + 1);
    writeData[0] = data.length;
    data.forEach((v, i) => {
      writeData[i + 1] = v;
    });
    return this._c12c.uartTx.writeValue(writeData);
  }

  // UART }

  // { I2C

  /**
   * Set I2C mode
   *
   * @param {Number} mode Konashi.consts.KONASHI_I2C_(DISABLE|ENABLE|ENABLE_100K|ENABLE_400K)
   * @returns {Promise<Void>}
   */
  i2cMode(mode) {
    if (mode != Konashi.consts.KONASHI_I2C_DISABLE
        && mode != Konashi.consts.KONASHI_I2C_ENABLE
        && mode != Konashi.consts.KONASHI_I2C_ENABLE_100K
        && mode != Konashi.consts.KONASHI_I2C_ENABLE_400K) {
      return Promise.reject(new Error('Invalid I2C mode'));
    }
    return this._c12c.i2cConfig.writeValue(new Uint8Array([mode]));
  }

  i2cStopCondition() {
    return this._i2cSendCondition(Konashi.consts.KONASHI_I2C_STOP_CONDITION);
  }

  i2cStartCondition() {
    return this._i2cSendCondition(Konashi.consts.KONASHI_I2C_STOP_CONDITION);
  }

  i2cRestartCondition() {
    return this._i2cSendCondition(Konashi.consts.KONASHI_I2C_RESTART_CONDITION);
  }

  /**
   * Write I2C condition.
   * 
   * @param {Number} condition Konashi.consts.KONASHI_I2C_(STOP|START|RESTART)_CONDITION
   * @returns {Promise<Void>}
   */
  _i2cSendCondition(condition) {
    if (condition != Konashi.consts.KONASHI_I2C_STOP_CONDITION
        && condition != Konashi.consts.KONASHI_I2C_START_CONDITION
        && condition != Konashi.consts.KONASHI_I2C_RESTART_CONDITION) {
      return Promise.reject(new Error('Invalid I2C condition.'));
    }
    return this._c12c.i2cStartStop.writeValue(new Uint8Array([condition]));
  }

  /**
   * Write I2C data
   *
   * @param {Number} address
   * @param {Uint8Array} data
   * @returns {Promise<Void>}
   */
  i2cWrite(address, data) {
    var chunkSize = Konashi.consts.KONASHI_I2C_DATA_MAX_LENGTH;
    if (data.length <= chunkSize) {
      return this._i2cWrite(address, data);
    }
    var chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    return this._i2cWriteChunks(address, chunks, 0);
  }

  _i2cWriteChunks(address, chunks, index) {
    if (chunks.length <= index) {
      return Promise.resolve();
    }
    var that = this;
    return this._i2cWrite(address, chunks[index]).then(() => {
      return that._i2cWriteChunks(chunks, index + 1);
    });
  }

  _i2cWrite(address, data) {
    if (Konashi.consts.KONASHI_I2C_DATA_MAX_LENGTH < data.length) {
      return Promise.reject(new Error('The data size has to be less than ' + Konashi.consts.KONASHI_I2C_DATA_MAX_LENGTH + '.'));
    }
    var writeData = new Uint8Array(Konashi.consts.KONASHI_I2C_DATA_MAX_LENGTH + 2);
    writeData[0] = data.length + 1;
    writeData[1] = (address << 1) & 0b11111110;
    data.forEach((v, i) => {
      writeData[i + 2] = v;
    });
    return this._c12c.i2cWrite.writeValue(writeData);
  }

  /**
   * Read i2c data
   * TODO: _i2cReadChunks function.
   *
   * @param {Number} address
   * @param {Number} length
   * @param {Function} callback
   */
  i2cRead(address, length, callback) {
    that = this;
    this._i2cReadRequest(address, length)
      .then(() => {
        setInterval(() => {
          that._i2cRead(callback);
        }, 50);
      });
  }

  _i2cReadRequest(address, length) {
    if (Konashi.consts.KONASHI_I2C_DATA_MAX_LENGTH < data.length) {
      return Promise.reject(new Error('The data size has to be less than ' + Konashi.consts.KONASHI_I2C_DATA_MAX_LENGTH + '.'));
    }

    var request = new Uint8Array(2);
    request[0] = length;
    request[1] = (address << 1) | 0b00000001;
    
    return this._c12c.i2cReadParameter.writeValue(request);
  }
  
  _i2cRead(callback){
    this._c12c.i2cRead.readValue()
      .then((buf) => {
        callback(buf);
      });
  }

  // I2C }

  // { SPI

  // TODO: 
  spiMode(mode, speed, bitOrder) {}
  spiWrite(data) {}
  spiRead() {}

  // SPI }

  // { Hardware Control

  /**
   * Disconnect
   */
  disconnect() {
    return this._gatt.disconnect();
  }

  /**
   * Reset hardware
   */
  reset() {
    return this._c12c.hardwareReset.writeValue(new Uint8Array([1]));
  }

  /**
   * Read battery level
   *
   * @returns {Promise<Number>}
   */
  batteryLevelRead() {
    return new Promise((resolve, reject) => {
      this._gatt.getPrimaryService('battery_service')
        .then(service => {
          return service.getCharacteristic('battery_level');
        })
        .then(v => {
          resolve(new Uint8Array(v)[0]);
        });
    });
  }

  /**
   * TODO: Read deivce's RSSI
   *
   * @returns {Number} RSSI
   */
  signalStrengthRead() {}

  // Hardware Control }
}

module.exports = Konashi;
module.exports.default = Konashi;

