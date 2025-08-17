const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Listen for console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || text.includes('401') || text.includes('expired') || text.includes('Token')) {
      console.log(`[${type.toUpperCase()}] ${text}`);
    }
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message);
  });

  // Listen for response errors
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`[HTTP ${response.status()}] ${response.url()}`);
    }
  });

  console.log('Loading app...');
  await page.goto('http://localhost:4200', { waitUntil: 'networkidle2' });
  
  console.log('Waiting for app to initialize...');
  await page.waitForTimeout(3000);

  // Check if any 401 errors occurred
  console.log('Checking for authentication errors...');
  
  // Try to navigate to login page
  await page.goto('http://localhost:4200/public/login', { waitUntil: 'networkidle2' });
  await page.waitForTimeout(2000);
  
  console.log('Test completed.');
  
  await browser.close();
})();