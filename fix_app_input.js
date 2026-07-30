import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf-8');
const search = `onChange={(e) => setPasswordInput(e.target.value)}`;
const replacement = `onChange={(e) => setPasswordInput(e.target.value.toUpperCase().replace(/\\s/g, ""))}`;
const newContent = content.replace(search, replacement);
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
