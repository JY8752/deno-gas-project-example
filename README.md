# my-gas-project

GAS(Google App Script)のプロジェクト置き場。
以下の技術スタックを使用。

- deno
- clasp
- esbuild

denoのworkspaceを使用して複数プロジェクトを管理できるようにしている。

## setup

以下、`getujihoukoku`プロジェクトの作成例。

`packages`配下に新しくディレクトリを作成。

```
mkdir packages/getujihoukoku
cd packages/getujihoukoku
```

denoの初期化。

```
deno init
```

`clasp`のログイン。(ログインしていなければ)

```
deno run -A npm:@google/clasp@3.0.4-alpha login
```

GASプロジェクトの作成(もしくはクローン)。

```
deno run -A npm:@google/clasp@3.0.4-alpha clone <script id>
or
deno run -A npm:@google/clasp@3.0.4-alpha create
```

`deno.json`に以下を記載。

```json
{
  "name": "@my-gas-project/getujihoukoku", // package名
  "exports": {
    ".": "./main.ts" // package名を設定した場合、exportsの設定をしないと警告でるので
  },
  "tasks": {
    // rootのビルドスクリプトを実行する
    "build": "deno run -A ../../_build.ts @my-gas-project/getujihoukoku",
    // ビルドしたスクリプトをpushする
    "push": "deno run --allow-env --allow-net --allow-read --allow-sys --allow-write npm:@google/clasp@3.0.4-alpha push -f",
    // build & push
    "deploy": "deno task build && deno task push"
  }
}
```

`clasp.json`の`rootDir`を変更する。

```json
{
  "scriptId": "",
  "rootDir": "dist", // distに変更する
  "scriptExtensions": [
    ".js",
    ".gs"
  ],
  "htmlExtensions": [
    ".html"
  ],
  "jsonExtensions": [
    ".json"
  ],
  "filePushOrder": [],
  "skipSubdirectories": false
}
```

## 使用例

### build

```
deno task build
or
deno task --cwd=packages/getujihoukoku build
```

### push

```
deno task push
or
deno task --cwd=packages/getujihoukoku push
```

### deploy

```
deno task deploy
or
deno task --cwd=packages/getujihoukoku deploy
```