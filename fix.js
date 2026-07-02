const fs = require('fs');
let text = fs.readFileSync('src/characters.ts', 'utf8');

// First fix Kỷ Thừa Phong
text = text.replace(
  'name: "Kỷ Thừa Phong",\n    avatar: "🐍",\n    image: "from-slate-800 to-zinc-950",',
  'name: "Kỷ Thừa Phong",\n    avatar: "🐍",\n    avatarBg: "from-slate-800 to-zinc-950",\n    image: "",'
);

// Then for all characters, insert image: "" right before tags:
text = text.replace(/(avatarBg: "[^"]+",)\n(\s+tags:)/g, '$1\n    image: "",\n$2');

fs.writeFileSync('src/characters.ts', text);
console.log('Fixed characters.ts');
