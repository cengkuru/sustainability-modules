const fetch = require('node-fetch');

async function testBrowserLogin() {
  console.log('Simulating browser login flow...\n');
  
  try {
    // Step 1: Login via frontend service (simulating what the browser does)
    console.log('1. Testing login through frontend AuthService pattern...');
    
    // First, authenticate with Firebase
    const firebaseResponse = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyC8EH_FvMbb2tlORrMAu87MVWGwPel13fQ', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'michael@cengkuru.com',
        password: '12345678',
        returnSecureToken: true
      })
    });
    
    const firebaseResult = await firebaseResponse.json();
    
    if (!firebaseResult.idToken) {
      console.log('❌ Firebase authentication failed:', firebaseResult.error);
      return;
    }
    
    console.log('✅ Firebase authentication successful');
    console.log('   Token obtained');
    
    // Step 2: Try the Cloud Function with the actual deployed URL
    console.log('\n2. Testing Cloud Function at deployed URL...');
    const cloudFunctionUrls = [
      'https://us-central1-climatefinance-2dcc3.cloudfunctions.net/authExchange',
      'https://authexchange-u4jmtvqupq-uc.a.run.app'
    ];
    
    for (const url of cloudFunctionUrls) {
      console.log(`   Trying ${url.includes('cloudfunctions.net') ? 'Firebase URL' : 'Cloud Run URL'}...`);
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firebaseResult.idToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
        
        const text = await response.text();
        
        if (response.ok) {
          const result = JSON.parse(text);
          if (result.success) {
            console.log(`   ✅ Success! User profile retrieved:`);
            console.log(`      Name: ${result.user.name}`);
            console.log(`      Email: ${result.user.email}`);
            console.log(`      Roles: ${result.user.roles}`);
            console.log(`      Admin: ${result.user.roles.includes('admin') ? 'Yes' : 'No'}`);
            break;
          } else {
            console.log(`   ❌ Failed: ${result.message}`);
          }
        } else {
          console.log(`   ❌ HTTP ${response.status}: ${text.substring(0, 100)}`);
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
      }
    }
    
    // Step 3: Test backend API
    console.log('\n3. Testing backend API with Firebase token...');
    const backendResponse = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${firebaseResult.idToken}`
      }
    });
    
    const backendResult = await backendResponse.json();
    
    if (backendResult.success) {
      console.log('✅ Backend accepts Firebase token');
      console.log(`   User: ${backendResult.user.name} (${backendResult.user.email})`);
      console.log(`   Roles: ${backendResult.user.roles}`);
    } else {
      console.log('❌ Backend rejected token:', backendResult.message);
    }
    
    // Summary
    console.log('\n=== AUTHENTICATION STATUS ===');
    console.log('Firebase Auth: ✅ Working');
    console.log('Cloud Function: Check results above');
    console.log('Backend API: Check results above');
    console.log('\nYou can now login at http://localhost:4200');
    console.log('Email: michael@cengkuru.com');
    console.log('Password: 12345678');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testBrowserLogin();