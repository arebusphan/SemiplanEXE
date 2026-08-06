const fs = require('fs');

const oldCode = fs.readFileSync('oldAdminPanel.tsx', 'utf8');
const newCode = fs.readFileSync('SemiplanReact/src/pages/AdminPanelPage.tsx', 'utf8');

// I will just use regex to extract the new AdminPanelPage component body and old ones.
// It's probably easier if I just write it directly. Wait, I will let the script construct it? No, I'll just write it using standard prompt.
