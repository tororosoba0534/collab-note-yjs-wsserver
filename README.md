# init markdown

like this

README.md にメモを書いていこう。

- マイナスで unordered list 書ける

# TODO

- jest + server + typescript

# Dockerized Postgres & Redis

- `yarn run docker-up`
  - 開発用の Postgres と Redis のコンテナを起動
- `yarn run docker-down`

  - コンテナの停止と削除

- Postgres の初期化を行う際は、`./devcontainer/docker-data/pg`以下にあるディレクトリを削除する。
