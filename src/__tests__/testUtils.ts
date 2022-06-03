import { _privateRedis4Sessions } from "../redis/session";

export class TestRedisSession {
  static before = async () => {
    const status = _privateRedis4Sessions.status;
    if (status === "close" || status === "end") {
      await _privateRedis4Sessions.connect();
    }
    await _privateRedis4Sessions.flushall();
  };

  static after = async () => {
    await _privateRedis4Sessions.flushall();
    await _privateRedis4Sessions.quit();
  };
}
