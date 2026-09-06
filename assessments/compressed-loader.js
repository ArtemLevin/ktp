(function(){
'use strict';
const app=document.getElementById('assessment-app');
const fail=message=>{if(app)app.innerHTML=`<main class="shell"><section class="panel"><h1>Не удалось загрузить проверочную работу</h1><p>${String(message||'Неизвестная ошибка')}</p></section></main>`;};
async function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error(`Не удалось загрузить ${src}`));document.body.appendChild(s);});}
async function unpack(bytes){
 const text=async(format,data)=>new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream(format))).text();
 try{return await text('gzip',bytes);}
 catch(gzipError){
  const plainGzip=bytes.length>10&&bytes[0]===0x1f&&bytes[1]===0x8b&&bytes[2]===0x08&&bytes[3]===0x00;
  if(!plainGzip)throw gzipError;
  const body=bytes.slice(10),trims=[8,0,1,2,3,4,5,6,7];let lastError=null;
  for(const trim of trims){
   if(body.length<=trim)continue;
   const raw=trim?body.slice(0,-trim):body;
   try{
    const source=await text('deflate-raw',raw);
    console.warn(`Gzip trailer/checksum is invalid; recovered the raw DEFLATE assessment payload (trim=${trim}).`);
    return source;
   }catch(error){lastError=error;}
  }
  throw new Error(`Не удалось распаковать проверочную работу: ${gzipError.message}; резервная распаковка: ${lastError?.message||'не удалась'}`);
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
