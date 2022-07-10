import { prosemirrorJSONToYDoc } from "y-prosemirror";
import { schema } from "prosemirror-schema-basic";
import * as Y from "yjs";

const testUpdate = () => {
  const ydoc = prosemirrorJSONToYDoc(schema, {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Example Text",
          },
        ],
      },
    ],
  });

  const update = Y.encodeStateAsUpdate(ydoc);
  console.log(`created update: ${update}`);
};

testUpdate();
