import {validateState} from './state.mjs';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
Deno.serve(async(req:Request)=>{
  if(!['GET','PUT'].includes(req.method))return json({error:'Método não permitido.'},405);
  const token=req.headers.get('x-cofre-gateway');
  if(!token||token.length<40||token.length>100)return json({error:'Acesso não autorizado.'},401);
  try{
    const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
    const tokenHash=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
    const base=Deno.env.get('SUPABASE_URL');
    let secret:string|undefined;
    try{secret=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;}catch{}
    secret ||= Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if(!base||!secret)return json({error:'Conexão do banco indisponível.'},503);
    let body:{revision:number;state:unknown}|undefined;
    if(req.method==='PUT'){
      const raw=await req.text();if(new TextEncoder().encode(raw).length>8500000)return json({error:'Histórico muito grande.'},413);
      try{body=JSON.parse(raw);if(!body||!Number.isSafeInteger(body.revision)||body.revision<0)throw Error();body.state=validateState(body.state);}catch{return json({error:'Histórico inválido. Confira os registros.'},400);}
    }
    const response=await fetch(base+'/rest/v1/rpc/cofre_gateway',{method:'POST',headers:{'apikey':secret,...(secret.startsWith('sb_secret_')?{}:{'Authorization':'Bearer '+secret}),'Content-Type':'application/json'},body:JSON.stringify({p_token_hash:tokenHash,p_action:body?'write':'read',p_expected_revision:body?.revision??null,p_state:body?.state??null}),signal:AbortSignal.timeout(20000)});
    const result=await response.json();
    if(!response.ok){if(result.code==='28000')return json({error:'Acesso não autorizado.'},401);if(result.code==='40001')return json({error:'O histórico mudou em outro dispositivo. Atualize antes de salvar.'},409);return json({error:'Não foi possível acessar o histórico.'},503);}
    if(result.conflict)return json({error:'O histórico mudou em outro dispositivo. Atualize antes de salvar.'},409);
    return json(result);
  }catch{return json({error:'Não foi possível conectar ao banco. Sua cópia local foi preservada.'},503);}
});
