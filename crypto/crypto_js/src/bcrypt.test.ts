import { describe, it } from "@jest/globals";

import { comparePassword, hashPassword, KNOWN_HASH_FROM_0000 } from "./bcrypt";

describe("bcrypt_hash_test_1", () => {
  it("compare password", async () => {
    for (let i = 0; i < 5; i += 1) {
      const pw = await hashPassword("0000");
      console.log("i: %s, pw: %s", i, pw);

      const equality = await comparePassword("0000", pw);
      console.log(equality);

      const t = await comparePassword("0000", KNOWN_HASH_FROM_0000);

      console.log(11, t);
    }
  });
});
