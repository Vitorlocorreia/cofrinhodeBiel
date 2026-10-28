(function(){
  const key='cofre-gabriel-theme';
  const system=window.matchMedia('(prefers-color-scheme: dark)');
  let preference='system';
  try{const saved=localStorage.getItem(key);if(['light','dark','system'].includes(saved))preference=saved;}catch{}
  function apply(){const theme=preference==='system'?(system.matches?'dark':'light'):preference;document.documentElement.dataset.theme=theme;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#141517':'#ffffff');document.querySelectorAll('[data-theme-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice===preference)));}
  apply();
  system.addEventListener('change',()=>{if(preference==='system')apply();});
  document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-theme-choice]').forEach(button=>button.addEventListener('click',()=>{preference=button.dataset.themeChoice;apply();try{localStorage.setItem(key,preference);}catch{}}));apply();});
})();
