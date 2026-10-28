import {createSyncEngine} from './sync-engine.mjs';
export function connectCloud({initial,apply,toast,confirmAction,download}){
  const area=document.querySelector('#cloud-status');
  const messages={loading:'Conectando ao seu histórico…',synced:'Histórico sincronizado',saving:'Salvando no Controlegabriel…',offline:'Sem conexão com o banco. A cópia deste navegador foi preservada.',conflict:'Há uma edição mais recente em outro dispositivo. Sua cópia pendente foi preservada.',migration:`Encontramos ${initial.entries.length} lançamentos e ${initial.plans.length} compromissos neste navegador.`,recovery:'Não foi possível ler a cópia pendente. Preserve um backup antes de continuar.','other-tab':'Outra aba está salvando alterações. Aguarde a sincronização.'};
  async function request(method,body){const response=await fetch('/api/cofre',{method,headers:{'x-cofre-request':'1',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store',signal:AbortSignal.timeout(30000)});if(!response.ok){const error=Error('Não foi possível sincronizar.');error.status=response.status;throw error;}return response.json();}
  const api={read:()=>request('GET'),write:(revision,state)=>request('PUT',{revision,state})};
  let engine;
  function paint(info){area.dataset.mode=info.mode;area.innerHTML=`<div class="cloud-message"><span class="cloud-dot" aria-hidden="true"></span><span>${messages[info.mode]}</span></div><div class="cloud-actions"></div>`;const actions=area.querySelector('.cloud-actions');
    const button=(label,handler)=>{const b=document.createElement('button');b.textContent=label;b.type='button';b.onclick=handler;actions.append(b);};
    if(info.mode==='migration'){
      button('Enviar para o banco',()=>confirmAction('Enviar o histórico deste navegador?',`${initial.entries.length} lançamentos e ${initial.plans.length} compromissos serão salvos no Controlegabriel. A cópia local original será preservada.`,()=>engine.uploadLocal()));
      button('Usar histórico da nuvem',()=>confirmAction('Usar o histórico da nuvem?','O histórico local original continuará guardado neste navegador. A tela passará a usar o banco Controlegabriel.',()=>{engine.useCloud().catch(()=>toast('Não foi possível carregar o banco. Tente novamente.'));}));
    }else if(['conflict','recovery'].includes(info.mode)){
      button('Baixar cópia pendente',()=>download(JSON.stringify(engine.backupState(),null,2),'Cofre-copia-pendente.json','application/json'));
      if(info.mode==='conflict')button('Carregar nuvem',()=>confirmAction('Carregar a versão mais recente?','A cópia pendente será baixada como backup antes de carregar os registros da nuvem. Nenhum dado do banco será sobrescrito.',()=>{download(JSON.stringify(engine.backupState(),null,2),'Cofre-copia-pendente.json','application/json');engine.useCloud().catch(()=>toast('Não foi possível carregar o banco. Tente novamente.'));}));
    }else if(!['saving','loading'].includes(info.mode))button(info.mode==='synced'?'Atualizar':'Tentar conexão',()=>engine.refresh());
  }
  paint({mode:'loading'});
  engine=createSyncEngine({api,storage:localStorage,initial,apply,notify:paint,canApply:()=>!document.querySelector('dialog[open]')});
  engine.refresh();
  window.addEventListener('focus',()=>engine.refresh());window.addEventListener('online',()=>engine.refresh());
  window.setInterval(()=>{if(!document.hidden)engine.refresh();},30000);
  return engine;
}
