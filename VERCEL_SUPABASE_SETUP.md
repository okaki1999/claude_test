# Vercel + Supabase 環境変数設定ガイド

## Vercelでの環境変数設定

Vercelプロジェクトの「Settings」→「Environment Variables」で以下を設定してください：

### 必須環境変数

```bash
# Supabase Database URLs
DATABASE_URL=postgresql://postgres.[your-project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.[your-project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:5432/postgres

# NextAuth Configuration
NEXTAUTH_SECRET=lPww1dtNx40VgZz67wJU7J2prFIDdnO05veUl0jkcVQ=
NEXTAUTH_URL=https://your-vercel-app.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Supabase設定手順

1. **Supabaseプロジェクト作成**
   - [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
   - 新しいプロジェクトを作成

2. **データベース接続情報取得**
   - Settings → Database → Connection string
   - Session mode (6543番ポート) → `DATABASE_URL`
   - Direct connection (5432番ポート) → `DIRECT_URL`

3. **Row Level Security (RLS) 設定**
   ```sql
   -- テーブル作成後に実行
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
   ```

## Google OAuth設定

1. **Google Cloud Console**
   - [Google Cloud Console](https://console.cloud.google.com/) にアクセス
   - APIs & Services → Credentials

2. **OAuth 2.0 Client ID作成**
   - 「CREATE CREDENTIALS」→「OAuth client ID」
   - Application type: Web application
   - Authorized redirect URIs:
     ```
     https://your-vercel-app.vercel.app/api/auth/callback/google
     ```

3. **認証情報を取得**
   - Client ID と Client Secret をコピー
   - Vercelの環境変数に設定

## デプロイ後の確認

1. **データベーステーブル確認**
   - Supabase Dashboard → Table Editor
   - users, accounts, sessions, verification_tokens テーブルが作成されているか確認

2. **認証テスト**
   - デプロイされたサイトにアクセス
   - 「Sign in with Google」ボタンをクリック
   - Google OAuth フローが正常に動作するか確認

## トラブルシューティング

### ビルドエラーの場合
```bash
# Vercel Function Logs で確認
- Prisma generation エラー → DATABASE_URL 確認
- Environment validation エラー → 必須環境変数の設定確認
```

### 認証エラーの場合
```bash
# NextAuth.js エラー
- NEXTAUTH_URL が本番URLと一致しているか確認
- Google OAuth のリダイレクトURIが正しく設定されているか確認
```

### データベース接続エラー
```bash
# Supabase接続エラー
- DATABASE_URL と DIRECT_URL の形式確認
- Supabaseプロジェクトのパスワードが正しいか確認
```
