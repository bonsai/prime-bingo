# PRIME BINGO

素数をテーマにした、学習向けミニゲーム集です。npm workspaces によるモノレポ構成で、ブラウザ版（`web/`）とターミナル版 TUI（`tui/`）を分割管理しています。既存の素数・倍数学習プロトタイプを残しつつ、独立して遊べる2つのモードを用意しています。

## ゲームモード

### 1. 素数ハンター 🎯
- 画面内を動く数字をタップして素数を集めるアクションゲーム
- 黄金色の素数は +10 点、素数ではない数字は −5 点
- 60秒制限。時間とともに数字の生成頻度と移動速度が上がります
- 一時停止・リスタート対応

### 2. 素数ビンゴ 🎱
- 素数を使った5×5のビンゴカード
- 数字を順番に引き、呼ばれた数字をカード上でマーク
- 縦・横・斜めのラインをそろえてビンゴを目指します
- 新しいカードで何度でも遊べます

### 3. Prime Fall ⚡（`tui/`・ターミナル版）
- 7×7 グリッドの教育パズル：**隣接する倍数で割れると複数が崩れ、素数は絶対に崩れない**
- 破壊の連鎖でボーナス、素数に囲まれた複数の「罠収穫」でボーナス
- 要件定義: `tui/prime-fall-prd.yaml`（起動は下記「tui」参照）

## 起動方法

### web（ブラウザ版）
- `web/index.html` をブラウザで開くと、2モードをそのままプレイできます。
- GitHub Pages: ルートの `index.html` が `web/` へ自動リダイレクトします（リポジトリ設定の **Pages → Deploy from a branch → main / root**）。

### tui（ターミナル版 Prime Fall）
```bash
npm install     # リポジトリルートで実行（workspaces により tui の依存も入る）
npm run tui     # = npm run start --workspace tui（tsx src/index.tsx）
```

- 単体で動かす場合: `cd tui && npm install && npm start`

## ファイル構成（モノレポ / npm workspaces）

```
.
├── package.json          # workspaces: ["web", "tui"]
├── ideas.yaml            # 3つのアイデア整理（素数ハンター / 素数ビンゴ / Prime Fall）
├── index.html            # GitHub Pages 用エントリ → web/ へリダイレクト
├── web/                  # ブラウザ版（依存なし）
│   ├── index.html        # 2モード切替の本体（Vanilla HTML/CSS/JS）
│   ├── src/PrimeBingo.tsx    # 元のReact版「倍数を消して素数を集める」プロトタイプ
│   ├── prd.yaml          # 元プロトタイプの要件定義
│   └── package.json
└── tui/                  # ターミナル版 Prime Fall（ink + tsx）
    ├── src/index.tsx     # TUI 本体
    ├── src/game/         # rules / grid / spawn / scoring
    ├── prime-fall-prd.yaml   # 要件定義
    └── package.json
```

## 技術方針

- 公開・お試し用の `web/index.html` は Vanilla HTML / CSS / JavaScript。ビルド不要
- `tui/` は Ink（React for terminal）+ tsx。workspaces で web と依存を分離
- 元のReact / TypeScript実装は学習ロジックの参照用として保持
- 素数判定はクライアントサイドで完結
- スマートフォンのタップ操作に対応
- アカウント・サーバー・外部ライブラリは不要

## 今後の整理

- [ ] React版と単体HTML版の仕様をそろえるか決める
- [ ] モードごとの動作テストを追加する
- [ ] GitHub Pagesで公開確認する
