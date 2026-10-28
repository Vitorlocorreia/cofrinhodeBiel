import test from 'node:test';
import assert from 'node:assert/strict';
import {gateway} from '../worker/proxy.mjs';
import {validateState} from '../web/state.mjs';
test('API exige o identificador de chamada do aplicativo',async()=>{const response=await gateway(new Request('https://cofre.example/api/cofre'),{COFRE_GATEWAY_TOKEN:'test-only'});assert.equal(response.status,403);});
test('API rejeita pedidos de outra origem',async()=>{const response=await gateway(new Request('https://cofre.example/api/cofre',{headers:{'x-cofre-request':'1',Origin:'https://another.example'}}),{COFRE_GATEWAY_TOKEN:'test-only'});assert.equal(response.status,403);});
test('segredo ausente falha sem expor o banco',async()=>{const response=await gateway(new Request('https://cofre.example/api/cofre',{headers:{'x-cofre-request':'1'}}),{});assert.equal(response.status,503);});
test('validação do servidor rejeita IDs repetidos e versões incompatíveis',()=>{const entry={id:'x',description:'Teste',type:'receita',category:'Salário',amount:100,date:'2026-10-01',competence:'2026-10',status:'pago',account:'Carteira'};assert.throws(()=>validateState({version:2,entries:[entry,entry],plans:[]}));assert.throws(()=>validateState({version:1,entries:[],plans:[]}));assert.throws(()=>validateState({version:2,entries:[{...entry,date:'2026-02-30'}],plans:[]}));});
