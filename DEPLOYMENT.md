# Medi-Translate Vercel Deployment Guide

This project is fully optimized for deployment on [Vercel](https://vercel.com).

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com/signup](https://vercel.com/signup).
2.  **GitHub Repository**: Ensure this project is pushed to your GitHub (which it is!).

## Deployment Steps

1.  **Import Project**:
    *   Go to your [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click **"Add New..."** > **"Project"**.
    *   Find `Medi-Translate` in the list and click **"Import"**.

2.  **Configure Project**:
    *   **Framework Preset**: It should auto-detect `Next.js`.
    *   **Root Directory**: Leave as `./`.
    *   **Build Command**: Default (`next build`) is correct.

3.  **Environment Variables** (CRITICAL):
    *   Expand the **"Environment Variables"** section.
    *   Add the following key-value pair:
        *   **Key**: `GOOGLE_GENAI_API_KEY`
        *   **Value**: *[Your Google AI API Key]* (Copy this from your local `.env` file)

4.  **Deploy**:
    *   Click **"Deploy"**.
    *   Wait ~1-2 minutes for the build to complete.

## Troubleshooting

-   **"Quota Exceeded"**: If you see "Demo Mode" on the live site, check your Google Cloud Console quota or billing settings for the API key.
-   **PDF Fonts**: If characters don't appear in the PDF, ensure your language selection works correctly in the dashboard. The fonts are loaded dynamically from Google Fonts.

## Updates

Any changes you push to the `main` (or `Ritabrata`) branch will trigger an automatic redeployment on Vercel.
