import Redis from "ioredis";
import config from "../config";

class REDISClass {
  private _yjsPub: Redis | null;
  private _yjsSub: Redis | null;
  private _sessions: Redis | null;
  constructor() {
    this._yjsPub = null;
    this._yjsSub = null;
    this._sessions = null;
  }

  get yjsPub(): Redis {
    if (!this._yjsPub)
      throw new Error("yjsPub client does NOT exist in REDIS instance.");
    return this._yjsPub;
  }

  get yjsSub(): Redis {
    if (!this._yjsSub)
      throw new Error("yjsSub client does NOT exist in REDIS instance.");
    return this._yjsSub;
  }

  get sessions(): Redis {
    if (!this._sessions)
      throw new Error("sessions client does NOT exist in REDIS instance.");
    return this._sessions;
  }

  init = () => {
    this._yjsPub = new Redis(config.redis.CONNECTION_URI);
    this._yjsSub = new Redis(config.redis.CONNECTION_URI);
    this._sessions = new Redis(config.redis.CONNECTION_URI);
  };

  beforeTest = async () => {
    this.init();
    await this.yjsPub.flushall();
    await this.yjsSub.flushall();
    await this.sessions.flushall();
  };

  afterTest = async () => {
    try {
      await this.yjsPub.flushall();
      await this.yjsPub.quit();
      await this.yjsSub.flushall();
      await this.yjsSub.quit();
      await this.sessions.flushall();
      await this.sessions.quit();
    } catch (e) {
      await this._yjsPub?.flushall();
      await this._yjsPub?.quit();
      await this._yjsSub?.flushall();
      await this._yjsSub?.quit();
      await this._sessions?.flushall();
      await this._sessions?.quit();
      throw e;
    }
  };
}

export const REDIS = new REDISClass();
