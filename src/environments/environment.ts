export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyDtkRuIf89vZjKuShvRFNJ46rYsP-wZZeo',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'oc4ids-prototype',
    storageBucket: 'gs://oc4ids-prototype.appspot.com',
    messagingSenderId: '161085171504',
    appId: '1:161085171504:web:c029d76c9096ae2b694af5'
  },
  // here maps api key
    hereMapsApiKey: 'bo0uc_5TPAXOiS7C10x1rrlkJ1J7v9ezqiWOmtFi_Ik',
  firebaseAdminConfig: {
    type: "service_account",
    project_id: "your-project-id",
    private_key_id: "your-private-key-id",
    private_key: "-----BEGIN PRIVATE KEY-----\nYOUR-PRIVATE-KEY\n-----END PRIVATE KEY-----\n",
    client_email: "your-client-email@your-project-id.iam.gserviceaccount.com",
    client_id: "your-client-id",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/your-client-email@your-project-id.iam.gserviceaccount.com"
  }
};
