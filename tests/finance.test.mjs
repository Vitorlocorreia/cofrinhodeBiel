import test from 'node:test';
import assert from 'node:assert/strict';
import {cents,validate,summary,opening,mergeImport,monthOverview} from '../web/core.mjs';
import {extendSchedules} from '../web/schedules.mjs';
const entry=(extra={})=>({id:'1',description:'Salário',date:'2026-10-05',competence:'2026-10',type:'receita',category:'Salário',amount:100000,status:'pago',account:'Conta principal',...extra});

test('painel inclui recorrências e parcelas do mês uma vez e mantém previsão ao dar baixa',()=>{
  const plan={id:'rent',kind:'recorrente',description:'Aluguel',firstDate:'2026-10-05',category:'Moradia',account:'Conta principal',amount:30000,startNumber:1,total:null,reminderDays:3,active:true,generated:0};
  const generated=extendSchedules([entry()],[plan,{...plan,id:'phone',kind:'parcelado',total:3,amount:10000}],'2026-10-01');
  const rows=[...generated.entries,entry({id:'food',type:'despesa',category:'Alimentação',amount:5000})];
  const before=monthOverview(rows,'2026-10');
  assert.equal(before.planned.expense,45000);
  assert.equal(before.commitments,40000);
  assert.equal(before.payable,40000);
  assert.equal(before.balance,95000);
  assert.equal(before.projected,55000);
  const paid=rows.map(e=>e.id==='rent:1'?{...e,status:'pago'}:e);
  const after=monthOverview(paid,'2026-10');
  assert.equal(after.projected,before.projected);
  assert.equal(after.payable,10000);
  assert.equal(after.balance,65000);
  assert.equal(after.commitments,40000);
});

test('previsão inclui receitas pendentes e exclui transferências do resultado',()=>{
  const result=monthOverview([entry({status:'pendente'}),entry({id:'transfer',type:'transferencia',category:'Transferência entre contas',destination:'Reserva',amount:50000,status:'pendente'})],'2026-10');
  assert.equal(result.receivable,100000);
  assert.equal(result.planned.expense,0);
  assert.equal(result.balance,0);
  assert.equal(result.projected,100000);
});
test('valores brasileiros e centavos são exatos',()=>{assert.equal(cents('1.234,56'),123456);assert.equal(cents(0.1),10);assert.throws(()=>cents('1,234'));assert.throws(()=>cents(-1));assert.throws(()=>cents('abc'));});
test('caixa usa pagamento, DRE usa competência e inclui pendências',()=>{const rows=[entry(),entry({id:'2',type:'despesa',category:'Moradia',amount:30000,date:'2026-11-01'}),entry({id:'3',status:'pendente',amount:20000})];assert.equal(summary(rows,'2026-10').result,100000);assert.equal(summary(rows,'2026-10','competence',false).result,90000);});
test('transferências não alteram resultado ou saldo consolidado',()=>{const rows=[entry(),entry({id:'2',type:'transferencia',category:'Transferência entre contas',destination:'Reserva',amount:50000})];assert.equal(summary(rows,'2026-10').result,100000);assert.equal(opening(rows,'2026-11'),100000);assert.throws(()=>validate(entry({type:'transferencia',category:'Transferência entre contas',destination:'Conta principal'})));});
test('datas, categorias e valores inválidos são recusados',()=>{assert.throws(()=>validate(entry({date:'2026-02-30'})));assert.throws(()=>validate(entry({competence:'2026-13'})));assert.throws(()=>validate(entry({category:'Moradia'})));assert.throws(()=>validate(entry({amount:0})));});
test('reimportação ignora duplicados e rejeita conflito de IDs',()=>{assert.equal(mergeImport([entry()],[entry({id:'novo'})]).duplicates,1);assert.equal(mergeImport([],[entry(),entry({id:'2'})]).added,1);assert.throws(()=>mergeImport([entry()],[entry({amount:200})]));});
