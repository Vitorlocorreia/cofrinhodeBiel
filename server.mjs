import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {gateway} from './worker/proxy.mjs';
try{process.loadEnvFile('.env.local');}catch(error){if(error.code!=='ENOENT')throw error;}
const root=path.resolve('web');
const port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://'+req.headers.host);
    if(!['localhost','127.0.0.1'].includes(url.hostname)){res.writeHead(403).end();return;}
    if(url.pathname==='/api/cofre'){
      let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>8500000){res.writeHead(413).end();return;}chunks.push(chunk);}
      const response=await gateway(new Request(url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})}),process.env);
      res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
    }
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
    let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}if(file===root||file.endsWith(path.sep))file=path.join(file,'index.html');
    const data=fs.readFileSync(file);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript'})[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');res.end(req.method==='HEAD'?undefined:data);
  }catch(error){res.writeHead(error.code==='ENOENT'?404:500).end('Não foi possível abrir este recurso.');}
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://localhost:${port}`));
