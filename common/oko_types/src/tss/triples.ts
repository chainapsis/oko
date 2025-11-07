import type {
  MTAWait0Payload,
  MTAWait1Payload,
  RcvdTriplesMessages,
  TriplePub,
  Wait2Payload,
  Wait3Payload,
  Wait4Payload,
  Wait5Payload,
  Wait6Payload,
} from "@oko-wallet/tecdsa-interface";

export interface TriplesStep1Request {
  email: string;
  wallet_id: string;
  customer_id: string;
  msgs_1: RcvdTriplesMessages;
}

export interface TriplesStep1Response {
  session_id: string;
  msgs_0: RcvdTriplesMessages;
}

export type TriplesStep1Body = {
  msgs_1: RcvdTriplesMessages;
};

export interface TriplesStep2Request {
  email: string;
  wallet_id: string;
  session_id: string;
  wait_1: string[];
}

export interface TriplesStep2Response {
  wait_1: string[];
}

export interface TriplesStep2Body {
  session_id: string;
  wait_1: string[];
}

export interface TriplesStep3Request {
  email: string;
  wallet_id: string;
  session_id: string;
  wait_2: Wait2Payload;
}

export interface TriplesStep3Response {
  wait_2: Wait2Payload;
}

export interface TriplesStep3Body {
  session_id: string;
  wait_2: Wait2Payload;
}

export interface TriplesStep4Request {
  email: string;
  wallet_id: string;
  session_id: string;
  wait_3: Wait3Payload;
}

export interface TriplesStep4Response {
  wait_3: Wait3Payload;
}

export interface TriplesStep4Body {
  session_id: string;
  wait_3: Wait3Payload;
}

export interface TriplesStep5Request {
  email: string;
  wallet_id: string;
  session_id: string;
  wait_4: Wait4Payload;
}

export interface TriplesStep5Response {
  wait_4: Wait4Payload;
}

export interface TriplesStep5Body {
  session_id: string;
  wait_4: Wait4Payload;
}

export interface TriplesStep6Request {
  email: string;
  wallet_id: string;
  session_id: string;
  batch_random_ot_wait_0: string[][];
}

export interface TriplesStep6Response {
  batch_random_ot_wait_0: string[][];
}

export interface TriplesStep6Body {
  session_id: string;
  batch_random_ot_wait_0: string[][];
}

export interface TriplesStep7Request {
  email: string;
  wallet_id: string;
  session_id: string;
  correlated_ot_wait_0: string[];
}

export interface TriplesStep7Response {
  random_ot_extension_wait_0: string[];
}

export interface TriplesStep7Body {
  session_id: string;
  correlated_ot_wait_0: string[];
}

export interface TriplesStep8Request {
  email: string;
  wallet_id: string;
  session_id: string;
  random_ot_extension_wait_1: [string, string[]][];
}

export interface TriplesStep8Response {
  mta_wait_0: MTAWait0Payload;
}

export interface TriplesStep8Body {
  session_id: string;
  random_ot_extension_wait_1: [string, string[]][];
}

export interface TriplesStep9Request {
  email: string;
  wallet_id: string;
  session_id: string;
  mta_wait_1: MTAWait1Payload;
}

export interface TriplesStep9Response {
  is_success: boolean;
}

export interface TriplesStep9Body {
  session_id: string;
  mta_wait_1: MTAWait1Payload;
}

export interface TriplesStep10Request {
  email: string;
  wallet_id: string;
  session_id: string;
  wait_5: Wait5Payload;
  wait_6: Wait6Payload;
}

export interface TriplesStep10Response {
  wait_5: Wait5Payload;
  wait_6: Wait6Payload;
}

export interface TriplesStep10Body {
  session_id: string;
  wait_5: Wait5Payload;
  wait_6: Wait6Payload;
}

export interface TriplesStep11Request {
  email: string;
  wallet_id: string;
  session_id: string;
  pub_v: TriplePub[];
}

export interface TriplesStep11Response {
  pub_v: TriplePub[];
}

export interface TriplesStep11Body {
  session_id: string;
  pub_v: TriplePub[];
}
