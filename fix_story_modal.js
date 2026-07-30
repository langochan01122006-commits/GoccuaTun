import fs from 'fs';
const content = fs.readFileSync('src/components/StoryModal.tsx', 'utf-8');
const search = `          {!character.chatbotUrl ? (`;
const replacement = `          {!(character.chatbotUrl || character.chatLink) ? (`;
const newContent = content.replace(search, replacement);
fs.writeFileSync('src/components/StoryModal.tsx', newContent, 'utf-8');
