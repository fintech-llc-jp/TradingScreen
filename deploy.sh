tradingscreen#!/bin/bash

# Cloud Run デプロイスクリプト
# プロジェクト: tradingscreen

set -e

# 色付きの出力用関数
print_info() {
    echo -e "\033[36m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[31m[ERROR]\033[0m $1"
}

# 設定変数
PROJECT_ID="tradingscreen"
SERVICE_NAME="trading-screen"
REGION="asia-northeast1"
PORT="8080"

print_info "Cloud Run デプロイを開始します..."

# Google Cloud CLIの認証確認
print_info "Google Cloud CLI認証を確認中..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1 > /dev/null; then
    print_error "Google Cloud CLIにログインしていません"
    print_info "以下のコマンドでログインしてください: gcloud auth login"
    exit 1
fi

# プロジェクトの設定
print_info "プロジェクト ${PROJECT_ID} を設定中..."
gcloud config set project ${PROJECT_ID}

# 必要なAPIの有効化
print_info "必要なAPIを有効化中..."
gcloud services enable run.googleapis.com --quiet
gcloud services enable cloudbuild.googleapis.com --quiet

# ビルドとデプロイ
print_info "アプリケーションをビルド・デプロイ中..."
gcloud run deploy ${SERVICE_NAME} \
    --source . \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --port ${PORT} \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "NODE_ENV=production"

# デプロイ結果の確認
if [ $? -eq 0 ]; then
    print_success "デプロイが完了しました！"
    
    # サービスURLを取得して表示
    SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")
    print_success "アプリケーションURL: ${SERVICE_URL}"
    
    print_info "デプロイされたサービスの詳細:"
    gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="table(metadata.name,status.url,status.conditions[0].type,status.conditions[0].status)"
else
    print_error "デプロイに失敗しました"
    exit 1
fi
