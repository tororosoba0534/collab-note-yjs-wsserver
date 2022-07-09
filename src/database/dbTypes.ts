export type DBUsers = {
  id: string;
  hash: string;
  admin_hash: string;
};

export type DBSessions = {
  session_id: string;
  user_id: string;
  expire_at: number;
};
