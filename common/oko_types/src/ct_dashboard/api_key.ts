export interface APIKey {
  key_id: string;
  customer_id: string;
  hashed_key: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
