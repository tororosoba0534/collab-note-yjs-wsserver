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

  //   const update = new Uint8Array([
  //     1, 3, 153, 203, 149, 80, 0, 7, 1, 7, 100, 101, 102, 97, 117, 108, 116, 3, 9,
  //     112, 97, 114, 97, 103, 114, 97, 112, 104, 7, 0, 153, 203, 149, 80, 0, 6, 4,
  //     0, 153, 203, 149, 80, 1, 12, 69, 120, 97, 109, 112, 108, 101, 32, 84, 101,
  //     120, 116, 0,
  //   ]);

  //   const update = new Uint8Array([
  //     1, 9, 183, 231, 190, 243, 15, 0, 7, 1, 7, 100, 101, 102, 97, 117, 108, 116,
  //     3, 9, 112, 97, 114, 97, 103, 114, 97, 112, 104, 7, 0, 183, 231, 190, 243,
  //     15, 0, 6, 4, 0, 183, 231, 190, 243, 15, 1, 29, 87, 69, 76, 67, 79, 77, 69,
  //     32, 84, 79, 32, 67, 111, 108, 108, 97, 98, 45, 78, 111, 116, 101, 45, 89,
  //     74, 83, 33, 33, 33, 135, 183, 231, 190, 243, 15, 0, 3, 9, 112, 97, 114, 97,
  //     103, 114, 97, 112, 104, 7, 0, 183, 231, 190, 243, 15, 31, 6, 4, 0, 183, 231,
  //     190, 243, 15, 32, 164, 1, 84, 104, 105, 115, 32, 116, 101, 120, 116, 32,
  //     105, 115, 32, 103, 101, 110, 101, 114, 97, 116, 101, 100, 32, 102, 105, 114,
  //     115, 116, 32, 111, 110, 32, 99, 108, 105, 101, 110, 116, 32, 115, 105, 100,
  //     101, 32, 97, 115, 32, 116, 105, 112, 116, 97, 112, 32, 99, 111, 110, 116,
  //     101, 110, 116, 44, 32, 116, 104, 101, 110, 32, 99, 111, 112, 121, 32, 116,
  //     104, 101, 32, 115, 97, 109, 101, 32, 98, 105, 110, 97, 114, 121, 32, 85,
  //     105, 110, 116, 56, 65, 114, 114, 97, 121, 44, 32, 97, 110, 100, 32, 115,
  //     116, 111, 114, 101, 32, 105, 116, 32, 100, 105, 114, 101, 99, 116, 108, 121,
  //     32, 105, 110, 32, 112, 111, 115, 116, 103, 114, 101, 115, 32, 119, 104, 101,
  //     110, 32, 116, 104, 105, 115, 32, 97, 99, 99, 111, 117, 110, 116, 32, 105,
  //     115, 32, 99, 114, 101, 97, 116, 101, 100, 46, 135, 183, 231, 190, 243, 15,
  //     31, 3, 9, 112, 97, 114, 97, 103, 114, 97, 112, 104, 7, 0, 183, 231, 190,
  //     243, 15, 197, 1, 6, 4, 0, 183, 231, 190, 243, 15, 198, 1, 81, 78, 111, 119,
  //     32, 115, 101, 101, 107, 105, 110, 103, 32, 116, 104, 101, 32, 111, 116, 104,
  //     101, 114, 32, 119, 97, 121, 32, 116, 111, 32, 99, 117, 115, 116, 111, 109,
  //     105, 115, 101, 32, 116, 104, 101, 32, 109, 97, 115, 115, 97, 103, 101, 32,
  //     100, 101, 112, 101, 110, 100, 105, 110, 103, 32, 116, 111, 32, 117, 115,
  //     101, 114, 73, 68, 32, 111, 110, 32, 115, 101, 114, 118, 101, 114, 46, 0,
  //   ]);

  const update = new Uint8Array([
    1, 67, 227, 168, 131, 210, 14, 0, 7, 1, 7, 100, 101, 102, 97, 117, 108, 116,
    3, 7, 104, 101, 97, 100, 105, 110, 103, 7, 0, 227, 168, 131, 210, 14, 0, 6,
    4, 0, 227, 168, 131, 210, 14, 1, 11, 87, 69, 76, 67, 79, 77, 69, 32, 116,
    111, 32, 134, 227, 168, 131, 210, 14, 12, 9, 117, 110, 100, 101, 114, 108,
    105, 110, 101, 2, 123, 125, 132, 227, 168, 131, 210, 14, 13, 15, 67, 111,
    108, 108, 97, 98, 45, 78, 111, 116, 101, 45, 89, 74, 83, 134, 227, 168, 131,
    210, 14, 28, 9, 117, 110, 100, 101, 114, 108, 105, 110, 101, 4, 110, 117,
    108, 108, 132, 227, 168, 131, 210, 14, 29, 4, 32, 33, 33, 33, 40, 0, 227,
    168, 131, 210, 14, 0, 9, 116, 101, 120, 116, 65, 108, 105, 103, 110, 1, 119,
    6, 99, 101, 110, 116, 101, 114, 40, 0, 227, 168, 131, 210, 14, 0, 5, 108,
    101, 118, 101, 108, 1, 125, 1, 135, 227, 168, 131, 210, 14, 0, 3, 7, 104,
    101, 97, 100, 105, 110, 103, 7, 0, 227, 168, 131, 210, 14, 36, 6, 4, 0, 227,
    168, 131, 210, 14, 37, 25, 99, 114, 101, 97, 116, 101, 100, 32, 98, 121, 32,
    116, 111, 114, 111, 114, 111, 115, 111, 98, 97, 48, 53, 51, 52, 40, 0, 227,
    168, 131, 210, 14, 36, 9, 116, 101, 120, 116, 65, 108, 105, 103, 110, 1,
    119, 5, 114, 105, 103, 104, 116, 40, 0, 227, 168, 131, 210, 14, 36, 5, 108,
    101, 118, 101, 108, 1, 125, 2, 135, 227, 168, 131, 210, 14, 36, 3, 9, 112,
    97, 114, 97, 103, 114, 97, 112, 104, 40, 0, 227, 168, 131, 210, 14, 65, 9,
    116, 101, 120, 116, 65, 108, 105, 103, 110, 1, 119, 4, 108, 101, 102, 116,
    135, 227, 168, 131, 210, 14, 65, 3, 9, 112, 97, 114, 97, 103, 114, 97, 112,
    104, 7, 0, 227, 168, 131, 210, 14, 67, 6, 4, 0, 227, 168, 131, 210, 14, 68,
    67, 84, 104, 105, 115, 32, 99, 111, 110, 116, 101, 110, 116, 32, 105, 115,
    32, 106, 117, 115, 116, 32, 97, 110, 32, 101, 120, 97, 109, 112, 108, 101,
    44, 32, 115, 111, 32, 121, 111, 117, 32, 99, 97, 110, 32, 102, 114, 101,
    101, 108, 121, 32, 111, 118, 101, 114, 119, 114, 105, 116, 101, 32, 105,
    116, 240, 159, 147, 157, 40, 0, 227, 168, 131, 210, 14, 67, 9, 116, 101,
    120, 116, 65, 108, 105, 103, 110, 1, 119, 4, 108, 101, 102, 116, 135, 227,
    168, 131, 210, 14, 67, 3, 9, 112, 97, 114, 97, 103, 114, 97, 112, 104, 40,
    0, 227, 168, 131, 210, 14, 135, 1, 9, 116, 101, 120, 116, 65, 108, 105, 103,
    110, 1, 119, 4, 108, 101, 102, 116, 135, 227, 168, 131, 210, 14, 135, 1, 3,
    9, 112, 97, 114, 97, 103, 114, 97, 112, 104, 7, 0, 227, 168, 131, 210, 14,
    137, 1, 6, 4, 0, 227, 168, 131, 210, 14, 138, 1, 42, 89, 111, 117, 32, 99,
    97, 110, 32, 115, 101, 108, 101, 99, 116, 32, 115, 111, 109, 101, 32, 116,
    101, 120, 116, 115, 32, 97, 110, 100, 32, 99, 104, 97, 110, 103, 101, 32,
    116, 104, 101, 109, 32, 134, 227, 168, 131, 210, 14, 180, 1, 4, 98, 111,
    108, 100, 2, 123, 125, 132, 227, 168, 131, 210, 14, 181, 1, 4, 98, 111, 108,
    100, 134, 227, 168, 131, 210, 14, 185, 1, 4, 98, 111, 108, 100, 4, 110, 117,
    108, 108, 132, 227, 168, 131, 210, 14, 186, 1, 2, 44, 32, 134, 227, 168,
    131, 210, 14, 188, 1, 6, 105, 116, 97, 108, 105, 99, 2, 123, 125, 132, 227,
    168, 131, 210, 14, 189, 1, 6, 105, 116, 97, 108, 105, 99, 134, 227, 168,
    131, 210, 14, 195, 1, 6, 105, 116, 97, 108, 105, 99, 4, 110, 117, 108, 108,
    132, 227, 168, 131, 210, 14, 196, 1, 2, 44, 32, 134, 227, 168, 131, 210, 14,
    198, 1, 9, 117, 110, 100, 101, 114, 108, 105, 110, 101, 2, 123, 125, 132,
    227, 168, 131, 210, 14, 199, 1, 10, 117, 110, 100, 101, 114, 108, 105, 110,
    101, 100, 134, 227, 168, 131, 210, 14, 209, 1, 9, 117, 110, 100, 101, 114,
    108, 105, 110, 101, 4, 110, 117, 108, 108, 132, 227, 168, 131, 210, 14, 210,
    1, 6, 44, 32, 97, 110, 100, 32, 134, 227, 168, 131, 210, 14, 216, 1, 4, 99,
    111, 100, 101, 2, 123, 125, 132, 227, 168, 131, 210, 14, 217, 1, 8, 99, 111,
    100, 101, 76, 105, 107, 101, 134, 227, 168, 131, 210, 14, 225, 1, 4, 99,
    111, 100, 101, 4, 110, 117, 108, 108, 132, 227, 168, 131, 210, 14, 226, 1,
    1, 46, 40, 0, 227, 168, 131, 210, 14, 137, 1, 9, 116, 101, 120, 116, 65,
    108, 105, 103, 110, 1, 119, 6, 99, 101, 110, 116, 101, 114, 135, 227, 168,
    131, 210, 14, 137, 1, 3, 9, 112, 97, 114, 97, 103, 114, 97, 112, 104, 40, 0,
    227, 168, 131, 210, 14, 229, 1, 9, 116, 101, 120, 116, 65, 108, 105, 103,
    110, 1, 119, 4, 108, 101, 102, 116, 135, 227, 168, 131, 210, 14, 229, 1, 3,
    9, 112, 97, 114, 97, 103, 114, 97, 112, 104, 7, 0, 227, 168, 131, 210, 14,
    231, 1, 6, 4, 0, 227, 168, 131, 210, 14, 232, 1, 35, 65, 108, 115, 111, 32,
    121, 111, 117, 32, 109, 97, 121, 32, 116, 117, 114, 110, 32, 97, 32, 112,
    97, 114, 97, 103, 114, 97, 112, 104, 32, 105, 110, 116, 111, 58, 40, 0, 227,
    168, 131, 210, 14, 231, 1, 9, 116, 101, 120, 116, 65, 108, 105, 103, 110, 1,
    119, 4, 108, 101, 102, 116, 135, 227, 168, 131, 210, 14, 231, 1, 3, 10, 98,
    117, 108, 108, 101, 116, 76, 105, 115, 116, 7, 0, 227, 168, 131, 210, 14,
    141, 2, 3, 8, 108, 105, 115, 116, 73, 116, 101, 109, 7, 0, 227, 168, 131,
    210, 14, 142, 2, 3, 9, 112, 97, 114, 97, 103, 114, 97, 112, 104, 7, 0, 227,
    168, 131, 210, 14, 143, 2, 6, 4, 0, 227, 168, 131, 210, 14, 144, 2, 22, 98,
    117, 108, 108, 101, 116, 32, 108, 105, 115, 116, 32, 108, 105, 107, 101, 32,
    116, 104, 105, 115, 33, 40, 0, 227, 168, 131, 210, 14, 143, 2, 9, 116, 101,
    120, 116, 65, 108, 105, 103, 110, 1, 119, 4, 108, 101, 102, 116, 135, 227,
    168, 131, 210, 14, 143, 2, 3, 10, 98, 117, 108, 108, 101, 116, 76, 105, 115,
    116, 7, 0, 227, 168, 131, 210, 14, 168, 2, 3, 8, 108, 105, 115, 116, 73,
    116, 101, 109, 7, 0, 227, 168, 131, 210, 14, 169, 2, 3, 9, 112, 97, 114, 97,
    103, 114, 97, 112, 104, 7, 0, 227, 168, 131, 210, 14, 170, 2, 6, 4, 0, 227,
    168, 131, 210, 14, 171, 2, 30, 40, 97, 110, 100, 32, 121, 111, 117, 32, 99,
    97, 110, 32, 109, 97, 107, 101, 32, 110, 101, 115, 116, 32, 100, 101, 101,
    112, 101, 114, 41, 40, 0, 227, 168, 131, 210, 14, 170, 2, 9, 116, 101, 120,
    116, 65, 108, 105, 103, 110, 1, 119, 4, 108, 101, 102, 116, 135, 227, 168,
    131, 210, 14, 141, 2, 3, 9, 112, 97, 114, 97, 103, 114, 97, 112, 104, 40, 0,
    227, 168, 131, 210, 14, 203, 2, 9, 116, 101, 120, 116, 65, 108, 105, 103,
    110, 1, 119, 4, 108, 101, 102, 116, 135, 227, 168, 131, 210, 14, 203, 2, 3,
    9, 99, 111, 100, 101, 66, 108, 111, 99, 107, 7, 0, 227, 168, 131, 210, 14,
    205, 2, 6, 4, 0, 227, 168, 131, 210, 14, 206, 2, 98, 47, 47, 32, 111, 114,
    32, 99, 111, 100, 101, 45, 108, 105, 107, 101, 32, 115, 116, 121, 108, 101,
    46, 10, 32, 32, 32, 32, 101, 120, 112, 111, 114, 116, 32, 99, 111, 110, 115,
    116, 32, 103, 114, 101, 101, 116, 105, 110, 103, 32, 61, 32, 40, 41, 32, 61,
    62, 32, 123, 10, 32, 32, 32, 32, 32, 32, 99, 111, 110, 115, 111, 108, 101,
    46, 108, 111, 103, 40, 34, 72, 101, 108, 108, 111, 32, 119, 111, 114, 108,
    100, 33, 34, 41, 10, 32, 32, 32, 32, 125, 135, 227, 168, 131, 210, 14, 205,
    2, 3, 9, 112, 97, 114, 97, 103, 114, 97, 112, 104, 40, 0, 227, 168, 131,
    210, 14, 177, 3, 9, 116, 101, 120, 116, 65, 108, 105, 103, 110, 1, 119, 4,
    108, 101, 102, 116, 0,
  ]);

  // console.log(`init content: ${update}`);
  return update;
};
