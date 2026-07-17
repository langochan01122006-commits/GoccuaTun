const fs = require('fs');
let content = fs.readFileSync('src/characters.ts', 'utf8');

// Ensure 'no?: string;' is in the Character interface
if (!content.includes('no?: string;')) {
    content = content.replace('export interface Character {', 'export interface Character {\n  no?: string;');
}

let characterCount = 0;

// Replace ids sequentially. We can use a regex replacement with a function, but we need to match only `id: "X"` inside the objects.
// Wait, id: string is also in the interface.
// So we can find "export const CHARACTERS: Character[] = [" and parse or carefully replace.

const lines = content.split('\n');
let inCharactersList = false;
let charIndex = 1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('export const CHARACTERS: Character[] = [')) {
        inCharactersList = true;
    }
    
    if (inCharactersList) {
        if (lines[i].match(/^\s*id:\s*"[^"]+",?/)) {
            lines[i] = lines[i].replace(/id:\s*"[^"]+"/, `id: "${charIndex}"`);
            
            // Add 'no: "..."' right after 'id' if it doesn't exist?
            // Actually, wait, let's just replace id: "X" with id: "X", no: "00X"
            // Wait, we can just do id: "1", and on the next line or same line add no: "001",
            let noValue = String(charIndex).padStart(3, '0');
            
            // Check if next line is already `no:`
            if (lines[i+1] && lines[i+1].match(/^\s*no:\s*"[^"]+",?/)) {
                lines[i+1] = lines[i+1].replace(/no:\s*"[^"]+"/, `no: "${noValue}"`);
            } else if (lines[i].includes('id:')) {
                // insert no:
                const indentation = lines[i].match(/^\s*/)[0];
                lines[i] = lines[i] + `\n${indentation}no: "${noValue}",`;
            }
            charIndex++;
        }
    }
}

fs.writeFileSync('src/characters.ts', lines.join('\n'));
