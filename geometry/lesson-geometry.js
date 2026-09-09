(function(){
'use strict';
const S=window.KTP_LESSON_SERIES;
const id=document.body?.dataset?.lesson;
const lesson=S?.lessons?.find(x=>String(x.id)===String(id));
if(!S||!lesson)return;
const key=`${document.body.dataset.row||S.meta?.rowId||''}::${Number(document.body.dataset.topic||S.meta?.topicIndex||0)}`;
window.KTP_CONTENT=window.KTP_CONTENT||{};
const holder=window.KTP_CONTENT[key]||(window.KTP_CONTENT[key]={});
holder.geometryScenes={...(holder.geometryScenes||{}),...(S.geometryScenes||{})};
function add(host,sceneId){
 if(!host||!sceneId)return;
 const slot=document.createElement('span');
 slot.className='geometry-lesson-slot';
 slot.dataset.geometryScene=sceneId;
 host.append(slot);
}
const theoryHosts=[...document.querySelectorAll('#theory .theory')];
(lesson.theory||[]).forEach((item,i)=>add(theoryHosts[i],item.figure));
const exampleHosts=[...document.querySelectorAll('#examples .example')];
(lesson.examples||[]).forEach((item,i)=>add(exampleHosts[i],item.figure));
})();
