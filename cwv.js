/** 
 * 
 * 
*/

// Dependencies
var sf = require('./support_functions.js');
const { chromium } = require('playwright');

// start URL
var myArgs = process.argv.slice(2);

myURL = myArgs[0] ? myArgs[0] : "https://juliencoquet.com/en/";
filename = "cwv.csv";
filename = myArgs[1] ?  myArgs[1] : filename;
  
console.log("Starting scan for " + myURL);
startTime = new Date();
sf.hit2csv(startTime,filename,myURL); 

// Launching browser, everything below this is async
(async () => {
  // Starting headless browser
  const browser = await chromium.launch({
    headless: true, 
    devtools: true,
    bypassCSP: true,
    args: [
      '--disable-web-security', 
      '--disable-site-isolation-trials', 
      '--ignore-certificate-errors',
      '--disable-features=IsolateOrigins,site-per-process',
    ]
  });
  
  const context = await browser.newContext();
  
  const page = await context.newPage();

  // Configure the navigation timeout
  await page.setDefaultNavigationTimeout(0);
  // Navigate to the specified URL
  
  const resp = await page.goto(myURL);
  // In your playwright script, assuming the preload.js file is in same directory

  // Inject a SCRIPT tag with an async element creation.
  // Define cloud function location here
  await page.addScriptTag({
    content: `
    function sendToCF({name, id, value, delta, navigationType, rating}) {
      var ts = Date.now();
      var url = document.location;
      var base_url="https://corewebvitals-o7qenrdm2a-ew.a.run.app/storeCWV?";
      base_url += "ts="+ts+"&";
      base_url += "url="+url+"&";
      base_url += "name="+name+"&";
      base_url += "id="+id+"&";
      base_url += "value="+value+"&";
      base_url += "delta="+delta+"&";
      base_url += "navigationType="+navigationType+"&";
      base_url += "rating="+rating;
      console.log("Sending CWV hit to " + base_url);
      var img = document.createElement("img");
      img.src = base_url;
      document.getElementsByTagName('head')[0].appendChild(img);
    }
  `});
  await page.addScriptTag({
    content: `
      var cwv_script = document.createElement('script');
      cwv_script.src = 'https://unpkg.com/web-vitals/dist/web-vitals.iife.js';
      document.getElementsByTagName('head')[0].appendChild(cwv_script);
    `
  });  
  await page.mouse.click(1, 1);

  // Wait for the webVitals variable to be available
  await page.waitForFunction(() => 'webVitals' in window);
  
  // Add the CWV listeners and send the data to the Cloud Function
  await page.addScriptTag({
    content: `
    webVitals.onCLS(sendToCF);
    webVitals.onFCP(sendToCF);
    webVitals.onFID(sendToCF);
    webVitals.onINP(sendToCF);
    webVitals.onLCP(sendToCF);
    webVitals.onTTFB(sendToCF);
    `
  });  
      

  // Close browser after traffic stops
  await page.waitForLoadState('networkidle');
  await browser.close();
  
  // Time calculation for performance reasons
  endTime = new Date();
  scanTime =  endTime - startTime;
  console.log("Scanned " + myURL + " in " + scanTime/1000 + "s");

})();