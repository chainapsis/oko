import type { OkoSolWalletInterface } from "./types";
import { init } from "./static/init";
import { OkoSolWallet } from "./constructor";
import { connect } from "./methods/connect";
import { disconnect } from "./methods/disconnect";
import { signTransaction } from "./methods/sign_transaction";
import { signAllTransactions } from "./methods/sign_all_transactions";
import { signMessage } from "./methods/sign_message";
import { sendTransaction } from "./methods/send_transaction";
import { signAndSendTransaction } from "./methods/sign_and_send_transaction";
import { signAndSendAllTransactions } from "./methods/sign_and_send_all_transactions";

OkoSolWallet.init = init;

const ptype: OkoSolWalletInterface = OkoSolWallet.prototype;

ptype.connect = connect;
ptype.disconnect = disconnect;
ptype.signTransaction = signTransaction;
ptype.signAllTransactions = signAllTransactions;
ptype.signMessage = signMessage;
ptype.sendTransaction = sendTransaction;
ptype.signAndSendTransaction = signAndSendTransaction;
ptype.signAndSendAllTransactions = signAndSendAllTransactions;

export { OkoSolWallet };
