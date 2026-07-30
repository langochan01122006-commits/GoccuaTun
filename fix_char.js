import fs from 'fs';
const content = fs.readFileSync('src/characters.ts', 'utf-8');
const newContent = content.replace(
  '  chatLink?: string;\n  linkUpdatedAt?: string;\n}',
  '  chatLink?: string;\n  linkUpdatedAt?: string;\n  passwordRequired?: boolean;\n  password?: string;\n  passwordQuestion?: string;\n  passwordHint?: string;\n  passwordNote?: string;\n}'
);
fs.writeFileSync('src/characters.ts', newContent, 'utf-8');
