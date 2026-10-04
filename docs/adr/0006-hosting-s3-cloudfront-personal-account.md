# 0006. Host on S3 + CloudFront in the personal AWS account

- **Status:** Accepted · 2026-10-04

## Context
Roz bought rozariochivers.com at Namecheap. Roz keeps personal projects strictly in the personal AWS account (771878896001) and GitHub `flipflop`, separate from the Mould Detect organisation.

## Decision
- Private, encrypted S3 bucket `rozariochivers-site-771878896001` (ap-southeast-2), readable only by CloudFront via Origin Access Control.
- CloudFront `E43V8YQ8YRZBM`, HTTP/2+3, HTTPS redirect, AWS managed caching and security-headers policies, `PriceClass_200`.
- ACM certificate in us-east-1 for the apex and `www`, DNS-validated.
- Route 53 hosted zone; Namecheap delegates to its four nameservers. Apex and `www` are alias A/AAAA records.
- Infra created by the idempotent `deploy/setup-domain.sh`; releases by `deploy/publish.sh`, which refuses to run against any other account.

## Consequences
HTTPS, global edge caching, no public bucket, roughly US$0.50/month (Route 53) plus cents. Infra is scripted rather than Terraform: acceptable at this size; move to IaC if more resources are added.
