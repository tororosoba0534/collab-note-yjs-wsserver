export class Session {
  expiresAt: Date;
  username: string;
  constructor(username: string, expiresAt: Date) {
    this.username = username;
    this.expiresAt = expiresAt;
  }

  isExpired() {
    return this.expiresAt < new Date();
  }
}

export const sessionsStore = new Map<string, Session>();
