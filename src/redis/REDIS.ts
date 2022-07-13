import Redis from "ioredis";

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

  set yjsPub(newYjsPub: Redis) {
    this._yjsPub = newYjsPub;
  }

  set yjsSub(newYjsSub: Redis) {
    this._yjsSub = newYjsSub;
  }

  set sessions(newSessions: Redis) {
    this._sessions = newSessions;
  }
}

export const REDIS = new REDISClass();
