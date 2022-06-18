import WSSharedDoc from "./WSSharedDoc";
import * as Y from "yjs";
import { YjsDB } from "./YjsDB";
import { error2String } from "../utils/errorHandlings";

const _innerDocs = new Map<string, WSSharedDoc>();

export class YDocsStore {
  static get = async (docname: string, gc = true): Promise<WSSharedDoc> => {
    const existing = _innerDocs.get(docname);
    if (existing) {
      return existing;
    }

    const newDoc = new WSSharedDoc(docname);
    newDoc.gc = gc;

    _innerDocs.set(docname, newDoc);

    const err = await applyExistingBundledUpdate(newDoc);

    if (err) throw err;

    return newDoc;
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
