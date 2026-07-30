import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const submitSearch = `  const handlePasswordSubmit = () => {
    if (!passwordModalChar) return;
    
    if (passwordInput === passwordModalChar.password) {
      playClickSound(600, 0.1);
      setIsUnlocked(true);
      setTimeout(() => {
        const link = passwordModalChar.chatLink !== undefined ? passwordModalChar.chatLink : passwordModalChar.chatbotUrl;
        setPasswordModalChar(null);
        setStoryCharacter(null);
        setIsUnlocked(false);
        if (link) {
          window.open(link, "_blank", "noopener,noreferrer");
        }
      }, 800);
    } else {`;

const submitReplacement = `  const handlePasswordSubmit = () => {
    if (!passwordModalChar) return;
    
    // So sánh không phân biệt hoa thường và bỏ khoảng trắng để chắc chắn
    const input = passwordInput.toUpperCase().replace(/\\s/g, "");
    const correctPass = passwordModalChar.password?.toUpperCase().replace(/\\s/g, "");

    if (input === correctPass) {
      playClickSound(600, 0.1);
      setIsUnlocked(true);
      
      const link = passwordModalChar.chatLink !== undefined ? passwordModalChar.chatLink : passwordModalChar.chatbotUrl;
      if (link) {
        // Mở tab mới ngay lập tức để tránh bị trình duyệt chặn popup do setTimeout
        window.open(link, "_blank", "noopener,noreferrer");
      }
      
      setTimeout(() => {
        setPasswordModalChar(null);
        setStoryCharacter(null);
        setIsUnlocked(false);
      }, 800);
    } else {`;

const newContent = content.replace(submitSearch, submitReplacement);
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
