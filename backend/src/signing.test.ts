import assert from "node:assert/strict";
import { describe, it } from "node:test";
import nacl from "tweetnacl";
import { buildClaimMessage, signClaim } from "./services/signing.js";

describe("signClaim", () => {
  it("produces verifiable signatures", () => {
    const publisher = "0x" + "11".repeat(32);
    const campaignId = "0x" + "22".repeat(32);
    const message = buildClaimMessage(publisher, 1000, 7, campaignId);

    const { signature, adminPublicKey } = signClaim(message);

    const ok = nacl.sign.detached.verify(
      message,
      Buffer.from(signature, "base64"),
      Buffer.from(adminPublicKey, "base64"),
    );

    assert.ok(ok);
  });

  it("fails verification on tampered message", () => {
    const publisher = "0x" + "11".repeat(32);
    const campaignId = "0x" + "22".repeat(32);
    const message = buildClaimMessage(publisher, 1000, 7, campaignId);
    const tampered = buildClaimMessage(publisher, 2000, 7, campaignId);

    const { signature, adminPublicKey } = signClaim(message);
    const ok = nacl.sign.detached.verify(
      tampered,
      Buffer.from(signature, "base64"),
      Buffer.from(adminPublicKey, "base64"),
    );

    assert.equal(ok, false);
  });
});

