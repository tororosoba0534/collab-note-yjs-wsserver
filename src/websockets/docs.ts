import WSSharedDoc from "./WSSharedDoc";

const docs = new Map<string, WSSharedDoc>();
export default docs;

export const getYDoc = (docname: string, gc = true): [WSSharedDoc, boolean] => {
  const existing = docs.get(docname);
  if (existing) {
    return [existing, false];
  }

  const doc = new WSSharedDoc(docname);
  doc.gc = gc;

  docs.set(docname, doc);

  return [doc, true];
};
