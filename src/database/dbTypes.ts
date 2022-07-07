export type DBUsers = {
  id: string;
  password: string;
  admin_password: string;
};

export type DBSessions = {
  session_id: string;
  user_id: string;
  expire_at: number;
};
