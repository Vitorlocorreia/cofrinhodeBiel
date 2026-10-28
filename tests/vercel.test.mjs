import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createVercelHandler} from '../api/cofre.mjs';
test('Vercel aceita o modo aberto sem a antiga variável de proteção',async()=>{const handler=createVercelHandler({});const response=await handler.fetch(new Request('https://cofre.example/api/cofre',{headers:{'x-cofre-request':'1'}}));assert.equal(response.status,503);assert.match((await response.json()).error,/banco ainda não configurada/);});
test('Vercel mantém a verificação de origem na conexão com o banco',async()=>{const handler=createVercelHandler({COFRE_PRIVATE_DEPLOYMENT:'vercel-auth-all-deployments',COFRE_GATEWAY_TOKEN:'not-a-real-secret'});const response=await handler.fetch(new Request('https://cofre.example/api/cofre',{headers:{'x-cofre-request':'1',Origin:'https://another.example'}}));assert.equal(response.status,403);});
test('configuração Vercel aponta para a interface e para a função do banco',async()=>{const config=JSON.parse(await fs.readFile(new URL('../vercel.json',import.meta.url),'utf8'));assert.equal(config.buildCommand,'npm run build:vercel');assert.equal(config.outputDirectory,'vercel-public');assert.equal(config.framework,null);assert.ok(config.functions['api/cofre.mjs']);});
