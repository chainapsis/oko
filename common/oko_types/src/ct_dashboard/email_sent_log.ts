export type EmailSentLogType =
  | "INACTIVE_CUSTOMER_USER"
  | "UNVERIFIED_CUSTOMER_USER";

export interface EmailSentLog {
  log_id: string;
  target_id: string;
  type: EmailSentLogType;
  email: string;
  sent_at: Date;
}

export interface InsertEmailSentLogRequest {
  target_id: string;
  type: EmailSentLogType;
  email: string;
}
