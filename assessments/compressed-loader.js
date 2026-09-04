(function(){
'use strict';
const app=document.getElementById('assessment-app');
const fail=message=>{if(app)app.innerHTML=`<main class="shell"><section class="panel"><h1>Не удалось загрузить проверочную работу</h1><p>${String(message||'Неизвестная ошибка')}</p></section></main>`;};
async function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error(`Не удалось загрузить ${src}`));document.body.appendChild(s);});}
async function unpack(bytes){
 const text=async(format,data)=>new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream(format))).text();
 try{return await text('gzip',bytes);}
 catch(gzipError){
  const plainGzip=bytes.length>18&&bytes[0]===0x1f&&bytes[1]===0x8b&&bytes[2]===0x08&&bytes[3]===0x00;
  if(!plainGzip)throw gzipError;
  try{
   console.warn('Gzip checksum/trailer is invalid; recovering the intact raw DEFLATE assessment payload.');
   return await text('deflate-raw',bytes.slice(10,-8));
  }catch(rawError){throw new Error(`Не удалось распаковать проверочную работу: ${gzipError.message}; резервная распаковка: ${rawError.message}`);}
 }
}
(async()=>{
 try{
  const b64=window.KTP_COMPRESSED_ASSESSMENT;
  if(!b64)throw new Error('Сжатый пакет проверочной работы отсутствует.');
  if(typeof DecompressionStream==='undefined')throw new Error('Браузер не поддерживает встроенную распаковку. Обновите браузер.');
  const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
  const source=await unpack(bytes);
  new Function(source)();
  if(!document.body.dataset.topic&&window.KTP_ASSESSMENT_DATA?.meta?.topic)document.body.dataset.topic=window.KTP_ASSESSMENT_DATA.meta.topic;
  await loadScript('../../assessment-page.js');
 }catch(error){console.error(error);fail(error.message);}
})();
})();
