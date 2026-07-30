import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const correctEnd = `      </AnimatePresence>
    </div>
  );
}
export default App;`;

const index = content.indexOf('{/* Password Modal */}');
const modalCode = content.substring(index);
const correctModalCode = modalCode.split('</AnimatePresence>')[0] + correctEnd;

const newContent = content.substring(0, index) + correctModalCode;

fs.writeFileSync('src/App.tsx', newContent, 'utf-8');
