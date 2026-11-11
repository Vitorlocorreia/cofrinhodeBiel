import {icon} from './icons.mjs';

// One explanation per visible control; keep the control outside the tooltip.
const screens=[
 {id:'overview',label:'Início',steps:[
  ['.current-balance','Saldo realizado','É o dinheiro acumulado das receitas recebidas menos as despesas já pagas. Pendências não entram aqui.'],
  ['.forecast-line','Previsão do mês','Mostra como o saldo pode terminar: saldo realizado + valores a receber − valores a pagar.'],
  ['.mini-totals>div:first-child','Receitas do mês','Soma as receitas recebidas e pendentes. A linha menor mostra quanto ainda falta receber.'],
  ['.mini-totals>div:last-child','Despesas do mês','Inclui despesas pagas, pendentes, recorrências e parcelas. Abaixo, veja quanto ainda falta pagar.'],
  ['.home-actions','Seus atalhos','Registre um movimento, cadastre uma conta recorrente ou abra o fluxo de caixa para planejar o mês.'],
  ['.compact-due .panel-head','Próximos pagamentos','A lista abaixo mostra as próximas despesas pendentes do mês. “Ver agenda” abre todos os vencimentos.']
 ]},
 {id:'analysis',label:'Análise',steps:[
  ['.spending-donut','Onde você está gastando','Cada fatia representa uma categoria das despesas pagas. O centro mostra o total realizado no mês.'],
  ['.chart','Evolução do caixa','Compare receitas e despesas realizadas nos últimos seis meses. Toque em Resumo para voltar ao painel.']
 ]},
 {id:'entries',label:'Movimentos',steps:[
  ['.movement-summary','Resumo dos movimentos','Os totais consideram pagos e pendentes do mês inteiro. Os filtros abaixo mudam só a lista.'],
  ['#search','Encontre um lançamento','Digite o que procura. Os filtros de tipo e situação ajudam a separar receitas, despesas e pendências.'],
  ['.movement summary','Abra os detalhes','Toque na linha para ver conta e competência, editar ou dar baixa. O ícone identifica a categoria.'],
  [['#dock-add','#new-entry'],'Registre em poucos passos','O botão + abre o formulário. Informe valor, descrição, categoria e marque como pago ou pendente.']
 ]},
 {id:'plans',label:'Contas',steps:[
  ['.commitment-hero','Compromissos do mês','Veja o total das contas e parcelas deste mês. O círculo indica a porcentagem do valor já pago.'],
  ['.section-actions [data-new-plan]','Cadastre uma conta','Escolha conta mensal, compra parcelada ou consórcio. Informe valor, vencimento e quantidade de parcelas.'],
  ['.agenda-tabs','Separe por tipo','Use estes filtros para encontrar contas mensais, compras parceladas ou consórcios.'],
  ['.commitment .commitment-actions','Acompanhe cada parcela','“Ver parcelas” abre os vencimentos e pagamentos. “Encerrar” interrompe as previsões futuras desse compromisso.']
 ]},
 {id:'agenda',label:'Agenda',steps:[
  ['.due-stats','O que merece atenção','Confira quantas contas estão atrasadas, vencem hoje ou nos próximos sete dias, com os respectivos valores.'],
  ['.due-payment','Confirme um pagamento','Confira o valor e toque em Confirmar pagamento. O formulário permite revisar a data antes de salvar.'],
  ['#calendar-export','Leve os lembretes com você','Exporte vencimentos para o calendário do celular. Os avisos do app são atualizados quando você o abre.']
 ]},
 {id:'excel',label:'Excel',steps:[
  ['#template','Comece com sua planilha','Baixe o modelo, preencha e selecione o arquivo abaixo. Você revisa os dados antes de confirmar a importação.'],
  ['.excel-grid [data-export]','Feche o mês','Exporte a DRE pessoal, o fluxo de caixa e os lançamentos. Na demonstração, os dados exportados são fictícios.'],
  ['#backup','Guarde uma cópia','O backup reúne todo o histórico. Agora você pode explorar à vontade e repetir o tutorial pelo botão no topo.']
 ]}
];

export function initDemoTour({navigate,showHome,getPage=()=> 'overview'}){
 const trigger=document.querySelector('#open-demo-tour');
 const dialog=document.createElement('dialog');dialog.id='demo-tour';dialog.setAttribute('aria-labelledby','tour-title');dialog.setAttribute('aria-describedby','tour-description');document.body.append(dialog);
 let group=0,index=0,highlight=null,frame=0;
 function clear(){highlight?.classList.remove('tour-highlight');highlight=null;}
 function finish(){clear();dialog.close();trigger.focus({preventScroll:true});}
 function position(scroll=false){
  if(!dialog.open||!highlight)return;
  const gap=16,margin=12,v=window.visualViewport,height=v?.height||window.innerHeight,width=v?.width||window.innerWidth,offset=v?.offsetTop||0;
  dialog.style.width=Math.min(340,width-margin*2)+'px';
  let box=highlight.getBoundingClientRect(),tipHeight=dialog.offsetHeight;
  // Make room by moving the page, never by covering the highlighted control.
  if(scroll&&(box.top<offset+12||box.bottom>offset+height-margin||(box.bottom+tipHeight+gap>offset+height-margin&&box.top-tipHeight-gap<offset+margin))){
   const desired=offset+60;window.scrollBy({top:box.top-desired,behavior:'instant'});box=highlight.getBoundingClientRect();
  }
  const below=box.bottom+gap,above=box.top-tipHeight-gap;
  let top=below+tipHeight<=offset+height-margin?below:above>=offset+margin?above:below;
  dialog.dataset.side=top===below?'below':'above';
  top=Math.max(offset+margin,Math.min(top,offset+height-tipHeight-margin));
  dialog.style.top=top+'px';dialog.style.left=Math.max(margin,Math.min(box.left+box.width/2-dialog.offsetWidth/2,width-dialog.offsetWidth-margin))+'px';
  dialog.style.setProperty('--tour-pointer',Math.max(20,Math.min(dialog.offsetWidth-20,box.left+box.width/2-parseFloat(dialog.style.left)))+'px');
 }
 function schedulePosition(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>position());}
 function paint(changePage=false){
  clear();const section=screens[group],step=section.steps[index];
  if(changePage){if(section.id==='overview'||section.id==='analysis')showHome(section.id==='analysis'?'analysis':'summary');else navigate(section.id);}
  const final=group===screens.length-1&&index===section.steps.length-1,last=index===section.steps.length-1;
  dialog.innerHTML=`<div class="pill-header"><span class="pill-section">${section.label} · ${index+1}/${section.steps.length}</span><button type="button" id="tour-skip" aria-label="Fechar tutorial">${icon('x')}</button></div><h2 id="tour-title" tabindex="-1">${step[1]}</h2><p id="tour-description">${step[2]}</p><div class="pill-footer"><button type="button" id="tour-back" aria-label="Etapa anterior" ${group===0&&index===0?'disabled':''}>${icon('chevron-left')}</button><div class="pill-dots" aria-label="Etapa ${index+1} de ${section.steps.length}">${section.steps.map((_,i)=>`<i class="${i===index?'current':''}"></i>`).join('')}</div><button type="button" id="tour-next">${final?'Concluir':last?'Próxima tela':'Próximo'} ${icon('chevron-right')}</button></div>`;
  dialog.querySelector('#tour-skip').onclick=finish;
  dialog.querySelector('#tour-back').onclick=()=>{if(index>0){index--;paint();}else if(group>0){group--;index=screens[group].steps.length-1;paint(true);}};
  dialog.querySelector('#tour-next').onclick=()=>{if(final)finish();else if(last){group++;index=0;paint(true);}else{index++;paint();}};
  const targets=Array.isArray(step[0])?step[0]:[step[0]];
  highlight=targets.map(s=>document.querySelector(s)).find(n=>n&&n.getBoundingClientRect().width>0)||document.querySelector('#title');
  highlight.classList.add('tour-highlight');
  if(!dialog.open)dialog.showModal();
  position(true);dialog.querySelector('#tour-next').focus({preventScroll:true});
 }
 function start(fromBeginning=false){group=fromBeginning?0:Math.max(0,screens.findIndex(s=>s.id===getPage()));index=0;try{sessionStorage.setItem('meuespaco-demo-tour-v2','seen');}catch{}paint(true);requestAnimationFrame(()=>requestAnimationFrame(()=>position(true)));}
 dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});dialog.addEventListener('close',()=>{clear();cancelAnimationFrame(frame);});
 window.addEventListener('resize',()=>position(true));window.addEventListener('scroll',schedulePosition,{passive:true});window.visualViewport?.addEventListener('resize',()=>position(true));
 trigger.onclick=()=>start();
 let first=true;try{first=!sessionStorage.getItem('meuespaco-demo-tour-v2');}catch{}
 if(first||new URLSearchParams(location.search).get('tour')==='1')start(true);
}
