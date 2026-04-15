const test = require("node:test");
const assert = require("node:assert/strict");
const { ethers } = require("ethers");
const { decodeRevertData } = require("../src/relayerLog");

test("decodeRevertData parses PoolErr(uint8)", () => {
  const iface = new ethers.Interface(["error PoolErr(uint8 code)"]);
  const data = iface.encodeErrorResult("PoolErr", [5]);
  const out = decodeRevertData(data);
  assert.ok(out && out.includes("PoolErr(5)"), out);
});

test("decodeRevertData returns null for empty", () => {
  assert.equal(decodeRevertData(""), null);
});
