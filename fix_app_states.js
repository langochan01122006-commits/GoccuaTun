import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf-8');
const newContent = content.replace(
  '  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);',
  '  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);\n  const [passwordModalChar, setPasswordModalChar] = useState<Character | null>(null);\n  const [passwordInput, setPasswordInput] = useState("");\n  const [passwordError, setPasswordError] = useState("");'
);
fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
