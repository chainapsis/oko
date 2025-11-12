import { sendMsgToIframe } from "./methods/send_msg_to_iframe";
import { openModal } from "./methods/open_modal";
import { signIn } from "./methods/sign_in";
import { signOut } from "./methods/sign_out";
import { getPublicKey } from "./methods/get_public_key";
import { getEmail } from "./methods/get_email";
import { closeModal } from "./methods/close_modal";
import { on } from "./methods/on";
import { startEmailSignIn } from "./methods/start_email_sign_in";
import type { OkoWalletInterface } from "./types";
import { init } from "./static/init";
import { OkoWallet } from "./constructor";

OkoWallet.init = init;

const ptype: OkoWalletInterface = OkoWallet.prototype;

ptype.openModal = openModal;
ptype.closeModal = closeModal;
ptype.sendMsgToIframe = sendMsgToIframe;
ptype.signIn = signIn;
ptype.signOut = signOut;
ptype.getPublicKey = getPublicKey;
ptype.getEmail = getEmail;
ptype.startEmailSignIn = startEmailSignIn;
ptype.on = on;

export { OkoWallet };
