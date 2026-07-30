import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const replacement = `      if (link) {
        // Mở tab mới
        const a = document.createElement('a');
        a.href = link;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }`;
      
const search = `      if (link) {
        // Mở tab mới ngay lập tức để tránh bị trình duyệt chặn popup do setTimeout
        window.open(link, "_blank", "noopener,noreferrer");
      }`;

const newContent = content.replace(search, replacement);
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
