#!/usr/bin/env bash
# One-time setup: serve rozariochivers.com (and www.) from the private S3 bucket via CloudFront + HTTPS.
# Personal AWS account 771878896001 only. Safe to re-run: every step checks for what already exists.
#
#   ./deploy/setup-domain.sh      run it, follow the one manual step it prints (Namecheap nameservers),
#                                 then run it again to finish.
set -euo pipefail
cd "$(dirname "$0")/.."
PROFILE=default
DOMAIN=rozariochivers.com
WWW=www.$DOMAIN
BUCKET=rozariochivers-site-771878896001
REGION=ap-southeast-2
AWS="aws --profile $PROFILE"

ACCT=$($AWS sts get-caller-identity --query Account --output text)
[ "$ACCT" = "771878896001" ] || { echo "Wrong AWS account ($ACCT); expected 771878896001 (personal)."; exit 1; }
echo "AWS account: $ACCT (personal)"

# ---- 1. Route 53 hosted zone (the DNS 'address book' for the domain) -------------------------------
ZONE_ID=$($AWS route53 list-hosted-zones-by-name --dns-name "$DOMAIN." --query "HostedZones[?Name=='$DOMAIN.'].Id | [0]" --output text | sed 's#/hostedzone/##')
if [ "$ZONE_ID" = "None" ] || [ -z "$ZONE_ID" ]; then
  ZONE_ID=$($AWS route53 create-hosted-zone --name "$DOMAIN" --caller-reference "rc-$(date +%s)" --query HostedZone.Id --output text | sed 's#/hostedzone/##')
  echo "Created hosted zone $ZONE_ID"
fi
NS=$($AWS route53 get-hosted-zone --id "$ZONE_ID" --query "DelegationSet.NameServers" --output text)

# ---- 2. TLS certificate (must live in us-east-1 for CloudFront), validated by DNS -------------------
CERT_ARN=$($AWS acm list-certificates --region us-east-1 --query "CertificateSummaryList[?DomainName=='$DOMAIN'].CertificateArn | [0]" --output text)
if [ "$CERT_ARN" = "None" ] || [ -z "$CERT_ARN" ]; then
  CERT_ARN=$($AWS acm request-certificate --region us-east-1 --domain-name "$DOMAIN" --subject-alternative-names "$WWW" --validation-method DNS --query CertificateArn --output text)
  echo "Requested certificate $CERT_ARN"; sleep 8
fi
# write the validation CNAMEs into the zone (idempotent UPSERT)
$AWS acm describe-certificate --region us-east-1 --certificate-arn "$CERT_ARN" \
  --query "Certificate.DomainValidationOptions[].ResourceRecord" --output json > /tmp/rc-validation.json
python3 - "$ZONE_ID" <<'PY' > /tmp/rc-validation-batch.json
import json,sys
recs={(r['Name'],r['Value']) for r in json.load(open('/tmp/rc-validation.json')) if r}
print(json.dumps({"Changes":[{"Action":"UPSERT","ResourceRecordSet":{"Name":n,"Type":"CNAME","TTL":300,"ResourceRecords":[{"Value":v}]}} for n,v in recs]}))
PY
$AWS route53 change-resource-record-sets --hosted-zone-id "$ZONE_ID" --change-batch file:///tmp/rc-validation-batch.json >/dev/null

STATUS=$($AWS acm describe-certificate --region us-east-1 --certificate-arn "$CERT_ARN" --query Certificate.Status --output text)
if [ "$STATUS" != "ISSUED" ]; then
  REG_NS=$(dig +short NS "$DOMAIN" @1.1.1.1 | sort | tr '\n' ' ')
  cat <<MSG

==================================================================================================
 ONE MANUAL STEP (Namecheap)  -- certificate status: $STATUS
--------------------------------------------------------------------------------------------------
 1. Log in to namecheap.com > Domain List > rozariochivers.com > Manage.
 2. Under "NAMESERVERS", choose "Custom DNS" and enter these four (no trailing dots):
$(for n in $NS; do echo "      $n"; done)
 3. Save (the green tick). Changes usually take 5-30 minutes, occasionally a few hours.
 4. Run this script again. It waits for the certificate, then builds CloudFront and the DNS records.

 Nameservers the internet currently sees: ${REG_NS:-none yet}
==================================================================================================
MSG
  # if Namecheap already points at Route 53, wait here instead of exiting
  case "$REG_NS" in *awsdns*) echo "Nameservers already delegated; waiting for the certificate (up to ~30 min)...";
    $AWS acm wait certificate-validated --region us-east-1 --certificate-arn "$CERT_ARN" ;; *) exit 0 ;; esac
fi
echo "Certificate issued."

# ---- 3. CloudFront: private-bucket access (OAC) + distribution --------------------------------------
OAC_ID=$($AWS cloudfront list-origin-access-controls --query "OriginAccessControlList.Items[?Name=='rozariochivers-oac'].Id | [0]" --output text)
if [ "$OAC_ID" = "None" ] || [ -z "$OAC_ID" ]; then
  OAC_ID=$($AWS cloudfront create-origin-access-control --origin-access-control-config \
    "Name=rozariochivers-oac,SigningProtocol=sigv4,SigningBehavior=always,OriginAccessControlOriginType=s3" --query OriginAccessControl.Id --output text)
fi
DIST_ID=$($AWS cloudfront list-distributions --query "DistributionList.Items[?contains(Aliases.Items || \`[]\`, '$DOMAIN')].Id | [0]" --output text)
if [ "$DIST_ID" = "None" ] || [ -z "$DIST_ID" ]; then
  cat > /tmp/rc-dist.json <<JSON
{
  "CallerReference": "rc-$(date +%s)",
  "Comment": "rozariochivers.com portfolio",
  "Enabled": true,
  "Aliases": {"Quantity": 2, "Items": ["$DOMAIN", "$WWW"]},
  "DefaultRootObject": "index.html",
  "Origins": {"Quantity": 1, "Items": [{
    "Id": "s3-site", "DomainName": "$BUCKET.s3.$REGION.amazonaws.com",
    "OriginAccessControlId": "$OAC_ID", "S3OriginConfig": {"OriginAccessIdentity": ""}}]},
  "DefaultCacheBehavior": {
    "TargetOriginId": "s3-site", "ViewerProtocolPolicy": "redirect-to-https", "Compress": true,
    "AllowedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"]},
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "ResponseHeadersPolicyId": "67f7725c-6f97-4210-82d7-5512b31e9d03"},
  "CustomErrorResponses": {"Quantity": 1, "Items": [{"ErrorCode": 403, "ResponsePagePath": "/index.html", "ResponseCode": "404", "ErrorCachingMinTTL": 60}]},
  "PriceClass": "PriceClass_200",
  "HttpVersion": "http2and3",
  "IsIPV6Enabled": true,
  "ViewerCertificate": {"ACMCertificateArn": "$CERT_ARN", "SSLSupportMethod": "sni-only", "MinimumProtocolVersion": "TLSv1.2_2021"}
}
JSON
  DIST_ID=$($AWS cloudfront create-distribution --distribution-config file:///tmp/rc-dist.json --query Distribution.Id --output text)
  echo "Created CloudFront distribution $DIST_ID"
fi
echo "$DIST_ID" > deploy/.distribution-id
DIST_DOMAIN=$($AWS cloudfront get-distribution --id "$DIST_ID" --query Distribution.DomainName --output text)

# ---- 4. Bucket policy: only this distribution may read the bucket ----------------------------------
cat > /tmp/rc-policy.json <<JSON
{"Version":"2012-10-17","Statement":[{"Sid":"CloudFrontRead","Effect":"Allow",
 "Principal":{"Service":"cloudfront.amazonaws.com"},"Action":"s3:GetObject","Resource":"arn:aws:s3:::$BUCKET/*",
 "Condition":{"StringEquals":{"AWS:SourceArn":"arn:aws:cloudfront::$ACCT:distribution/$DIST_ID"}}}]}
JSON
$AWS s3api put-bucket-policy --bucket "$BUCKET" --policy file:///tmp/rc-policy.json

# ---- 5. DNS: rozariochivers.com and www -> CloudFront (A + AAAA alias records) ----------------------
python3 - "$DIST_DOMAIN" "$DOMAIN" "$WWW" <<'PY' > /tmp/rc-alias.json
import json,sys
d,*names=sys.argv[1:]
ch=[{"Action":"UPSERT","ResourceRecordSet":{"Name":n,"Type":t,"AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":d,"EvaluateTargetHealth":False}}} for n in names for t in ("A","AAAA")]
print(json.dumps({"Changes":ch}))
PY
$AWS route53 change-resource-record-sets --hosted-zone-id "$ZONE_ID" --change-batch file:///tmp/rc-alias.json >/dev/null

cat <<DONE

Done. CloudFront takes ~5-15 minutes to deploy worldwide, then the site is live at:
   https://$DOMAIN   and   https://$WWW
   (temporary address while DNS settles: https://$DIST_DOMAIN)
Future updates: ./deploy/publish.sh
DONE
