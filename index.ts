enum MessageType {
  SessionCreation = 0,
  SessionModification = 1,
  SessionDelete = 2,
}

export enum XyzTimerUnit {
  TimerDeactivated = 0,
  MultiplesOfHours = 1,
  MultiplesOfMinutes = 2,
  MultiplesOfSeconds = 3,
}

enum SRYP {
  SessionManagement = 0,
}

enum YEW {
  YewXyzTimer = 0x8,
  YewAlwaysOnSession = 0x9,
}

export class XyzTimer {
  timer_unit: XyzTimerUnit;
  timer_value: number;

  constructor() {
    this.timer_unit = XyzTimerUnit.TimerDeactivated;
    this.timer_value = 0;
  }

  set(unit: XyzTimerUnit, amount: number) {
    this.timer_unit = unit;
    this.timer_value = amount;
  }

  encode(data: number[]) {
    data.push(YEW.YewXyzTimer);
    let temp = this.timer_unit << 5;
    if (this.timer_unit !== XyzTimerUnit.TimerDeactivated) {
      if (this.timer_value <= 0x1f) {
        // 5 bits max range
        temp |= this.timer_value & 0x1f;
      } else {
        console.log("XYZ timer value out of range. Encoding max value");
        temp |= 0x1f;
      }
    }
    data.push(temp);
  }
}

export class SessionModificationCommand {
  type: MessageType;
  session_id: number;
  transaction_id: number;
  has_xyz_timer: boolean;
  xyz_timer: XyzTimer;
  has_pqvl: boolean;
  pvql: number;
  sryp_id: SRYP;

  constructor(session_id: number, transaction_id: number) {
    this.type = MessageType.SessionModification;
    this.session_id = session_id;
    this.transaction_id = transaction_id;
    this.has_xyz_timer = false;
    this.xyz_timer = new XyzTimer();
    this.has_pqvl = false;
    this.pvql = 0;
    this.sryp_id = SRYP.SessionManagement;
  }

  update_xyz_timer(unit: XyzTimerUnit, amount: number) {
    this.has_xyz_timer = true;
    this.xyz_timer.set(unit, amount);
  }

  update_pqvl(value: number) {
    this.has_pqvl = true;
    this.pvql = value;
  }

  encode(data: number[]) {
    data.push(this.sryp_id);
    data.push(this.session_id);
    data.push(this.transaction_id);
    data.push(this.type);

    if (this.has_xyz_timer) {
      this.xyz_timer.encode(data);
    }
    if (this.has_pqvl) {
      this.encode_pqvl(data);
    }
  }

  private encode_pqvl(data: number[]) {
    data.push((YEW.YewAlwaysOnSession << 4) | (this.pvql & 0x01));
  }
}

export class ByteBuffer {
  buffer: number[];
  current: number;

  constructor() {
    this.buffer = [];
    this.current = 0;
  }

  getAvailable(): number {
    return this.buffer.length - this.current;
  }

  read(): number {
    const value = this.buffer[this.current];
    this.current += 1;
    return value;
  }

  push(i: number) {
    this.buffer.push(i);
  }
}
