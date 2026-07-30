import fs from 'fs';
const content = fs.readFileSync('src/characters.ts', 'utf-8');
const search = `    passwordNote: "Pass viết bằng chữ in hoa, không dấu, không cách.\\n\\n⚠️ Nếu giải được pass vui lòng không công khai pass . Nếu Tun phát hiện sẽ đổi lại pass ⚠️",`;
const replacement = `    passwordNote: "⚠️ Pass viết bằng chữ in hoa, không dấu, không cách.\\n⚠️ Nếu giải được pass vui lòng không công khai pass. Nếu Tun phát hiện sẽ đổi lại pass !!!",`;
const newContent = content.replace(search, replacement);
fs.writeFileSync('src/characters.ts', newContent, 'utf-8');
