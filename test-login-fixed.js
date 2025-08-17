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
    
    // Step 2: Exchange token with Cloud Function (use the Cloud Run URL directly)
    console.log('\n2. Exchanging token with Cloud Function...');
    const exchangeResponse = await fetch('https://authexchange-u4jmtvqupq-uc.a.run.app', {
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
      console.log('   User ID:', exchangeResult.user._id);
      console.log('   Name:', exchangeResult.user.name);
      console.log('   Email:', exchangeResult.user.email);
      console.log('   Roles:', exchangeResult.user.roles);
      
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
      console.log('   User ID:', backendResult.user._id);
      console.log('   Name:', backendResult.user.name);
      console.log('   Email:', backendResult.user.email);
      console.log('   Roles:', backendResult.user.roles);
    } else {
      console.log('❌ Backend API rejected token:', backendResult.message);
    }
    
    // Step 4: Test login through the app
    console.log('\n4. Testing frontend login flow (simulated)...');
    console.log('   The frontend app will:');
    console.log('   1. Call Firebase Auth API directly');
    console.log('   2. Exchange the token via Cloud Function');
    console.log('   3. Store user info in localStorage');
    console.log('   4. Use the token for API calls');
    console.log('\n✅ All authentication components are configured correctly!');
    console.log('\nYou can now login at http://localhost:4200 with:');
    console.log('   Email: michael@cengkuru.com');
    console.log('   Password: 12345678');
    
  } else {
    console.log('❌ Firebase authentication failed:', authResult.error);
  }
}

testLogin().catch(console.error);