const fs = require('fs');

let content = fs.readFileSync('src/characters.ts', 'utf8');

// Parse the file into a JS array (we'll just use regex or eval, wait, eval is risky with typescript).
// Let's use a simple approach: extract each character object and rebuild the array.

// It's probably easier to just write a script that regex matches each block.
const block18 = content.substring(content.indexOf('{\n    id: "18",'), content.indexOf('{\n    id: "17",'));
const block17 = content.substring(content.indexOf('{\n    id: "17",'), content.indexOf('{\n    id: "16",'));
const block16 = content.substring(content.indexOf('{\n    id: "16",'), content.lastIndexOf('];'));

// Replace all three blocks with the new order: block16, block17, block18
const finalReplaced = content.substring(0, content.indexOf('{\n    id: "18",')) + block16 + "  " + block17 + "  " + block18 + "\n];\n";

fs.writeFileSync('src/characters.ts', finalReplaced);
console.log("Reordered properly!");
