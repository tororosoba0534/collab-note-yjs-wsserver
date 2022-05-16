# init markdown

like this

README.md にメモを書いていこう。

- マイナスで unordered list 書ける

# Usage

1. docker deamon が起動済みであることを確認する。

2. （開発用コンテナを初期化したい場合：）./.devcontainer/docker-data/pg ディレクトリがあれば、削除しておく。

3. `yarn run docker-up`

   - postgres と redis の開発用コンテナを起動する。

4. `yarn run start-dev`
   - 開発用サーバ起動（ホットリロード有効）
   - `yarn start`だと build 後のスクリプト起動になるので注意。環境変数が反映されない。

# TODO

- jest + server + typescript

# Dockerized Postgres & Redis

- `yarn run docker-up`
  - 開発用の Postgres と Redis のコンテナを起動
- `yarn run docker-down`

  - コンテナの停止と削除

- Postgres の初期化を行う際は、`./devcontainer/docker-data/pg`以下にあるディレクトリを削除する。
