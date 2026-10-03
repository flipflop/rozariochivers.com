#!/usr/bin/env bash
# Publish the site to S3 (personal AWS account 771878896001) and refresh CloudFront.
# usage: ./deploy/publish.sh            (run from anywhere)
set -euo pipefail
cd "$(dirname "$0")/.."
PROFILE=default
BUCKET=rozariochivers-site-771878896001
DIST_ID="${DIST_ID:-$(cat deploy/.distribution-id 2>/dev/null || true)}"

ACCT=$(aws sts get-caller-identity --profile $PROFILE --query Account --output text)
[ "$ACCT" = "771878896001" ] || { echo "Wrong AWS account ($ACCT); expected 771878896001"; exit 1; }

EXCL=(--exclude ".git/*" --exclude ".gitignore" --exclude "docs/*" --exclude "deploy/*" --exclude "SPEC.md" \
      --exclude "*.py" --exclude "*.DS_Store" --exclude "shot.png" --exclude "assets/candidates/*" \
      --exclude "assets/photos/*-src.png" --exclude "*.md")

# 1. everything except HTML: cache for a day (most JS/CSS is version-tagged with ?v=)
aws s3 sync . "s3://$BUCKET" --profile $PROFILE --delete "${EXCL[@]}" --exclude "*.html" \
  --cache-control "public, max-age=86400"
# 2. HTML: always revalidate so new versions appear immediately
aws s3 sync . "s3://$BUCKET" --profile $PROFILE "${EXCL[@]}" --exclude "*" --include "*.html" \
  --cache-control "no-cache" --content-type "text/html; charset=utf-8"

if [ -n "$DIST_ID" ]; then
  aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*" --profile $PROFILE --query Invalidation.Id --output text
fi
echo "Published to s3://$BUCKET"
