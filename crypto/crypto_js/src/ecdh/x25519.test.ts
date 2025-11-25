import { describe, it } from "@jest/globals";

import { generateEddsaKeypair } from "./x25519";

describe("x25519_keypair_test_1", () => {
  it("ttttt", () => {
    const keypair = generateEddsaKeypair();
    console.log(keypair);
  });
});
