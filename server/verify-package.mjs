import fs from 'node:fs';
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url)));
const required=['dev','build','cms:setup','test:api'];
const missing=required.filter(key=>!pkg.scripts?.[key]);
if(missing.length){console.error('Missing scripts:',missing.join(', '));process.exit(1)}
for(const path of ['src/App.tsx','server/index.ts','server/cms.ts','server/setup-admin.mjs','src/pages/AdminPage.tsx']){if(!fs.existsSync(path)){console.error('Missing file:',path);process.exit(1)}}
console.log(`OK: ${pkg.name}@${pkg.version} | cms:setup available | main CMS files present`);
