(function(){
'use strict';
const series=window.KTP_LESSON_SERIES;
if(!series)return;
const meta=series.meta||{};
const total=meta.totalLessons||series.lessons?.length||0;
const page=document.body.dataset.page;
if(page==='lesson'){
  const allLink=document.querySelector('.topnav>a');
  if(allLink&&total)allLink.textContent=`← Все ${total} уроков`;
  const requested=document.body.dataset.lesson||'';
  const lesson=series.lessons?.find(x=>String(x.id)===requested)||series.lessons?.[0];
  if(lesson?.lab&&!document.getElementById('lab')){
    const section=document.createElement('section');
    section.className='lesson-card';
    section.id='lab';
    const kicker=document.createElement('div');
    kicker.className='section-kicker';
    kicker.textContent='Цифровая лаборатория';
    const title=document.createElement('h2');
    title.textContent=lesson.lab.title||'Исследовательская лаборатория';
    const desc=document.createElement('p');
    desc.textContent=lesson.lab.description||'Откройте отдельную интерактивную модель для исследования темы.';
    const link=document.createElement('a');
    link.className='hero-cta';
    link.href=lesson.lab.href;
    link.textContent='Открыть лабораторию →';
    section.append(kicker,title,desc,link);
    const homework=document.getElementById('homework');
    if(homework)homework.insertAdjacentElement('afterend',section);
    const quick=document.querySelector('.quick-nav');
    if(quick){const a=document.createElement('a');a.href='#lab';a.textContent='Лаборатория';quick.appendChild(a);}
  }
}
if(page==='lesson-index'){
  const row=window.KTP_DATA?.rows?.find(r=>r.id===meta.rowId);
  const topic=row?.topics?.[meta.topicIndex];
  const topicTitle=topic?.title||meta.topicTitle||'';
  if(total)document.title=`${total} уроков: ${topicTitle} — ${meta.grade} класс · KTP 3.0`;
  const lead=document.querySelector('.catalog-hero p');
  if(lead)lead.textContent='Последовательный маршрут темы: каждый урок имеет собственную адресную страницу, теорию, тренировку, домашнюю работу и проверочные варианты.';
}
})();
