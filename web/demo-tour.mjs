import {icon} from './icons.mjs';

const steps=[
 {page:'overview',target:'.mobile-balance',symbol:'wallet',title:'Bem-vindo ao Meu Espaço',text:'Em cerca de 1 minuto, veja como organizar seu dinheiro e acompanhar o mês com clareza.',tip:'Esta é uma demonstração interativa. Todos os valores são fictícios.'},
 {page:'overview',target:'.mini-totals',symbol:'chart',title:'Saiba o que tem e o que vai sobrar',text:'O saldo mostra o que já foi realizado. A previsão considera também os valores a receber e a pagar.',tip:'Contas recorrentes e parcelas já entram nos totais do mês.'},
 {page:'analysis',target:'.donut-panel',symbol:'categories',title:'Entenda para onde vai seu dinheiro',text:'Compare receitas e despesas ao longo dos meses e identifique as categorias que mais pesam no orçamento.',tip:'A análise de caixa usa pagamentos realizados. A DRE também considera pendências.'},
 {page:'entries',target:'.movement-summary',symbol:'arrows',title:'Cada movimento no seu lugar',text:'Pesquise, filtre e abra um lançamento para conferir os detalhes, editar ou dar baixa em um pagamento.',tip:'O botão + da barra inferior abre um novo lançamento. Você pode experimentar depois do tour.'},
 {page:'plans',target:'.commitment-hero',symbol:'repeat',title:'Cadastre uma vez. Acompanhe sempre.',text:'Organize aluguel, assinaturas, compras parceladas e consórcios. Acompanhe o que já foi pago e o que ainda falta.',tip:'As próximas parcelas e recorrências geram previsões automaticamente.'},
 {page:'agenda',target:'.due-stats',symbol:'calendar',title:'Veja o que precisa da sua atenção',text:'A agenda reúne contas atrasadas, vencimentos de hoje e dos próximos dias. Abra um item para confirmar o pagamento.',tip:'Os avisos aparecem ao abrir o app. Você também pode exportar vencimentos para o calendário do celular.'},
 {page:'excel',target:'.excel-grid',symbol:'download',title:'Do seu controle para o Excel',text:'Importe uma planilha ou exporte lançamentos, fluxo de caixa e DRE pessoal para acompanhar o fechamento do mês.',tip:'Pronto para explorar? Experimente os dados de exemplo. Recomeçar restaura a demonstração.'}
];

export function initDemoTour({navigate,showHome}){
 const trigger=document.querySelector('#open-demo-tour');
 const dialog=document.createElement('dialog');dialog.id='demo-tour';dialog.setAttribute('aria-labelledby','tour-title');dialog.setAttribute('aria-describedby','tour-description');document.body.append(dialog);
 let index=0,highlight=null;
 function clear(){highlight?.classList.remove('tour-highlight');highlight=null;}
 function finish(){clear();dialog.close();showHome('summary');window.scrollTo({top:0,behavior:'auto'});trigger.focus({preventScroll:true});}
 function paint(){
  clear();const step=steps[index];
  if(step.page==='overview'||step.page==='analysis')showHome(step.page==='analysis'?'analysis':'summary');else navigate(step.page);
  dialog.innerHTML=`<div class="tour-top"><span class="tour-label">CONHEÇA O MEU ESPAÇO</span><button type="button" id="tour-skip" aria-label="Fechar tutorial">${icon('x')}</button></div><div class="tour-progress" aria-label="Etapa ${index+1} de ${steps.length}">${steps.map((_,i)=>`<i class="${i<=index?'done':''}"></i>`).join('')}</div><div class="tour-title-row"><span class="tour-icon">${icon(step.symbol)}</span><h2 id="tour-title" tabindex="-1">${step.title}</h2></div><p id="tour-description">${step.text}</p><p class="tour-tip">${step.tip}</p><div class="tour-actions"><button type="button" id="tour-back" ${index===0?'disabled':''}>Voltar</button><span>${index+1} / ${steps.length}</span><button type="button" class="primary" id="tour-next">${index===steps.length-1?'Explorar demonstração':index===0?'Começar tour':'Próximo'} ${icon('arrow-right')}</button></div>`;
  dialog.querySelector('#tour-skip').onclick=finish;
  dialog.querySelector('#tour-back').onclick=()=>{if(index>0){index--;paint();}};
  dialog.querySelector('#tour-next').onclick=()=>{if(index===steps.length-1)finish();else{index++;paint();}};
  highlight=document.querySelector(step.target);highlight?.classList.add('tour-highlight');
  if(highlight){const top=highlight.getBoundingClientRect().top+window.scrollY;window.scrollTo({top:Math.max(0,top-100),behavior:'auto'});}
  dialog.querySelector('#tour-title').focus({preventScroll:true});
 }
 function start(){index=0;try{sessionStorage.setItem('meuespaco-demo-tour-v1','seen');}catch{}paint();dialog.showModal();dialog.querySelector('#tour-next').focus({preventScroll:true});}
 dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
 dialog.addEventListener('close',clear);trigger.onclick=start;
 let first=true;try{first=!sessionStorage.getItem('meuespaco-demo-tour-v1');}catch{}
 if(first||new URLSearchParams(location.search).get('tour')==='1')start();
}
