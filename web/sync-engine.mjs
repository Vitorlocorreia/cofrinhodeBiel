import {validateState} from './state.mjs';
export const OUTBOX='cofre-cloud-outbox-v1',CACHE='cofre-cloud-cache-v1';
const canonical=value=>JSON.stringify(value,(_,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);
const same=(a,b)=>canonical(a)===canonical(b);
export function createSyncEngine({api,storage,apply,notify,initial,canApply=()=>true}){
  let revision=0,pending=null,remote=null,mode='loading',ready=false,busy=false,initialSync=true;
  function status(next){mode=next;notify({mode,revision,pending:!!pending});}
  function decode(value){if(!value||!Number.isSafeInteger(value.revision)||value.revision<0)throw Error('Versão inválida.');return {...value,state:validateState(value.state)};}
  function cache(value){storage.setItem(CACHE,JSON.stringify(value));}
  function savePending(){if(pending)storage.setItem(OUTBOX,JSON.stringify(pending));else storage.removeItem(OUTBOX);}
  try{const raw=storage.getItem(CACHE);if(raw){const cached=decode(JSON.parse(raw));revision=cached.revision;apply(cached.state);ready=true;}}
  catch{ready=false;}
  try{const raw=storage.getItem(OUTBOX);if(raw){const value=JSON.parse(raw);if(!Number.isSafeInteger(value.baseRevision)||value.baseRevision<0)throw Error();pending={baseRevision:value.baseRevision,state:validateState(value.state)};revision=pending.baseRevision;apply(pending.state);ready=true;}}
  catch{status('recovery');return {canEdit:()=>false,enqueue(){throw Error('Cópia pendente inválida. Exporte um backup antes de continuar.');},refresh:async()=>{},useCloud:async()=>{},uploadLocal(){},backupState:()=>initial,hasPending:()=>true};}
  async function flush(){
    if(busy||!pending||['conflict','migration','recovery'].includes(mode))return;
    busy=true;const sent=pending;status('saving');
    try{
      const saved=decode(await api.write(sent.baseRevision,sent.state));revision=saved.revision;remote=saved;cache(saved);
      if(pending&&same(pending.state,sent.state))pending=null;
      else if(pending)pending={...pending,baseRevision:revision};
      savePending();status(pending?'saving':'synced');
    }catch(error){status(error.status===409?'conflict':'offline');}
    finally{busy=false;}
    if(pending&&mode==='saving')return flush();
  }
  function canEdit(){return ready&&!['loading','migration','conflict','recovery'].includes(mode);}
  function enqueue(state){
    if(!canEdit())throw Error('Aguarde a conexão ou resolva a atualização pendente antes de editar.');
    const existing=storage.getItem(OUTBOX);
    if(existing&&(!pending||!same(JSON.parse(existing),pending)))throw Error('Há alterações pendentes em outra aba. Aguarde a sincronização antes de editar aqui.');
    const next={baseRevision:pending?.baseRevision??revision,state:validateState(state)};
    storage.setItem(OUTBOX,JSON.stringify(next));pending=next;status('saving');queueMicrotask(flush);
  }
  async function refresh(){
    if(busy||mode==='migration'||mode==='recovery'||!canApply())return;
    busy=true;
    try{
      const fetched=decode(await api.read());if(!canApply())return;remote=fetched;
      if(pending){
        if(same(pending.state,fetched.state)){revision=fetched.revision;pending=null;savePending();cache(fetched);ready=true;status('synced');}
        else if(fetched.revision!==pending.baseRevision){status('conflict');}
        else {revision=fetched.revision;ready=true;status('saving');}
      }else{
        const old=storage.getItem(OUTBOX);
        if(old){status('other-tab');return;}
        if(initialSync&&!ready&&fetched.state.entries.length===0&&fetched.state.plans.length===0&&(initial.entries.length||initial.plans.length)){
          revision=fetched.revision;ready=true;status('migration');
        }else{
          const changed=!ready||initialSync||fetched.revision!==revision;cache(fetched);revision=fetched.revision;if(changed)apply(fetched.state);ready=true;status('synced');
        }
      }
      initialSync=false;
    }catch{status('offline');}
    finally{busy=false;}
    if(pending&&mode==='saving')return flush();
  }
  async function useCloud(){
    const fetched=decode(await api.read());cache(fetched);storage.removeItem(OUTBOX);pending=null;revision=fetched.revision;remote=fetched;apply(fetched.state);ready=true;initialSync=false;status('synced');
  }
  function uploadLocal(){if(mode!=='migration')return;status('synced');enqueue(initial);}
  return {canEdit,enqueue,refresh,useCloud,uploadLocal,backupState:()=>pending?.state||initial,hasPending:()=>!!pending};
}
