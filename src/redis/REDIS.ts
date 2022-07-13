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

  beforeTest = () => {
    this.init();
    this.yjsPub.flushall();
    this.yjsSub.flushall();
    this.sessions.flushall();
  };

  afterTest = () => {
    try {
      this.yjsPub.flushall();
      this.yjsPub.quit();
      this.yjsSub.flushall();
      this.yjsSub.quit();
      this.sessions.flushall();
      this.sessions.quit();
    } catch (e) {
      this._yjsPub?.flushall();
      this._yjsPub?.quit();
      this._yjsSub?.flushall();
      this._yjsSub?.quit();
      this._sessions?.flushall();
      this._sessions?.quit();
      throw e;
    }
  };
}

export const REDIS = new REDISClass();
