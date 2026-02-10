/**
 * diagnosis/monitoring_script.js
 * 
 * This script simulates the external monitoring or the self-ping mechanism.
 * It checks if the bot's web server is responding.
 */

const http = require('http');

const URL = 'http://localhost:3000'; // Default local URL

function checkStatus() {
    console.log(`Checking status at ${URL}...`);
    http.get(URL, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log(`Status Code: ${res.statusCode}`);
            try {
                const json = JSON.parse(data);
                console.log('Response:', json);
                if (res.statusCode === 200 && json.status === 'alive') {
                    console.log('✅ Server is ALIVE');
                } else {
                    console.log('❌ Server returned unexpected response');
                }
            } catch (e) {
                console.log('Response (text):', data);
            }
        });
    }).on('error', (err) => {
        console.error('❌ Connection Error:', err.message);
        console.log('Is the bot running? (node bot.js)');
    });
}

// If run directly
if (require.main === module) {
    checkStatus();
}

module.exports = checkStatus;
