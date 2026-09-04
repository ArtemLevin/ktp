(function(){
'use strict';
const app=document.getElementById('app');
const fail=message=>{if(app)app.innerHTML=`<main class="lesson-page"><section class="lesson-card"><h1>Не удалось загрузить данные урока</h1><p>${String(message||'Неизвестная ошибка')}</p><a href="../../../index.html?focus=10-algebra-alimov&view=timeline">Вернуться в КТП</a></section></main>`;};
async function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error(`Не удалось загрузить ${src}`));document.body.appendChild(s);});}
(async()=>{
 try{
  const b64=window.KTP_COMPRESSED_LESSONS;
  if(!b64)throw new Error('Сжатый пакет данных отсутствует.');
  if(typeof DecompressionStream==='undefined')throw new Error('Браузер не поддерживает встроенную распаковку gzip. Обновите браузер.');
  const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const source=await new Response(stream).text();
  new Function(source)();
  await loadScript(document.body.dataset.page==='lesson-index'?'../../lesson-index.js':'../../lesson-page.js');
  await loadScript('../../series-adapter.js');
 }catch(error){console.error(error);fail(error.message);}
})();
})();
