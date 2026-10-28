(function(){
  const key='cofre-gabriel-theme';
  const system=window.matchMedia('(prefers-color-scheme: dark)');
  let preference='system';
  try{const saved=localStorage.getItem(key);if(['light','dark','system'].includes(saved))preference=saved;}catch{}
  function apply(){const theme=preference==='system'?(system.matches?'dark':'light'):preference;document.documentElement.dataset.theme=theme;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#101820':'#f3f7fb');}
  apply();
  system.addEventListener('change',()=>{if(preference==='system')apply();});
  document.addEventListener('DOMContentLoaded',()=>{const select=document.querySelector('#theme');select.value=preference;select.addEventListener('change',()=>{preference=select.value;apply();try{localStorage.setItem(key,preference);}catch{}});});
})();
