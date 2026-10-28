import {gateway} from '../worker/proxy.mjs';

export function createVercelHandler(env){
  return {
    async fetch(request){
      // This singleton relies on the hosting access boundary. Enable only after
      // Vercel Authentication protects ALL deployments, including production.
      if(env.COFRE_PRIVATE_DEPLOYMENT!=='vercel-auth-all-deployments'){
        return Response.json({error:'O acesso privado do Cofre precisa ser configurado na Vercel antes de conectar o banco.'},{status:503,headers:{'Cache-Control':'no-store'}});
      }
      return gateway(request,env);
    }
  };
}

export default createVercelHandler(process.env);
