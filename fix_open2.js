import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const replacement = `    if (link) {
      const a = document.createElement('a');
      a.href = link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }`;

const search = `    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }`;

const newContent = content.replace(search, replacement);
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
