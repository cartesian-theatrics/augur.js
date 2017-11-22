/* eslint-env mocha */

"use strict";

var assert = require("chai").assert;
var parseBlockMessage = require("../../../../src/events/parse-message/parse-block-message");

describe("events/parse-message/parse-block-message", function () {
  var test = function (msg) {
    it(JSON.stringify(msg), function (done) {
      parseBlockMessage(msg, function (parsed) {
        if (msg.constructor === Array) {
          if (msg[0].number) {
            assert.deepEqual(parsed, msg[0]);
          }
        } else {
          assert.deepEqual(parsed, msg);
        }
        done();
      });
    });
  };
  test({
    difficulty: "0x46015d94",
    extraData: "0xd783010500844765746887676f312e352e31856c696e7578",
    gasLimit: "0x47e7c4",
    gasUsed: "0xa410",
    hash: "0x96a9e1fd64969355521cbfd125569d6bb0088f36685200db58b77ca7a7fbebd6",
    logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    miner: "0xdf712c685be75739eb44cb6665f92129e45864e4",
    nonce: "0x32894b6becfa3b8e",
    number: "0x11941a",
    parentHash: "0xeada45540e0e1505ac0b6759e429ce8dc24a65c6e4c9bc3346a0cd3f22297d1e",
    receiptRoot: "0x204590761a4d9f825ebf97f82f663979e78ce7caab303688bc6815e62b5f012b",
    sha3Uncles: "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
    size: "0x302",
    stateRoot: "0x381b58ccdb2a890a89b9f7e6110429acadb2884199962497a267ef3b054e3c52",
    timestamp: "0x576469fe",
    totalDifficulty: "0xf109f9a4e6f3",
    transactionsRoot: "0x4f90d1155e24c3e52f0c44c6e1b5eafa4395e196339749d0453600017627df4e",
    uncles: [],
  });
  test({
    difficulty: "0x45c62a5a",
    extraData: "0xd783010500844765746887676f312e352e31856c696e7578",
    gasLimit: "0x47e7c4",
    gasUsed: "0x0",
    hash: "0xa4cd3abb9124548b39454f8a26d52edc1ba0df5e7ae026430b123829e58b31e9",
    logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    miner: "0xdf712c685be75739eb44cb6665f92129e45864e4",
    nonce: "0x179b12d04951c04b",
    number: "0x11961c",
    parentHash: "0x1272370c853752237b18561f6409f24a486ff1b842189d2e6c264b2c8b5de043",
    receiptRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
    sha3Uncles: "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
    size: "0x21b",
    stateRoot: "0x571ee6e9fc9845031a13ff885db64249405dec8fde94d6520488214f09722760",
    timestamp: "0x57648769",
    totalDifficulty: "0xf196b3653c38",
    transactionsRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
    uncles: [],
  });
  test({
    difficulty: "0x456f3e0b",
    extraData: "0xd783010500844765746887676f312e352e31856c696e7578",
    gasLimit: "0x47e7c4",
    gasUsed: "0x493e0",
    hash: "0x6eb2ccd03087179bf53e32ef89db8ae1a7d4c407c691f31c467825e631a53c02",
    logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    miner: "0xdf712c685be75739eb44cb6665f92129e45864e4",
    nonce: "0xd3764129399cdce6",
    number: "0x119633",
    parentHash: "0x9b3dda703bc0de8a2162adb1666880f1dca6f421190616733c7b5a3e127ec7eb",
    receiptRoot: "0x197e4c93706b5c8d685a47909374a99b096948295abba0578aae46708a1e4435",
    sha3Uncles: "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
    size: "0x2b6",
    stateRoot: "0x385a5bdca25f1214fd9e244ac7146cf9dfc21f6a4dfe29819cdd069b2bfc63b8",
    timestamp: "0x57648910",
    totalDifficulty: "0xf19cf28ef992",
    transactionsRoot: "0x7c416eb59638d9a58ec5f526dd1b4326f37e50fa3968700e28d5f65f704e85fc",
    uncles: [],
  });
  test([{
    difficulty: "0x456f3e0b",
    extraData: "0xd783010500844765746887676f312e352e31856c696e7578",
    gasLimit: "0x47e7c4",
    gasUsed: "0x493e0",
    hash: "0x6eb2ccd03087179bf53e32ef89db8ae1a7d4c407c691f31c467825e631a53c02",
    logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    miner: "0xdf712c685be75739eb44cb6665f92129e45864e4",
    nonce: "0xd3764129399cdce6",
    number: "0x119633",
    parentHash: "0x9b3dda703bc0de8a2162adb1666880f1dca6f421190616733c7b5a3e127ec7eb",
    receiptRoot: "0x197e4c93706b5c8d685a47909374a99b096948295abba0578aae46708a1e4435",
    sha3Uncles: "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
    size: "0x2b6",
    stateRoot: "0x385a5bdca25f1214fd9e244ac7146cf9dfc21f6a4dfe29819cdd069b2bfc63b8",
    timestamp: "0x57648910",
    totalDifficulty: "0xf19cf28ef992",
    transactionsRoot: "0x7c416eb59638d9a58ec5f526dd1b4326f37e50fa3968700e28d5f65f704e85fc",
    uncles: [],
  }]);
  test([{
    difficulty: "0x456f3e0b",
    extraData: "0xd783010500844765746887676f312e352e31856c696e7578",
    gasLimit: "0x47e7c4",
    gasUsed: "0x493e0",
    hash: "0x6eb2ccd03087179bf53e32ef89db8ae1a7d4c407c691f31c467825e631a53c02",
    logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    miner: "0xdf712c685be75739eb44cb6665f92129e45864e4",
    nonce: "0xd3764129399cdce6",
    number: undefined,
    parentHash: "0x9b3dda703bc0de8a2162adb1666880f1dca6f421190616733c7b5a3e127ec7eb",
    receiptRoot: "0x197e4c93706b5c8d685a47909374a99b096948295abba0578aae46708a1e4435",
    sha3Uncles: "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
    size: "0x2b6",
    stateRoot: "0x385a5bdca25f1214fd9e244ac7146cf9dfc21f6a4dfe29819cdd069b2bfc63b8",
    timestamp: "0x57648910",
    totalDifficulty: "0xf19cf28ef992",
    transactionsRoot: "0x7c416eb59638d9a58ec5f526dd1b4326f37e50fa3968700e28d5f65f704e85fc",
    uncles: [],
  }]);
});
