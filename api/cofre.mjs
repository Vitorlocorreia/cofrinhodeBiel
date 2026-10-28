import {gateway} from '../worker/proxy.mjs';

export function createVercelHandler(env){
  return {
    async fetch(request){
      // The owner explicitly selected an open, shared financial workspace.
      // The upstream gateway credential remains server-only.
      return gateway(request,env);
    }
  };
}

export default createVercelHandler(process.env);
