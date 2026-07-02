const fs = require('fs');
let text = fs.readFileSync('src/characters.ts', 'utf8');

// Replace blocks like:
// image: "some_url",
// avatarBg: "some_color",
// image: "",
text = text.replace(/image: "([^"]*)",\n(\s+)avatarBg: "([^"]+)",\n\s+image: "",/g, 'image: "$1",\n$2avatarBg: "$3",');

fs.writeFileSync('src/characters.ts', text);
console.log('Fixed characters.ts duplicate image fields');
