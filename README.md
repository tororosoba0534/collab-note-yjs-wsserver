# Welcome to Collab-Note-YJS !!!

Collab-Note-YJS is a multi-repo project which divided by two repositories (frontend and backend). This repository is the **_backend_** part. [You can access deployed project from here!](https://collab-note-yjs.herokuapp.com/)

## Tech stack

- TypeScript
- Express
  - web server
- [ws](https://github.com/websockets/ws)
  - websocket server
- [Yjs](https://docs.yjs.dev/)
  - implementation of CRDT(Conflict-free Replicated Data Type)
  - core technology of collaborative functionality
- PostgreSQL
- [knex](https://knexjs.org/)
  - query builder for JavaScript
- Redis
- [jest](https://jestjs.io/)
  - testing library for JavaScript

## Related repositories

- [collab-note-yjs-client](https://github.com/tororosoba0534/collab-note-yjs-client)
  - The frontend of the entire project.
- [sample-dnd](https://github.com/tororosoba0534/sample-dnd)
  - If possible, I'd like to combine this to frontend code.

## Reference

[kapv89/yjs-scalable-ws-backend](https://github.com/kapv89/yjs-scalable-ws-backend) was really helpful for me to construct websocket server and yjs persistence system. Thanks a lot!
