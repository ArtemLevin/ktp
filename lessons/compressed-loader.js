(function(){
'use strict';
const app=document.getElementById('app');
const fail=message=>{if(app){const href=window.KTP_LESSON_SERIES?.meta?.ktpHref||'../../../index.html';app.innerHTML=`<main class="lesson-page"><section class="lesson-card"><h1>Не удалось загрузить данные урока</h1><p>${String(message||'Неизвестная ошибка')}</p><a href="${href}">Вернуться в КТП</a></section></main>`;}};
async function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error(`Не удалось загрузить ${src}`));document.body.appendChild(s);});}
async function unpack(bytes){
 const text=async(format,data)=>new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream(format))).text();
 try{return await text('gzip',bytes);}
 catch(gzipError){
  const plainGzip=bytes.length>18&&bytes[0]===0x1f&&bytes[1]===0x8b&&bytes[2]===0x08&&bytes[3]===0x00;
  if(!plainGzip)throw gzipError;
  try{
   console.warn('Gzip checksum/trailer is invalid; recovering the intact raw DEFLATE lesson payload.');
   return await text('deflate-raw',bytes.slice(10,-8));
  }catch(rawError){throw new Error(`Не удалось распаковать данные: ${gzipError.message}; резервная распаковка: ${rawError.message}`);}
 }
}
(async()=>{
 try{
  const b64=window.KTP_COMPRESSED_LESSONS;
  if(!b64)throw new Error('Сжатый пакет данных отсутствует.');
  if(typeof DecompressionStream==='undefined')throw new Error('Браузер не поддерживает встроенную распаковку. Обновите браузер.');
  const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
  const source=await unpack(bytes);
  new Function(source)();
  const meta=window.KTP_LESSON_SERIES?.meta||{};
  if(meta.rowId&&!document.body.dataset.row)document.body.dataset.row=meta.rowId;
  if(Number.isInteger(meta.topicIndex)&&!document.body.dataset.topic)document.body.dataset.topic=String(meta.topicIndex);
  if(document.body.dataset.page==='lesson'&&!document.body.dataset.lesson){
    const match=location.pathname.match(/\/(\d{2})\.html$/);
    if(match)document.body.dataset.lesson=match[1];
  }
  await loadScript(document.body.dataset.page==='lesson-index'?'../../lesson-index.js':'../../lesson-page.js');
  await loadScript('../../series-adapter.js');
  await loadScript('../../global-numbering.js');
 }catch(error){console.error(error);fail(error.message);}
})();
})();
