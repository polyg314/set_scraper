export PROJECT_ID=set-scraper
export REGION=us-west2
export SERVICE_NAME=set-scraper-be

echo "================================"
echo "< Deploying >"
echo "================================"

# Build image in GCP
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME
echo "================================"
echo "< Image pushed to GCP registry >"
echo "================================"

# Deploy image to Cloud Run
gcloud run deploy $SERVICE_NAME \
    --image=gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
    --region $REGION \
    # --ingress internal-and-cloud-load-balancing
echo "======================================="
echo "< Image deployed to Cloud Run service >"
echo "======================================="


open https://console.cloud.google.com/run?referrer=search&project=set-scraper
