const fs = require('fs');
const path = require('path');

const ADMIN_PATH = 'ms-control-9x7k2p';

const filesToUpdate = [
  'lib/actions/pages.ts',
  'lib/actions/levels.ts',
  'lib/actions/games.ts',
  'lib/actions/blogs.ts',
  'lib/actions/settings.ts',
  'components/PageForm.tsx',
  'components/BlogForm.tsx',
  'components/GameForm.tsx',
  'components/LoginForm.tsx',
  'app/ms-control-9x7k2p/(dashboard)/pages/[id]/page.tsx',
  'app/ms-control-9x7k2p/(dashboard)/pages/page.tsx',
  'app/ms-control-9x7k2p/(dashboard)/games/[id]/levels/page.tsx',
  'app/ms-control-9x7k2p/(dashboard)/games/[id]/edit/page.tsx',
  'app/ms-control-9x7k2p/(dashboard)/games/page.tsx',
  'app/ms-control-9x7k2p/(dashboard)/dashboard/page.tsx',
  'app/ms-control-9x7k2p/(dashboard)/blogs/page.tsx',
  'app/ms-control-9x7k2p/(dashboard)/blogs/[id]/edit/page.tsx',
  'app/ms-control-9x7k2p/(dashboard)/games/[id]/levels/[levelId]/edit/page.tsx',
  'app/ms-control-9x7k2p/(dashboard)/games/[id]/levels/new/page.tsx',
  'app/ms-control-9x7k2p/(dashboard)/layout.tsx',
];

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} - not found`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Replace /admin with /ms-control-9x7k2p
  content = content.replace(/\/admin\//g, `/${ADMIN_PATH}/`);
  content = content.replace(/'\/admin'/g, `'/${ADMIN_PATH}'`);
  content = content.replace(/"\/admin"/g, `"/${ADMIN_PATH}"`);

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`No changes needed for ${filePath}`);
  }
});

console.log('Done updating admin paths');
