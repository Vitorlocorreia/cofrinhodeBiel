(function(){
  const more=document.querySelector('#nav-more');
  const sheet=document.querySelector('#more-nav-dialog');
  const close=document.querySelector('#close-more-nav');
  more.addEventListener('click',()=>{more.setAttribute('aria-expanded','true');sheet.showModal();});
  close.addEventListener('click',()=>sheet.close());
  sheet.addEventListener('close',()=>more.setAttribute('aria-expanded','false'));
  sheet.addEventListener('click',event=>{if(event.target!==sheet)return;const bounds=sheet.getBoundingClientRect();if(event.clientY<bounds.top||event.clientY>bounds.bottom||event.clientX<bounds.left||event.clientX>bounds.right)sheet.close();});
  const desktop=window.matchMedia('(min-width: 1000px)');
  desktop.addEventListener('change',event=>{if(event.matches&&sheet.open)sheet.close();});
})();
