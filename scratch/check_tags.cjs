const fs = require('fs');
const content = fs.readFileSync('c:/Users/jeya god/Downloads/Rhythm-Rise-main/Rhythm-Rise-main/src/app/LoginPage.tsx', 'utf8');
const lines = content.split('\n');

let level = 0;
let tags = [];

const pattern = /<([a-zA-Z0-9]+)|<\/([a-zA-Z0-9]+)>|<>/g;
// Simplified check
let openFragments = 0;
let closeFragments = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/<>/g) || []).length;
    const closes = (line.match(/<\/>/g) || []).length;
    openFragments += opens;
    closeFragments += closes;
    if (opens > 0 || closes > 0) {
        console.log(`Line ${i+1}: Open=${opens}, Close=${closes} | ${line.trim()}`);
    }
}

console.log(`Total: Open=${openFragments}, Close=${closeFragments}`);
