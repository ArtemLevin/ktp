(function(){
'use strict';
const S=window.KTP_LESSON_SERIES;if(!S)return;
const m=S.meta||{},start=Number(m.globalStart||1),courseTotal=Number(m.courseTotal||102);
if(start<=1)return;
const globalNo=l=>Number(l.globalNumber||start+Number(l.number||1)-1);
const page=document.body.dataset.page;
if(page==='lesson'){
  const id=document.body.dataset.lesson||'';
  const l=S.lessons?.find(x=>String(x.id)===id)||S.lessons?.[0];if(!l)return;
  const g=globalNo(l);
  document.title=`Урок ${g}. ${l.title} — ${m.grade} класс · KTP 3.0`;
  const hero=document.querySelector('.lesson-hero h1 span');if(hero)hero.textContent=`Урок ${g}`;
  const pills=document.querySelectorAll('.lesson-hero .hero-pills span');if(pills[2])pills[2].textContent=`Урок курса ${g}`;
  const passport=document.querySelector('.lesson-aside .source-card h2');if(passport)passport.textContent=`Урок ${g} из ${courseTotal}`;
  const nav=document.querySelector('.lesson-prev-next');if(nav){const links=[...nav.querySelectorAll('a')].filter(a=>!a.classList.contains('all-lessons'));links.forEach(a=>{if(a.getAttribute('href')===String(l.number-1).padStart(2,'0')+'.html')a.textContent=`← Урок ${g-1}`;if(a.getAttribute('href')===String(l.number+1).padStart(2,'0')+'.html')a.textContent=`Урок ${g+1} →`;});}
}
if(page==='lesson-index'){
  const tiles=[...document.querySelectorAll('.lesson-tile')];
  tiles.forEach(tile=>{const id=(tile.getAttribute('href')||'').replace('.html','');const l=S.lessons?.find(x=>String(x.id)===id);const span=tile.querySelector('.tile-top span');if(l&&span)span.textContent=`Урок ${globalNo(l)}`;});
  const cta=document.querySelector('.catalog-hero .hero-cta');if(cta)cta.textContent=`Начать с урока ${start} →`;
}
})();