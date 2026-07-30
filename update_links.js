import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const search1 = `    if (link) {
      const newWindow = window.open(link, "_blank", "noopener,noreferrer");
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        // Fallback for strict popup blockers on mobile devices
        window.location.href = link;
      }
    }`;

const replace1 = `    if (link) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = link;
      } else {
        const newWindow = window.open(link, "_blank", "noopener,noreferrer");
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          window.location.href = link;
        }
      }
    }`;

const search2 = `      if (link) {
        // Mở tab mới, có fallback cho mobile
        const newWindow = window.open(link, "_blank", "noopener,noreferrer");
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          // Fallback for strict popup blockers on mobile devices
          window.location.href = link;
        }
      }`;

const replace2 = `      if (link) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = link;
        } else {
          const newWindow = window.open(link, "_blank", "noopener,noreferrer");
          if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            window.location.href = link;
          }
        }
      }`;

let newContent = content.replace(search1, replace1);
newContent = newContent.replace(search2, replace2);
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
