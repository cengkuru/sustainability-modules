const fetch = require('node-fetch');

async function testLogin() {
  console.log('Testing Firebase authentication and MongoDB integration...\n');
  
  // Step 1: Authenticate with Firebase
  console.log('1. Authenticating with Firebase...');
  const firebaseAuth = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyC8EH_FvMbb2tlORrMAu87MVWGwPel13fQ', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'michael@cengkuru.com',
      password: '12345678',
      returnSecureToken: true
    })
  });
  
  const authResult = await firebaseAuth.json();
  
  if (authResult.idToken) {
    console.log('✅ Firebase authentication successful');
    console.log('   Email:', authResult.email);
    console.log('   Token (first 20 chars):', authResult.idToken.substring(0, 20) + '...');
    
    // Step 2: Exchange token with Cloud Function
    console.log('\n2. Exchanging token with Cloud Function...');
    const exchangeResponse = await fetch('https://us-central1-climatefinance-2dcc3.cloudfunctions.net/authExchange', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authResult.idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const exchangeResult = await exchangeResponse.json();
    
    if (exchangeResult.success) {
      console.log('✅ Token exchange successful');
      console.log('   User:', exchangeResult.user);
      
      // Check admin role
      if (exchangeResult.user.roles && exchangeResult.user.roles.includes('admin')) {
        console.log('✅ User has admin role');
      } else {
        console.log('❌ User does not have admin role');
      }
    } else {
      console.log('❌ Token exchange failed:', exchangeResult.message);
    }
    
    // Step 3: Test backend API with Firebase token
    console.log('\n3. Testing backend API with Firebase token...');
    const backendResponse = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${authResult.idToken}`
      }
    });
    
    const backendResult = await backendResponse.json();
    
    if (backendResult.success) {
      console.log('✅ Backend API accepts Firebase token');
      console.log('   User from backend:', backendResult.user);
    } else {
      console.log('❌ Backend API rejected token:', backendResult.message);
    }
    
  } else {
    console.log('❌ Firebase authentication failed:', authResult.error);
  }
}

testLogin().catch(console.error);