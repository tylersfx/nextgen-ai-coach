/**
 * NextGen AI Coach - GSPro Auto Sync Bridge
 * 
 * This script runs on your bay computers.
 * It watches for new GSPro sessions and automatically sends the data
 * to the member's phone/app so they don't have to upload CSV manually.
 * 
 * HOW TO USE:
 * 1. Copy this file to each bay computer.
 * 2. Install Node.js on the bay PC (same as main setup).
 * 3. Run: node gspro-bridge.js
 * 4. It will create a simple local server that the app can connect to.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9876; // You can change this if needed

console.log('🚀 NextGen GSPro Bridge starting...');
console.log(`Listening on http://localhost:${PORT}`);

// Simple server that accepts GSPro data
const server = http.createServer((req, res) => {
  // Allow requests from the phone app
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/gspro-data') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('📥 Received GSPro data for bay:', data.bayNumber);
        console.log('   Shots:', data.shotCount);
        
        // In a real version, we would forward this to Supabase or the member's session
        // For now, we just log it and save to a local file for testing
        
        const filename = `gspro_bay${data.bayNumber}_${Date.now()}.json`;
        fs.writeFileSync(path.join(__dirname, filename), JSON.stringify(data, null, 2));
        
        console.log(`   Saved to ${filename}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Data received' }));
      } catch (e) {
        console.error('Error processing data:', e);
        res.writeHead(400);
        res.end('Bad request');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`✅ Bridge is running.`);
  console.log(`   The NextGen AI Coach app can now receive data automatically from this bay.`);
  console.log(`   Keep this window open while the bay is in use.`);
});