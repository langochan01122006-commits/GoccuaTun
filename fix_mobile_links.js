import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const search1 = `    if (link) {
      const a = document.createElement('a');
      a.href = link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }`;

const replace1 = `    if (link) {
      const newWindow = window.open(link, "_blank", "noopener,noreferrer");
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        // Fallback for strict popup blockers on mobile devices
        window.location.href = link;
      }
    }`;

let newContent = content.replace(search1, replace1);

const search2 = `      if (link) {
        // Mở tab mới
        const a = document.createElement('a');
        a.href = link;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }`;

const replace2 = `      if (link) {
        // Mở tab mới, có fallback cho mobile
        const newWindow = window.open(link, "_blank", "noopener,noreferrer");
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          // Fallback for strict popup blockers on mobile devices
          window.location.href = link;
        }
      }`;

newContent = newContent.replace(search2, replace2);
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
