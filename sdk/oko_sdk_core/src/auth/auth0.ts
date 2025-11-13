import auth0 from "auth0-js";

const AUTH0_DOMAIN = "dev-0v00qjwpomau3ldk.us.auth0.com";
const AUTH0_CLIENT_ID = "AMtmlNKxJiNY7abqewmq9mjERf2TOlfo";
const AUTH0_CONNECTION = "email";

let webAuthInstance: auth0.WebAuth | null = null;

export function getAuth0WebAuth(): auth0.WebAuth {
  if (!webAuthInstance) {
    webAuthInstance = new auth0.WebAuth({
      domain: AUTH0_DOMAIN,
      clientID: AUTH0_CLIENT_ID,
      responseType: "token id_token",
      scope: "openid profile email",
    });
  }
  return webAuthInstance;
}

export async function sendAuth0EmailCode(email: string): Promise<void> {
  const webAuth = getAuth0WebAuth();

  return new Promise((resolve, reject) => {
    webAuth.passwordlessStart(
      {
        connection: AUTH0_CONNECTION,
        send: "code",
        email,
      },
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      },
    );
  });
}
