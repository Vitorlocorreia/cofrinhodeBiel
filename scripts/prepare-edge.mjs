import fs from 'node:fs/promises';
for(const name of ['state.mjs','core.mjs','schedules.mjs'])await fs.copyFile('web/'+name,'supabase/functions/cofre-gateway/'+name);
console.log('Fontes compartilhadas da conexão Supabase preparadas.');
