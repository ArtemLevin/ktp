(function(){
'use strict';
const series=window.KTP_LESSON_SERIES;
const app=document.getElementById('app');
const esc=v=>String(v??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
if(!series||!app){return;}
const meta=series.meta||{};
const requested=document.body.dataset.lesson||'';
const lesson=series.lessons.find(x=>String(x.id)===requested)||series.lessons[0];
if(!lesson){
  app.innerHTML='<main class="lesson-page"><section class="lesson-card"><h1>Урок не найден</h1><p>Данные урока не загрузились.</p><a href="index.html">Вернуться к списку уроков</a></section></main>';
  return;
}
const correction=series.corrections?.[lesson.id];
if(correction?.exampleChecks){
  Object.entries(correction.exampleChecks).forEach(([index,value])=>{
    const ex=lesson.examples?.[Number(index)];
    if(ex)ex.check=value;
  });
}
const row=window.KTP_DATA?.rows?.find(r=>r.id===meta.rowId);
const topic=row?.topics?.[meta.topicIndex];
const topicTitle=topic?.title||meta.topicTitle||'';
const total=meta.totalLessons||18;
const prev=lesson.number>1?String(lesson.number-1).padStart(2,'0')+'.html':null;
const next=lesson.number<total?String(lesson.number+1).padStart(2,'0')+'.html':null;
const list=(items,cls='plain-list')=>`<ul class="${cls}">${(items||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
const answer=content=>content!=null&&content!==''?`<details class="answer"><summary>Показать ответ</summary><div>${esc(content)}</div></details>`:'';
const taskList=(items,{showSkill=false}={})=>`<ol class="task-list">${(items||[]).map((item,i)=>`<li class="task"><div class="task-row"><span class="task-num">${i+1}</span><div><div class="task-text">${esc(item.text||item.task||item)}</div>${showSkill&&item.skill?`<div class="task-skill">${esc(item.skill)} · ${esc(item.points||0)} б.</div>`:''}${answer(item.answer)}</div></div></li>`).join('')}</ol>`;
const examples=(lesson.examples||[]).map((ex,i)=>`<article class="example"><div class="example-label">Пример ${i+1}</div><h3>${esc(ex.title)}</h3><p><b>Условие.</b> ${esc(ex.problem)}</p><p><b>Идея.</b> ${esc(ex.idea)}</p><p><b>Решение.</b> ${esc(ex.solution)}</p><p><b>Проверка.</b> ${esc(ex.check)}</p><div class="example-answer">Ответ: ${esc(ex.answer)}</div></article>`).join('');
const mistakes=(lesson.mistakes||[]).map(x=>`<article class="mistake"><h3>${esc(x.title)}</h3><p>${esc(x.explanation)}</p></article>`).join('');
const assessmentBlock=(kind,data,title)=>{
  if(!data?.variants?.length)return'';
  const options=data.variants.map(v=>`<option value="${esc(v.id)}">Вариант ${esc(v.id)}</option>`).join('');
  return `<section class="lesson-card assessment" id="${kind}"><div class="section-kicker">Проверка знаний</div><div class="section-heading"><div><h2>${esc(title)}</h2><p>${esc(data.purpose||'')}</p></div><div class="assessment-meta"><span>${esc(data.duration||'')}</span><span>${esc(data.maxScore||'')} баллов</span></div></div><div class="assessment-toolbar"><label>Вариант <select data-assessment-select="${kind}">${options}</select></label><button type="button" data-print-section="${kind}">Печать</button></div><div data-assessment-body="${kind}"></div></section>`;
};
const homework=lesson.homework||{};
const milestone=lesson.milestone?`<span class="milestone">${esc(lesson.milestone)}</span>`:'';
document.title=`Урок ${lesson.number}. ${lesson.title} — ${meta.grade} класс · KTP 3.0`;
app.innerHTML=`<main class="lesson-page">
  <nav class="topnav" aria-label="Верхняя навигация"><a href="${esc(meta.catalogHref||'index.html')}">← Все ${total} уроков</a><div><a href="${esc(meta.topicHref||'#')}">Страница темы</a><a href="${esc(meta.ktpHref||'#')}">КТП 3.0</a></div></nav>
  <header class="lesson-hero"><div class="eyebrow">${esc(meta.grade)} класс · ${esc(meta.subject)} · ${esc(meta.book)}</div><h1><span>Урок ${lesson.number}</span>${esc(lesson.title)}</h1><div class="hero-pills"><span>Тема ${esc(meta.topicNumber)}: ${esc(topicTitle)}</span><span>Неделя ${esc(lesson.week)}</span><span>${lesson.number} / ${total}</span>${milestone}</div><p>Поурочный модуль для самостоятельной работы: опорная теория, примеры, тренировка, домашнее задание и варианты проверки.</p></header>
  <nav class="quick-nav" aria-label="Разделы урока"><a href="#start">Перед началом</a><a href="#theory">Теория</a><a href="#examples">Примеры</a><a href="#practice">Тренировка</a><a href="#homework">Домашняя работа</a><a href="#independent">Самостоятельная</a><a href="#control">Контроль</a></nav>
  <div class="lesson-layout"><article class="lesson-main">
    <section class="lesson-card" id="start"><div class="section-kicker">Перед началом</div><h2>Что понадобится</h2>${list(lesson.prerequisites)}<div class="goal-box"><b>После урока вы сможете</b>${list(lesson.objectives,'goal-list')}</div></section>
    <section class="lesson-card" id="theory"><div class="section-kicker">Теория</div><h2>Ключевые идеи</h2><div class="theory-grid">${(lesson.theory||[]).map(x=>`<article class="theory"><h3>${esc(x.title)}</h3><div>${x.html||''}</div></article>`).join('')}</div></section>
    <section class="lesson-card" id="examples"><div class="section-kicker">Разобранные примеры</div><h2>Как рассуждать</h2><div class="examples">${examples}</div></section>
    <section class="lesson-card" id="mistakes"><div class="section-kicker">Типичные ошибки</div><h2>Что проверить перед ответом</h2><div class="mistake-grid">${mistakes}</div></section>
    <section class="lesson-card" id="practice"><div class="section-kicker">Тренировка</div><h2>Самостоятельная попытка</h2><p class="section-note">Решите задания по порядку. Ответ раскрывайте после своей попытки.</p>${taskList(lesson.practice)}</section>
    <section class="lesson-card" id="homework"><div class="section-kicker">Домашняя работа</div><h2>Закрепление урока</h2><h3>Обязательная часть</h3>${taskList(homework.required)}${homework.optional?.length?`<h3>Дополнительная часть</h3>${taskList(homework.optional)}`:''}</section>
    ${assessmentBlock('independent',lesson.independent,'Самостоятельная работа')}
    ${assessmentBlock('control',lesson.control,'Поурочный контроль')}
    <section class="lesson-card remember" id="summary"><div class="section-kicker">Что нужно запомнить</div><h2>Опорные тезисы</h2>${list(lesson.summary,'remember-list')}</section>
  </article>
  <aside class="lesson-aside"><section class="lesson-card source-card"><div class="section-kicker">Паспорт урока</div><h2>Урок ${lesson.number} из ${total}</h2><dl><div><dt>Класс</dt><dd>${esc(meta.grade)}</dd></div><div><dt>Предмет</dt><dd>${esc(meta.subject)}</dd></div><div><dt>Линия</dt><dd>${esc(meta.book)}</dd></div><div><dt>Неделя</dt><dd>${esc(lesson.week)}</dd></div><div><dt>Тема KTP</dt><dd>${esc(topicTitle)}</dd></div></dl></section><section class="lesson-card source-card"><div class="section-kicker">Источники</div><h2>Границы содержания</h2><p><b>Учебник.</b> ${esc(lesson.source?.textbook||'')}</p><p><b>Раздел.</b> ${esc(lesson.source?.section||'')}</p><p><b>Диагностика.</b> ${esc(lesson.source?.assessment||'')}</p></section></aside>
  </div>
  <nav class="lesson-prev-next" aria-label="Переход между уроками">${prev?`<a href="${prev}">← Урок ${lesson.number-1}</a>`:'<span></span>'}<a class="all-lessons" href="index.html">Все уроки</a>${next?`<a href="${next}">Урок ${lesson.number+1} →</a>`:'<span></span>'}</nav>
</main>`;
function renderAssessment(kind,data){
  const select=document.querySelector(`[data-assessment-select="${kind}"]`);
  const body=document.querySelector(`[data-assessment-body="${kind}"]`);
  if(!select||!body||!data?.variants?.length)return;
  const render=()=>{
    const variant=data.variants.find(v=>String(v.id)===select.value)||data.variants[0];
    const sum=(variant.tasks||[]).reduce((acc,t)=>acc+Number(t.points||0),0);
    body.innerHTML=`<div class="variant-caption"><b>Вариант ${esc(variant.id)}</b><span>${sum} баллов</span></div>${taskList(variant.tasks,{showSkill:true})}`;
  };
  select.addEventListener('change',render);
  render();
}
renderAssessment('independent',lesson.independent);
renderAssessment('control',lesson.control);
document.querySelectorAll('[data-print-section]').forEach(btn=>btn.addEventListener('click',()=>window.print()));
})();
