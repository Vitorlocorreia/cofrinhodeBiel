import {validate} from './core.mjs';
import {validatePlan} from './schedules.mjs';
export function validateState(state){
  if(!state||state.version!==2||!Array.isArray(state.entries)||!Array.isArray(state.plans))throw Error('Formato do histórico inválido.');
  if(state.entries.length>25000||state.plans.length>1000)throw Error('O histórico excede o limite de registros.');
  const entries=state.entries.map(validate),plans=state.plans.map(validatePlan),ids=new Set(),planIds=new Set();
  for(const entry of entries){if(typeof entry.id!=='string'||!entry.id||entry.id.length>150||ids.has(entry.id))throw Error('Identificadores de lançamento inválidos ou repetidos.');ids.add(entry.id);}
  for(const plan of plans){if(planIds.has(plan.id))throw Error('Compromissos repetidos.');planIds.add(plan.id);}
  const clean={version:2,entries,plans};if(new TextEncoder().encode(JSON.stringify(clean)).length>8*1024*1024)throw Error('O histórico excede 8 MB.');return clean;
}
