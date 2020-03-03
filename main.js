import Cocoro from './cocoro.js';

class CocoroKit {
  static get CONST() {
    return {
      SPIN: {
        RIGHT: {
          HIGH_PIN: 1,
          LOW_PIN: 2
        },
        LEFT: {
          HIGH_PIN: 4,
          LOW_PIN: 3
        }
      },
      REVERSE: {
        RIGHT: {
          HIGH_PIN: 2,
          LOW_PIN: 1
        },
        LEFT: {
          HIGH_PIN: 3,
          LOW_PIN: 4
        }
      },
      STOP: {
        RIGHT: [1, 2],
        LEFT: [3, 4]
      },
      COLOR: {
        RED: '5',
        GREEN: '6',
        BLUE: '7'
      },
      RESET: {
        ALL: 'all',
        MOTOR: 'motor',
        LED: 'led'
      }
    }
  }

  constructor(onConnected) {
    this._cocoro = new Cocoro(onConnected);
    this.onError = null;
  }

  onError(callback) {
    this.onError = callback;
  }

  _callError(error) {
    if (this.onError) {
      this.onError(error.toString());
    }
    console.log(error);
  }

  connect() {
    this._cocoro.connect('cocorokit')
      .catch(error => {
        this._callError(error);
      });
  }

  /**
   * 
   * @param {*} motorSet Cocorokit.CONST.SPIN.RIGHT|LEFT
   * @param {*} ratio 0 - 100
   */
  spin(motorSet, ratio) {
    this._cocoro.setPwmRatio(motorSet.HIGH_PIN, ratio);
    this._cocoro.setPwmRatio(motorSet.LOW_PIN, 0);
  }

  /**
   * 
   * @param {*} motorSet Cocorokit.CONST.REVERSE.RIGHT|LEFT
   * @param {*} ratio 0 - 100
   */
  reverse(motorSet, ratio) {
    this._cocoro.setPwmRatio(motorSet.HIGH_PIN, ratio);
    this._cocoro.setPwmRatio(motorSet.LOW_PIN, 0);
  }

  /**
   * 
   * @param {*} motorSet Cocorokit.CONST.STOP.RIGHT|LEFT
   */
  stop(motorSet) {
    this._cocoro.setPwmRatio(motorSet[0], 0);
    this._cocoro.setPwmRatio(motorSet[1], 0);
  }

  /**
   * 
   * @param {*} color Cocorokit.CONST.COLOR.RED|GREEN|BLUE
   * @param {*} ratio 0 - 100
   */
  color(color, ratio) {
    this._cocoro.setPwmRatio(color, ratio);
  }

  /**
   * 
   * @param {*} type Cocorokit.CONST.RESET.ALL|MOTOR|LED
   */
  reset(type) {
    this._cocoro.reset(type);
  }
}

module.exports = CocoroKit;
