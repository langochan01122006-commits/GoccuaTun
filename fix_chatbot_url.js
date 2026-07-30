import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf-8');

// The main character list grid has !char.chatbotUrl check
const search = `                                              {!char.chatbotUrl ? (`;
const replacement = `                                              {!(char.chatbotUrl || char.chatLink) ? (`;
const newContent1 = content.replace(search, replacement);

// The featured hubby might have the same issue?
const search2 = `                        {!featuredHubby.chatbotUrl ? (`;
const replacement2 = `                        {!(featuredHubby.chatbotUrl || featuredHubby.chatLink) ? (`;
const newContent2 = newContent1.replace(search2, replacement2);

fs.writeFileSync('src/App.tsx', newContent2, 'utf-8');
