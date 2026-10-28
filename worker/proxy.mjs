export async function gateway(request,env){
  if(!['GET','PUT'].includes(request.method))return Response.json({error:'Método não permitido.'},{status:405});
  if(request.headers.get('x-cofre-request')!=='1')return Response.json({error:'Requisição não autorizada.'},{status:403});
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Origem não autorizada.'},{status:403});
  if(!env.COFRE_GATEWAY_TOKEN)return Response.json({error:'Conexão com o banco ainda não configurada.'},{status:503});
  try{
    const body=request.method==='PUT'?await request.text():undefined;
    if(body&&new TextEncoder().encode(body).length>8500000)return Response.json({error:'Histórico muito grande.'},{status:413});
    const remote=await fetch('https://aidyozfnugrutveowkah.supabase.co/functions/v1/cofre-gateway',{method:request.method,headers:{'x-cofre-gateway':env.COFRE_GATEWAY_TOKEN,'Content-Type':'application/json'},body,signal:AbortSignal.timeout(25000)});
    return new Response(await remote.text(),{status:remote.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }catch{return Response.json({error:'Banco temporariamente indisponível. A cópia local foi preservada.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
