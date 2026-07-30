import fs from 'fs';
const content = fs.readFileSync('src/characters.ts', 'utf-8');
const newContent = content.replace(
  '    chatLink: "https://aistudio.google.com/prompts/1V6FzCcqusIxB88zeGVzO0nsPGCxNQfkd",\n    linkUpdatedAt: "2026-07-29T21:37:06",\n    storyline: `THÀNH PHỐ - 20:00',
  '    chatLink: "https://aistudio.google.com/prompts/1V6FzCcqusIxB88zeGVzO0nsPGCxNQfkd",\n    linkUpdatedAt: "2026-07-29T21:37:06",\n    passwordRequired: true,\n    password: "USERDUOI18TUOI",\n    passwordQuestion: "Trong bài post của Silas Moreau câu nào được nhắc lại nhiều nhất ?",\n    passwordHint: "Có trong tất cả bài post",\n    passwordNote: "Pass viết bằng chữ in hoa, không dấu, không cách.\\n\\n⚠️ Nếu giải được pass vui lòng không công khai pass . Nếu Tun phát hiện sẽ đổi lại pass ⚠️",\n    storyline: `THÀNH PHỐ - 20:00'
);
fs.writeFileSync('src/characters.ts', newContent, 'utf-8');
