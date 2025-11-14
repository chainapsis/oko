import { validateAuth0IdToken } from "./validate";
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from "./client_id";

describe("validateAuth0IdToken", () => {
  it("should validate a valid Auth0 ID token", async () => {
    const idToken = "temp";
    const expectedEmail = "test@gmail.com";

    const result = await validateAuth0IdToken({
      idToken,
      expectedEmail,
      clientId: AUTH0_CLIENT_ID,
      domain: AUTH0_DOMAIN,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe(expectedEmail);
      expect(result.data.emailVerified).toBe(true);
      expect(result.data.sub).toBeTruthy();
    }
  });
});
