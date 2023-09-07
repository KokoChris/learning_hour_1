import { SessionModificationCommand, ByteBuffer, XyzTimerUnit } from "./index";

class HexStringEncoder {
  encode(buffer: ByteBuffer): string {
    let s = "";
    while (buffer.getAvailable() > 0) {
      const octet = buffer.read();
      const tmp1 = (octet >> 4) & 0x0f;
      const tmp2 = octet & 0x0f;

      const char1 =
        tmp1 <= 9
          ? tmp1.toString()
          : String.fromCharCode(tmp1 - 10 + "a".charCodeAt(0));
      const char2 =
        tmp2 <= 9
          ? tmp2.toString()
          : String.fromCharCode(tmp2 - 10 + "a".charCodeAt(0));
      const str3 = char1 + char2;

      s += str3;
    }
    return s;
  }
}

describe("SessionModificationCommand", () => {
  it("should encode correctly", () => {
    const command = new SessionModificationCommand(1, 1);
    const data = new ByteBuffer();
    command.update_xyz_timer(XyzTimerUnit.MultiplesOfHours, 23);
    command.update_pqvl(1);
    command.encode(data.buffer);
    const hexEncoder = new HexStringEncoder();
    let hexStr = hexEncoder.encode(data);
    expect(hexStr).toBe("00010101083791");
    command.update_xyz_timer(XyzTimerUnit.MultiplesOfMinutes, 32); // outside range(32), expect 31
    command.encode(data.buffer);
    hexStr = hexEncoder.encode(data);
    expect(hexStr).toBe("00010101085f91");
    command.update_xyz_timer(XyzTimerUnit.TimerDeactivated, 2); // deactivated, expect value 0
    command.encode(data.buffer);
    hexStr = hexEncoder.encode(data);
    expect(hexStr).toBe("00010101080091");
  });
});
