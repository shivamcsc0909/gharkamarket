# Google OAuth 2.0 / Social Login Setup Guide

OfficeFuel provides native Google Social Login for customers using the standard Google OAuth 2.0 token verification API with zero third-party tracking overhead.

---

## 1. Create a Project in Google Cloud Console

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `OfficeFuel` or select your existing project.

---

## 2. Configure OAuth Consent Screen

1. In the left navigation, go to **APIs & Services** → **OAuth consent screen**.
2. Select User Type: **External** and click **Create**.
3. Fill in the App Information:
   - **App name**: `OfficeFuel`
   - **User support email**: `support@officefuel.in`
   - **App logo**: (Optional) Upload your high-res brand logo
   - **App domain**:
     - Application home page: `https://officefuel.in`
     - Application privacy policy link: `https://officefuel.in/privacy-policy`
     - Application terms of service link: `https://officefuel.in/terms`
   - **Developer contact information**: `tech@officefuel.in`
4. In **Scopes**, add `openid`, `email`, and `profile`.
5. Save and proceed.

---

## 3. Create Web OAuth Client Credentials

1. Go to **APIs & Services** → **Credentials**.
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**.
3. Select **Application type**: `Web application`.
4. Name: `OfficeFuel Web Client`.
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (for local development)
   - `https://officefuel.in` (production domain)
   - `https://www.officefuel.in`
6. Under **Authorized redirect URIs**, add:
   - `http://localhost:5173/login`
   - `https://officefuel.in/login`
7. Click **Create**.
8. Copy your **Client ID** and **Client Secret**.

---

## 4. Configure Application Environment

### In `backend/.env`:
```env
GOOGLE_CLIENT_ID=your_client_id_from_cloud_console.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### In `frontend/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_from_cloud_console.apps.googleusercontent.com
```

Rebuild the frontend bundle if changing environment variables:
```bash
cd frontend && npm run build
```
