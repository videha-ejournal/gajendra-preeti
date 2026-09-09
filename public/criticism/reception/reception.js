(() => {
 const form=document.querySelector('.gist-filters');
 if(!form)return;
 const query=document.getElementById('gist-query'),focus=document.getElementById('gist-focus');
 const cards=[...document.querySelectorAll('[data-gist]')],status=document.querySelector('.gist-count');
 function filter(){
  const terms=query.value.normalize('NFC').toLowerCase().trim().split(/\s+/).filter(Boolean);
  let count=0;
  for(const card of cards){card.hidden=!((focus.value==='all'||card.dataset.focus===focus.value)&&terms.every(t=>card.dataset.search.normalize('NFC').includes(t)));if(!card.hidden)count++;}
  status.textContent=count?`${count} of ${cards.length} gists shown`:'No matching gists. Try another name or reset the filters.';
 }
 form.addEventListener('input',filter);form.addEventListener('change',filter);
 form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('reset',()=>requestAnimationFrame(filter));filter();
})();
