# Getting Firebase Service Account Credentials

To run the migration from Firebase to MongoDB, you need to create a service account key for your Firebase project. Follow these steps:

## Step 1: Navigate to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `climatefinance-2dcc3`

## Step 2: Create a Service Account

1. In the left sidebar, click on the gear icon ⚙️ (Settings) and select "Project settings"
2. Click on the "Service accounts" tab
3. Click on "Generate new private key" button
4. Click "Generate key" to confirm
5. A JSON file will be downloaded to your computer

## Step 3: Set Up the Service Account in Your Project

1. Rename the downloaded file to `firebase-service-account.json`
2. Move the file to the root directory of your project

## Step 4: Run the Migration

Now you can run the migration with:

```bash
npm run migrate
```

## Security Note

The `firebase-service-account.json` file contains sensitive credentials that grant access to your Firebase project. Make sure to:

1. Never commit this file to version control (it should be in .gitignore)
2. Store it securely and don't share it publicly
3. Consider using environment variables for production environments 