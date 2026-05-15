const fs = require('fs');
const content = fs.readFileSync('c:/Users/jeya god/Downloads/Rhythm-Rise-main/Rhythm-Rise-main/src/app/LoginPage.tsx', 'utf8');

let stack = [];
const tags = content.match(/<([a-zA-Z0-9]+)|<\/([a-zA-Z0-9]*)|<>/g);

let fragments = 0;
let divs = 0;
let forms = 0;

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/<([a-zA-Z0-9]+)|<\/([a-zA-Z0-9]*)|<>/g);
    if (m) {
        m.forEach(tag => {
            if (tag === '<div') divs++;
            if (tag === '</div') divs--;
            if (tag === '<form') forms++;
            if (tag === '</form') forms--;
            if (tag === '<>') fragments++;
            if (tag === '</') fragments--;
        });
    }
}

console.log(`Fragments: ${fragments}`);
console.log(`Divs: ${divs}`);
console.log(`Forms: ${forms}`);
