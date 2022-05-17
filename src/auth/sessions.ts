export const usersStore = new Map<string, string>([
  ["user1", "password1"],
  ["user2", "password2"],
  ["test", "test"],
]);

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
