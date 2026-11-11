import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as core from '../web/core.mjs';
import * as schedules from '../web/schedules.mjs';
import {icon,categoryIcon} from '../web/icons.mjs';
import {createDemo} from '../web/demo.mjs';

test('demo tem histórico, parcelas e agenda válidos sem IDs duplicados',()=>{
 for(const date of ['2026-11-10','2027-02-28','2028-02-29','2027-01-01','2026-12-31']){
  const s=createDemo(date);s.entries.forEach(core.validate);s.plans.forEach(schedules.validatePlan);
  assert.equal(new Set(s.entries.map(e=>e.id)).size,s.entries.length);
  assert.ok(s.entries.filter(e=>e.date<date.slice(0,7)).length>30);
  assert.ok(schedules.dueItems(s.entries,date).some(e=>e.daysLeft===0));
  assert.equal(schedules.extendSchedules(s.entries,s.plans,date).changed,false);
  const m=core.monthOverview(s.entries,date.slice(0,7));assert.ok(m.commitments>0);assert.ok(m.payable>0);
 }
});
test('modo demo não lê nem grava histórico real e não conecta ao banco',()=>{
 const nodes=new Map();const node=()=>({value:'',hidden:false,innerHTML:'',textContent:'',elements:new Proxy({},{get:(t,k)=>t[k]??(t[k]=node())}),classList:{toggle(){}},showModal(){},close(){}});
 const document={querySelector:s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s);},querySelectorAll:()=>[]};
 const blocked=()=>{throw Error('Acesso indevido ao histórico real');};
 const sandbox={...core,...schedules,icon,categoryIcon,createDemo,initDemoTour(){},document,location:{search:'?demo=1',reload(){}},URLSearchParams,localStorage:{getItem:blocked,setItem:blocked},connectCloud:blocked,window:{addEventListener(){}},setInterval(){},setTimeout(){},clearTimeout(){},createScheduleUI:()=>({updateBell(){},bind(){}})};
 vm.createContext(sandbox);const code=fs.readFileSync(new URL('../web/app.mjs',import.meta.url),'utf8').replace(/^import .*?;\r?\n/gm,'');
 vm.runInContext(code,sandbox);assert.equal(vm.runInContext('isDemo',sandbox),true);assert.equal(vm.runInContext('storageFailed',sandbox),false);
 assert.equal(vm.runInContext('persist(entries)',sandbox),true);assert.equal(vm.runInContext('cloud',sandbox),null);
 assert.match(nodes.get('#cloud-status').innerHTML,/Dados fictícios/);
});
