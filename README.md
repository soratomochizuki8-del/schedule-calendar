# 📅 スケジュール調整カレンダー

友達同士で空いている日を共有するカレンダーアプリです。  
ログイン不要・URLを共有するだけでリアルタイムに同期します。

---

## 🚀 セットアップ手順（初心者向け）

### ステップ1：Firebaseプロジェクトを作る

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. **「プロジェクトを追加」** をクリック
3. プロジェクト名を入力（例：`schedule-calendar`）して作成

### ステップ2：Firestoreデータベースを有効化

1. 左メニューの **「Firestore Database」** をクリック
2. **「データベースの作成」** をクリック
3. **「本番環境モード」** を選択 → 地域は `asia-northeast1`（東京）を選択
4. 「有効にする」をクリック

### ステップ3：Firestoreセキュリティルールを設定

1. Firestoreの **「ルール」** タブをクリック
2. 以下のルールに書き換えて **「公開」** をクリック：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /calendars/{calendarId} {
      allow read, write: if true;
    }
  }
}
```

### ステップ4：WebアプリのFirebase設定を取得

1. プロジェクト概要 → **歯車アイコン（設定）** → 「プロジェクトの設定」
2. 「マイアプリ」セクション → **「</>」（Webアプリ）** をクリック
3. アプリ名を入力して登録
4. 表示された `firebaseConfig` をコピーしておく

### ステップ5：アプリの設定

```bash
# リポジトリをクローン（またはZIPを展開）
cd schedule-calendar

# 依存パッケージをインストール
npm install

# 環境変数ファイルを作成
cp .env.local.example .env.local
```

`.env.local` を開いて、ステップ4でコピーした値を貼り付け：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### ステップ6：ローカルで動作確認

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く ✅

---

## 🌐 Vercelにデプロイ（無料）

### 方法1：GitHub経由（推奨）

1. [GitHub](https://github.com) にこのプロジェクトをアップロード
2. [Vercel](https://vercel.com) にサインイン → **「New Project」**
3. GitHubリポジトリを選択してインポート
4. **「Environment Variables」** に `.env.local` の内容を追加
5. **「Deploy」** をクリック → 数分でデプロイ完了！

### 方法2：Vercel CLIを使う

```bash
npm install -g vercel
vercel login
vercel --prod
```

プロンプトに従って進め、環境変数の入力を求められたら設定する。

---

## 🔗 URLで共有する方法

デプロイ後、以下のURLを友達に送るだけ：

```
https://your-app.vercel.app/?id=grounp-abc123
```

`id` パラメータでグループを分けられます。  
同じ `id` を使った全員が同じカレンダーをリアルタイムで見られます。

---

## 📱 使い方

1. **名前**と**色**を選ぶ
2. **参加人数**を設定（例：8人）
3. **日付をクリック**して空いている日にドットを追加
4. もう一度クリックで削除（トグル）
5. ドット数が参加人数と一致した日は🟢緑でハイライト

---

## 🛠 技術スタック

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Firebase Firestore**（リアルタイムDB）

---

## 📂 ファイル構成

```
schedule-calendar/
├── app/
│   ├── layout.tsx      # ルートレイアウト
│   ├── page.tsx        # カレンダーメインページ
│   └── globals.css     # グローバルCSS
├── lib/
│   ├── firebase.ts     # Firebase初期化
│   └── types.ts        # 型定義
├── .env.local.example  # 環境変数テンプレート
├── firestore.rules     # Firestoreセキュリティルール
└── README.md
```
