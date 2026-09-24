const fs = require('fs');
const path = require('path');

const fineServiceDir = path.join(__dirname, 'backend/fine-service/src');

if (!fs.existsSync(fineServiceDir)) {
    fs.mkdirSync(fineServiceDir, { recursive: true });
}

// Generate basic fine-service files
console.log('Setup fine service...');
