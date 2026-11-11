import {validate,validDate} from './core.mjs';
import {validatePlan,extendSchedules} from './schedules.mjs';

// Every record here is synthetic. Dates follow the presentation month.
export function createDemo(asOf){
  if(!validDate(asOf))throw Error('Data inválida para demonstração');
  const day=Number(asOf.slice(8));
  const at=(offset,d)=>{const base=new Date(asOf+'T12:00:00Z');base.setUTCDate(1);base.setUTCMonth(base.getUTCMonth()+offset);const m=base.toISOString().slice(0,7);const last=new Date(Date.UTC(base.getUTCFullYear(),base.getUTCMonth()+1,0)).getUTCDate();return m+'-'+String(Math.min(d,last)).padStart(2,'0');};
  const entries=[];let seq=0;
  const add=(description,type,category,amount,date,status='pago',extra={})=>entries.push(validate({id:'demo-entry-'+(++seq),description,type,category,amount,date,competence:date.slice(0,7),status,account:'Conta principal',...extra}));
  for(let back=5;back>=1;back--){
    add('Salário · empresa exemplo','receita','Salário',580000+(5-back)*12000,at(-back,5));
    add('Projeto de design','receita','Freelance',90000+(5-back)*10000,at(-back,18));
    for(const [name,cat,value] of [['Aluguel','Moradia',180000],['Mercado do mês','Alimentação',96000+back*2000],['Mobilidade','Transporte',34000],['Plano de saúde','Saúde',38000],['Passeios e restaurantes','Lazer',32000],['Cursos e livros','Educação',19000],['Serviços e assinaturas','Assinaturas',24000]])if(!(name==='Aluguel'&&back<=2))add(name,'despesa',cat,value,at(-back,12));
  }
  add('Salário · empresa exemplo','receita','Salário',650000,at(0,Math.min(day,5)));
  add('Projeto de identidade visual','receita','Freelance',120000,at(0,Math.min(day,8)));
  add('Projeto de consultoria','receita','Freelance',85000,at(0,Math.max(day,25)),'pendente');
  for(const [name,cat,value,d] of [['Mercado da semana','Alimentação',38640,2],['Restaurante com amigos','Lazer',14890,4],['Transporte por aplicativo','Transporte',3250,6],['Combustível','Transporte',18000,7],['Farmácia','Saúde',7890,3],['Livros e cursos','Educação',12990,8],['Feira e padaria','Alimentação',12450,9]])add(name,'despesa',cat,value,at(0,Math.min(day,d)));
  const plans=[
    {id:'demo-rent',description:'Aluguel do apartamento',kind:'recorrente',category:'Moradia',amount:180000,firstDate:at(-2,5)},
    {id:'demo-internet',description:'Internet de casa',kind:'recorrente',category:'Assinaturas',amount:11990,firstDate:at(0,Math.min(day+2,28))},
    {id:'demo-gym',description:'Academia',kind:'recorrente',category:'Saúde',amount:12990,firstDate:at(0,Math.min(day+5,28))},
    {id:'demo-notebook',description:'Notebook para trabalhar',kind:'parcelado',category:'Parcelas e financiamentos',amount:39900,firstDate:at(-3,15),total:12},
    {id:'demo-consortium',description:'Consórcio do carro',kind:'consorcio',category:'Consórcios',amount:52000,firstDate:at(-2,20),total:36}
  ].map(p=>validatePlan({...p,startNumber:1,generated:0,active:true,reminderDays:3,account:'Conta principal'}));
  const expanded=extendSchedules(entries,plans,asOf);
  for(const e of expanded.entries)if(e.planId&&e.date<=asOf)e.status='pago';
  // Include a bill due today so the sales presentation can show the agenda action.
  add('Energia elétrica','despesa','Moradia',18670,asOf,'pendente',{dueDate:asOf});
  expanded.entries.push(entries[entries.length-1]);
  return {version:2,entries:expanded.entries,plans:expanded.plans};
}
