export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyC8EH_FvMbb2tlORrMAu87MVWGwPel13fQ",
    authDomain: "climatefinance-2dcc3.firebaseapp.com",
    projectId: "climatefinance-2dcc3",
    storageBucket: "climatefinance-2dcc3.firebasestorage.app",
    messagingSenderId: "993076839525",
    appId: "1:993076839525:web:5ecca7490c360d6217b28c",
    measurementId: "G-9SMFYWX11N"
  },

  hereMapsApiKey: 'bo0uc_5TPAXOiS7C10x1rrlkJ1J7v9ezqiWOmtFi_Ik',
  googleMapsApiKey: 'AIzaSyCICX3x9r4n2zeKberNRIXXoUUvcldkMiM',
  googleGeminiApiKey: 'AIzaSyDTmExS22AJ9heWYD0ZBXt4VU2_JRmgWfQ',
  
  // MongoDB Configuration
  mongodb: {
    connectionString: 'mongodb+srv://michael:I8atyUtCA21b3Az2@prototype.ncqh9de.mongodb.net/?retryWrites=true&w=majority&appName=prototype',
    apiUrl: 'http://localhost:3000/api' // Local API endpoint
  },
  
  // Feature flag for database selection
  useMongoDb: false // Set to true to use MongoDB instead of Firebase
};
