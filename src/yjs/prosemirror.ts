// import { prosemirrorJSONToYDoc } from "y-prosemirror";
// import { schema } from "prosemirror-schema-basic";
// import * as Y from "yjs";

export const makeInitContent = (): Uint8Array => {
  //   const ydoc = prosemirrorJSONToYDoc(schema, {
  //     content: [
  //       {
  //         text: "This area is dedicated to my personal book notes that Im electing to publicly share via Project AMPLE.",
  //         type: "text",
  //       },
  //     ],
  //     type: "paragraph",
  //   });

  //   const update = Y.encodeStateAsUpdate(ydoc);

  //   const update = new Uint8Array([
  //     1, 5, 188, 136, 249, 158, 12, 21, 71, 188, 136, 249, 158, 12, 1, 6, 4, 0,
  //     188, 136, 249, 158, 12, 21, 8, 116, 101, 115, 116, 117, 115, 101, 114, 199,
  //     188, 136, 249, 158, 12, 0, 188, 136, 249, 158, 12, 10, 3, 9, 112, 97, 114,
  //     97, 103, 114, 97, 112, 104, 7, 0, 188, 136, 249, 158, 12, 30, 6, 4, 0, 188,
  //     136, 249, 158, 12, 31, 9, 112, 97, 115, 115, 87, 111, 114, 100, 49, 0,
  //   ]);

  //   const ydoc = new Y.Doc();
  //   ydoc.getXmlFragment().insert(0, [new Y.XmlElement("p")]);
  //   const update = Y.encodeStateAsUpdate(ydoc);

  const update = new Uint8Array([
    1, 3, 153, 203, 149, 80, 0, 7, 1, 7, 100, 101, 102, 97, 117, 108, 116, 3, 9,
    112, 97, 114, 97, 103, 114, 97, 112, 104, 7, 0, 153, 203, 149, 80, 0, 6, 4,
    0, 153, 203, 149, 80, 1, 12, 69, 120, 97, 109, 112, 108, 101, 32, 84, 101,
    120, 116, 0,
  ]);
  console.log(`init content: ${update}`);
  return update;
};
