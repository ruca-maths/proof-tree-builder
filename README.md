# Proof Tree Builder

Proof Tree Builder は、自然演繹などの証明図を視覚的に構築できる教育用ウェブツールです。
React と React Flow を使用した直観的な UI と、Lean 4 をバックエンドに使用した厳密な検証機能を備えています。

## プロジェクト構成

- `frontend/`: React + TypeScript + Vite によるユーザーインターフェース。
- `backend/`: Node.js (Express) による証明検証サーバー。

## クイックスタート

### セットアップ

```bash
# フロントエンドのセットアップ
cd frontend
npm install

# バックエンドのセットアップ
cd ../backend
npm install
```

### 開発用サーバーの起動

1. バックエンドを起動:
   ```bash
   cd backend
   npm run dev
   ```

2. フロントエンドを起動:
   ```bash
   cd frontend
   npm run dev
   ```

## ライセンス

MIT License
