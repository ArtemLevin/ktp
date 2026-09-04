(function(){
'use strict';
const app=document.getElementById('assessment-app');
const fail=message=>{if(app)app.innerHTML=`<main class="shell"><section class="panel"><h1>Не удалось загрузить проверочную работу</h1><p>${String(message||'Неизвестная ошибка')}</p></section></main>`;};
async function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error(`Не удалось загрузить ${src}`));document.body.appendChild(s);});}
(async()=>{
 try{
  const b64=window.KTP_COMPRESSED_ASSESSMENT;
  if(!b64)throw new Error('Сжатый пакет проверочной работы отсутствует.');
  if(typeof DecompressionStream==='undefined')throw new Error('Браузер не поддерживает встроенную распаковку gzip. Обновите браузер.');
  const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const source=await new Response(stream).text();
  new Function(source)();
  if(!document.body.dataset.topic&&window.KTP_ASSESSMENT_DATA?.meta?.topic)document.body.dataset.topic=window.KTP_ASSESSMENT_DATA.meta.topic;
  await loadScript('../../assessment-page.js');
 }catch(error){console.error(error);fail(error.message);}
})();
})();
