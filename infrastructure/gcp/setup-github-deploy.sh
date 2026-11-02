#!/usr/bin/env bash
# One-time setup that lets GitHub Actions deploy this repository to Cloud Run
# using Workload Identity Federation (no service account keys).
#
# Usage (Cloud Shell or any shell with gcloud authenticated as a project owner):
#   bash infrastructure/gcp/setup-github-deploy.sh
#
# Every command targets PROJECT_ID explicitly; nothing touches other projects.
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-loan-system-demo-gf}"
REGION="${REGION:-us-central1}"
REPOSITORY="${REPOSITORY:-GiovaneFreu/loan-system-workspace}"
AR_REPO="${AR_REPO:-cloud-run-source-deploy}"
POOL_ID="github"
PROVIDER_ID="github-actions"
SA_NAME="github-deployer"

PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
RUNTIME_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Project: $PROJECT_ID ($PROJECT_NUMBER) | repository: $REPOSITORY"

gcloud services enable iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com \
  run.googleapis.com artifactregistry.googleapis.com --project "$PROJECT_ID"

# Artifact Registry repository for the images (created by `gcloud run deploy --source` if it exists)
gcloud artifacts repositories describe "$AR_REPO" --location "$REGION" --project "$PROJECT_ID" >/dev/null 2>&1 ||
  gcloud artifacts repositories create "$AR_REPO" --repository-format=docker \
    --location "$REGION" --project "$PROJECT_ID"

# Keep image storage small: delete images older than 7 days, always keeping the 3 most recent
gcloud artifacts repositories set-cleanup-policies "$AR_REPO" --location "$REGION" --project "$PROJECT_ID" \
  --policy="$(dirname "$0")/artifact-cleanup-policy.json" --no-dry-run --quiet >/dev/null

# Deployer service account with the minimum roles it needs
gcloud iam service-accounts describe "$SA_EMAIL" --project "$PROJECT_ID" >/dev/null 2>&1 ||
  gcloud iam service-accounts create "$SA_NAME" --display-name="GitHub Actions deployer" --project "$PROJECT_ID"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" --role="roles/run.admin" --condition=None --quiet >/dev/null
gcloud artifacts repositories add-iam-policy-binding "$AR_REPO" --location "$REGION" --project "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" --role="roles/artifactregistry.writer" --quiet >/dev/null
gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SA" --project "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" --role="roles/iam.serviceAccountUser" --quiet >/dev/null

# Workload Identity Federation: only this repository's main branch can impersonate the deployer
gcloud iam workload-identity-pools describe "$POOL_ID" --location=global --project "$PROJECT_ID" >/dev/null 2>&1 ||
  gcloud iam workload-identity-pools create "$POOL_ID" --location=global \
    --display-name="GitHub Actions" --project "$PROJECT_ID"

gcloud iam workload-identity-pools providers describe "$PROVIDER_ID" --location=global \
  --workload-identity-pool="$POOL_ID" --project "$PROJECT_ID" >/dev/null 2>&1 ||
  gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" --location=global \
    --workload-identity-pool="$POOL_ID" --project "$PROJECT_ID" \
    --display-name="GitHub Actions OIDC" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
    --attribute-condition="assertion.repository == '${REPOSITORY}' && assertion.ref == 'refs/heads/main'"

gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" --project "$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${REPOSITORY}" \
  --quiet >/dev/null

echo
echo "Done. Values used by .github/workflows/deploy-cloud-run.yml:"
echo "  WORKLOAD_IDENTITY_PROVIDER: projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"
echo "  SERVICE_ACCOUNT:            ${SA_EMAIL}"
