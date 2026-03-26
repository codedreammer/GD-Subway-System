const fs = require('fs');
const path = require('path');

const srcRoot = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.js') || dirPath.endsWith('.jsx')) {
        callback(dirPath);
      }
    }
  });
}

const replacements = [
  { pattern: /@\/components\/student\//g, replacement: '@/features/student/components/' },
  { pattern: /@\/components\/vendor\//g, replacement: '@/features/vendor/components/' },
  { pattern: /@\/components\/admin\//g, replacement: '@/features/admin/components/' },
  { pattern: /@\/services\/orderService/g, replacement: '@/features/orders/services/orderService' },
  { pattern: /@\/services\/authService/g, replacement: '@/features/auth/services/authService' },
  { pattern: /@\/lib\/supabaseClient/g, replacement: '@/lib/supabase/supabaseClient' },
  { pattern: /@\/lib\/supabaseAdmin/g, replacement: '@/lib/supabase/supabaseAdmin' }
];

walkDir(srcRoot, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const { pattern, replacement } of replacements) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
