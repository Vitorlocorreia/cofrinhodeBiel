import fs from 'node:fs';
import readline from 'node:readline';
if(process.stdin.isTTY)process.stdin.setRawMode(true);
process.stdout.write('Ready for private configuration (input hidden).\n');
let input='';process.stdin.on('data',chunk=>{input+=chunk.toString();if(input.includes('\n')||input.includes('\r')){try{const value=JSON.parse(input.trim());if(!/^[A-Za-z0-9_-]{40,100}$/.test(value.token))throw Error();fs.writeFileSync('.env.local','COFRE_GATEWAY_TOKEN='+value.token+'\n',{mode:0o600});process.stdout.write('Local gateway configured.\n');process.exit(0);}catch{process.stderr.write('Invalid configuration.\n');process.exit(1);}}});
