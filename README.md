# Trading Screen

Exchange Simulator API用のモダンなReactトレーディング画面です。リアルタイム板情報、注文機能、約定履歴、24時間取引量表示を提供します。

## 機能概要

### 🚀 主要機能

- **リアルタイム板情報表示**: 買い/売り注文の価格・数量をビジュアル表示
- **注文機能**: 指値・成行注文の発注
- **約定履歴**: 自分の約定と全体約定をタブ切り替えで表示
- **24時間取引量**: 各銘柄の実際の取引量をリアルタイム更新
- **スプレッド情報**: 現在のスプレッドを絶対値・パーセンテージで表示
- **銘柄切り替え**: 4つのBTC取引ペアに対応
- **JWT認証**: セキュアなAPI認証
- **モックデータ対応**: APIエラー時の自動フォールバック

### 📊 対応銘柄

| 銘柄 | 名称 | タイプ |
|------|------|--------|
| G_BTCJPY | GMO BTC/JPY | 現物 |
| G_FX_BTCJPY | GMO BTC/JPY | FX |
| B_BTCJPY | bitFlyer BTC/JPY | 現物 |
| B_FX_BTCJPY | bitFlyer BTC/JPY | FX |

## 技術仕様

### フロントエンド
- **React**: 19
- **TypeScript**: 型安全な開発
- **Vite**: 高速ビルドシステム
- **CSS**: カスタムCSSによるモダンなUI

### バックエンド連携
- **REST API**: Exchange Simulator APIとの連携
- **JWT認証**: Bearer token認証
- **WebSocket風ポーリング**: リアルタイムデータ更新
- **エラーハンドリング**: 自動リトライとフォールバック

## セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn
- Exchange Simulator API (localhost:8080)

### インストール

```bash
# プロジェクトをクローン
git clone <repository-url>
cd TradingScreen

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### 環境設定

デフォルトでExchange Simulator API (http://localhost:8080) に接続します。

## 使用方法

### 1. ログイン
- 初回アクセス時に自動的にログイン画面が表示されます
- デフォルト認証情報: `testuser` / `password123`

### 2. 銘柄選択
- 画面上部のタブで取引ペアを選択
- 選択した銘柄の板情報と取引量が表示されます

### 3. 注文発注
- 右パネルの注文フォームで注文を入力
- 「最良気配取得」ボタンで現在の最良価格を自動入力
- 買い/売りボタンで注文を発注

### 4. 約定履歴確認
- 右下の約定履歴セクションで取引結果を確認
- 「自分の約定」/「全体の約定」タブで表示切り替え
- 銘柄別にフィルタリング済み

## 画面構成

### 左パネル: 板情報
- **マーケット状態**: リアルタイム稼働状況
- **24時間取引量**: 実際のAPI取引量データ
- **Ask/Bid価格**: 売り/買い注文の価格帯
- **スプレッド情報**: 現在のスプレッドとパーセンテージ
- **数量バー**: 注文量の視覚的表示

### 右パネル上部: 注文フォーム
- **注文タイプ**: 指値・成行選択
- **価格・数量入力**: 数値入力フィールド
- **最良気配取得**: ワンクリック価格設定
- **注文発注**: 買い/売りボタン

### 右パネル下部: 約定履歴
- **タブ切り替え**: 自分/全体の約定
- **時刻・銘柄・売買・数量・価格・ステータス**: 詳細情報
- **リアルタイム更新**: 5秒間隔での自動更新

## API連携

### 使用エンドポイント

#### 認証
- `POST /api/auth/login` - ログイン

#### 市場データ
- `GET /api/market/board/{symbol}` - 板情報取得
- `GET /api/executions/volume` - 24時間取引量取得

#### 取引
- `POST /api/orders/new` - 新規注文
- `GET /api/executions/history` - 自分の約定履歴
- `GET /api/executions/all` - 全体約定履歴

### 更新間隔
- **板情報**: 1秒間隔
- **約定履歴**: 5秒間隔
- **24時間取引量**: 10秒間隔

### エラー処理
- **API接続エラー**: モックデータで継続動作
- **認証エラー**: 自動再ログイン
- **タイムアウト**: 自動リトライ

## 開発情報

### プロジェクト構成

```
src/
├── components/           # Reactコンポーネント
│   ├── NewTradingScreen.tsx    # メイン画面
│   ├── DetailedOrderBook.tsx   # 板情報表示
│   ├── OrderForm.tsx           # 注文フォーム
│   ├── ExecutionHistory.tsx    # 約定履歴
│   ├── SymbolSelector.tsx      # 銘柄選択
│   ├── ApiStatusChecker.tsx    # API状態確認
│   └── ReLoginButton.tsx       # 再ログイン
├── services/             # API通信
│   └── api.ts                  # APIクライアント
├── types/                # TypeScript型定義
│   └── index.ts
├── utils/                # ユーティリティ
│   ├── formatters.ts           # データフォーマット
│   └── mockData.ts             # モックデータ
└── NewApp.css           # スタイルシート
```

### 主要コンポーネント

#### NewTradingScreen
- アプリケーションのメインコンポーネント
- 全体の状態管理とAPI呼び出し
- 銘柄切り替えとデータキャッシュ

#### DetailedOrderBook
- 板情報の詳細表示
- 数量バーとスプレッド計算
- 24時間取引量表示

#### ExecutionHistory
- 約定履歴のタブ表示
- 自分/全体の約定切り替え
- リアルタイム更新

### カスタマイズ

#### API接続先変更
```typescript
// src/services/api.ts
const API_BASE_URL = '/api'; // 接続先を変更
```

#### 更新間隔調整
```typescript
// src/components/NewTradingScreen.tsx
}, 1000); // 板情報更新間隔(ms)
}, 5000); // 約定履歴更新間隔(ms)
}, 10000); // 取引量更新間隔(ms)
```

#### 対応銘柄追加
```typescript
// src/components/NewTradingScreen.tsx
const SYMBOLS: Symbol[] = ['G_BTCJPY', 'G_FX_BTCJPY', 'B_BTCJPY', 'B_FX_BTCJPY'];
```

## トラブルシューティング

### よくある問題

#### API接続エラー
- Exchange Simulator APIが起動していることを確認
- http://localhost:8080 でアクセス可能か確認
- モックデータモードで動作確認

#### 認証エラー
- JWTトークンの有効期限を確認
- 再ログインボタンでトークン再取得
- ブラウザの開発者ツールでエラー詳細を確認

#### 取引量が0表示
- APIの時刻設定がUTCになっているか確認
- 実際に約定データが存在するか確認
- ブラウザコンソールでAPI呼び出しログを確認

### デバッグ

#### コンソールログ
```javascript
// APIコール状況
📊 Volume API call: B_FX_BTCJPY from 2025-06-29T12:00:00 to 2025-06-30T12:00:00 (UTC)

// 約定履歴更新
🔄 fetchExecutions開始: B_FX_BTCJPY, useMockData: false

// 認証状態
🔐 トークンが無効または期限切れです。再ログインが必要です。
```

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## サポート

問題や質問がある場合は、プロジェクトのIssueページでお知らせください。