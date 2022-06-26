import WSSharedDoc from "./WSSharedDoc";
import * as Y from "yjs";
import { YjsDB } from "./YjsDB";
import { error2String } from "../utils/errorHandlings";
import { IsNOTvalid } from "../utils/validations";

const _innerDocs = new Map<string, WSSharedDoc>();

export class YDocsStore {
  static get = (docname: string): WSSharedDoc | undefined => {
    return _innerDocs.get(docname);
  };

  static has = (docname: string): boolean => {
    return _innerDocs.has(docname);
  };

  static getOrCreate = async (
    docname: string,
    gc = true
  ): Promise<WSSharedDoc> => {
    const existing = this.get(docname);

    if (existing) return existing;

    const newDoc = new WSSharedDoc(docname);
    newDoc.gc = gc;

    _innerDocs.set(docname, newDoc);

    const err = await applyExistingBundledUpdate(newDoc);

    if (err) throw err;

    return newDoc;
  };

  static updateDocname = (oldName: string, newName: string): boolean => {
    if (IsNOTvalid.userID(oldName) || IsNOTvalid.userID(newName)) return false;

    if (this.has(newName)) return false;

    const doc = this.get(oldName);
    if (!doc) return false;

    doc.name = newName;
    _innerDocs.delete(oldName);
    _innerDocs.set(newName, doc);

    return true;
  };

  static delete = (docname: string): boolean => {
    return _innerDocs.delete(docname);
  };
}

const applyExistingBundledUpdate = async (
  doc: WSSharedDoc
): Promise<string> => {
  try {
    const persistedUpdates = await YjsDB.getUpdates(doc);
    const dbYDoc = new Y.Doc();

    dbYDoc.transact(() => {
      for (const u of persistedUpdates) {
        Y.applyUpdate(dbYDoc, u.update);
      }
    });

    Y.applyUpdate(doc, Y.encodeStateAsUpdate(dbYDoc));

    return "";
  } catch (e) {
    console.error(error2String(e));
    return error2String(e);
  }
};
