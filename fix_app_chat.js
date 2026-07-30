import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf-8');
const search = `  // Triggers immediate chat in a new tab using the chatbotUrl
  const handleStartChat = (character: Character, initialPrompt?: string) => {
    playClickSound(550, 0.1);
    setStoryCharacter(null); // Close story popup if open
    
    if (character.chatbotUrl) {
      window.open(character.chatbotUrl, "_blank", "noopener,noreferrer");
    }
  };`;

const replacement = `  // Triggers immediate chat in a new tab using the chatbotUrl or chatLink
  const handleStartChat = (character: Character, initialPrompt?: string) => {
    playClickSound(550, 0.1);
    
    if (character.passwordRequired) {
      setPasswordModalChar(character);
      setPasswordInput("");
      setPasswordError("");
      return;
    }
    
    setStoryCharacter(null); // Close story popup if open
    
    const link = character.chatLink !== undefined ? character.chatLink : character.chatbotUrl;
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  const handlePasswordSubmit = () => {
    if (!passwordModalChar) return;
    
    if (passwordInput === passwordModalChar.password) {
      playClickSound(600, 0.1);
      const link = passwordModalChar.chatLink !== undefined ? passwordModalChar.chatLink : passwordModalChar.chatbotUrl;
      setPasswordModalChar(null);
      setStoryCharacter(null);
      if (link) {
        window.open(link, "_blank", "noopener,noreferrer");
      }
    } else {
      playClickSound(300, 0.1);
      setPasswordError("Mật khẩu không đúng. Vui lòng thử lại!");
    }
  };`;

const newContent = content.replace(search, replacement);
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
