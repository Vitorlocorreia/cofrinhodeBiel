import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('.');
const assets={};
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.txt':'text/plain; charset=utf-8'};
async function collect(dir,prefix=''){for(const item of await fs.readdir(dir,{withFileTypes:true})){const route=prefix+'/'+item.name,local=path.join(dir,item.name);if(item.isDirectory())await collect(local,route);else assets[route]={type:mime[path.extname(item.name)]||'application/octet-stream',body:await fs.readFile(local,'utf8')};}}
await collect(path.join(root,'web'));
const manifest=JSON.parse(await fs.readFile('.openai/hosting.json','utf8'));if(manifest.static)throw Error('O manifesto ainda está configurado como estático.');
const proxy=await fs.readFile('worker/proxy.mjs','utf8');
const worker=proxy+'\nconst assets='+JSON.stringify(assets)+';\nexport default {async fetch(request,env){const url=new URL(request.url);if(url.pathname==="/api/cofre")return gateway(request,env);if(!["GET","HEAD"].includes(request.method))return new Response("Método não permitido",{status:405});const route=url.pathname==="/"?"/index.html":url.pathname;const asset=assets[route];if(!asset)return new Response("Não encontrado",{status:404});return new Response(request.method==="HEAD"?null:asset.body,{headers:{"Content-Type":asset.type,"Cache-Control":"no-cache","X-Content-Type-Options":"nosniff"}});}};\n';
await fs.mkdir('dist/server',{recursive:true});await fs.mkdir('dist/.openai',{recursive:true});await fs.writeFile('dist/server/index.js',worker);await fs.writeFile('dist/.openai/hosting.json',JSON.stringify(manifest,null,2));
console.log('Worker e arquivos do Cofre preparados.');
