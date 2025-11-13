import auth0 from "auth0-js";

export const AUTH0_DOMAIN = "dev-0v00qjwpomau3ldk.us.auth0.com";
export const AUTH0_CLIENT_ID = "AMtmlNKxJiNY7abqewmq9mjERf2TOlfo";
export const AUTH0_CONNECTION = "email";

let instance: auth0.WebAuth | null = null;

export function getAuth0WebAuth(): auth0.WebAuth {
  if (!instance) {
    instance = new auth0.WebAuth({
      domain: AUTH0_DOMAIN,
      clientID: AUTH0_CLIENT_ID,
      responseType: "token id_token",
      scope: "openid profile email",
    });
  }
  return instance;
}
