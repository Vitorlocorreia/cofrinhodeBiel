import fs from 'node:fs/promises';
await fs.access('web/index.html');
await fs.access('api/cofre.mjs');
await fs.mkdir('vercel-public',{recursive:true});
await fs.cp('web','vercel-public',{recursive:true});
console.log('Interface preparada para Vercel em vercel-public/. A API será publicada como função Node.js.');
