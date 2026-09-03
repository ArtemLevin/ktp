(function(){
'use strict';
const series=window.KTP_LESSON_SERIES;
const app=document.getElementById('app');
const esc=v=>String(v??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
if(!series||!app)return;
const meta=series.meta||{};
const lessons=[...(series.lessons||[])].sort((a,b)=>a.number-b.number);
const row=window.KTP_DATA?.rows?.find(r=>r.id===meta.rowId);
const topic=row?.topics?.[meta.topicIndex];
const topicTitle=topic?.title||meta.topicTitle||'';
const problems=[];
if(lessons.length!==meta.totalLessons)problems.push(`Ожидалось ${meta.totalLessons} уроков, загружено ${lessons.length}.`);
const ids=new Set();
lessons.forEach(l=>{if(ids.has(l.id))problems.push(`Повторяется ID ${l.id}.`);ids.add(l.id);});
const weeks=[...new Set(lessons.map(l=>l.week))].sort((a,b)=>a-b);
const groups=weeks.map(week=>{
  const cards=lessons.filter(l=>l.week===week).map(l=>`<a class="lesson-tile" href="${esc(l.id)}.html"><div class="tile-top"><span>Урок ${l.number}</span>${l.milestone?`<b>${esc(l.milestone)}</b>`:''}</div><h3>${esc(l.title)}</h3><p>${esc(l.source?.section||'')}</p><div class="tile-meta"><span>Самостоятельная: ${l.independent?.variants?.length||0} вар.</span><span>Контроль: ${l.control?.variants?.length||0} вар.</span></div></a>`).join('');
  return `<section class="week-block"><div class="week-heading"><div><span class="section-kicker">Учебная неделя</span><h2>Неделя ${week}</h2></div><span>${lessons.filter(l=>l.week===week).length} урока</span></div><div class="lesson-grid">${cards}</div></section>`;
}).join('');
document.title=`18 уроков: ${topicTitle} — ${meta.grade} класс · KTP 3.0`;
app.innerHTML=`<main class="lesson-page catalog-page"><nav class="topnav"><a href="${esc(meta.topicHref||'#')}">← Страница темы</a><div><a href="${esc(meta.ktpHref||'#')}">КТП 3.0</a></div></nav><header class="lesson-hero catalog-hero"><div class="eyebrow">${esc(meta.grade)} класс · ${esc(meta.subject)} · ${esc(meta.book)}</div><h1><span>Поурочная подготовка</span>${esc(topicTitle)}</h1><div class="hero-pills"><span>${lessons.length} уроков</span><span>${weeks.length} учебных недель</span><span>Тема ${esc(meta.topicNumber)} из ${row?.topics?.length||7}</span><span>${esc(meta.schoolYear)}</span></div><p>Последовательный маршрут первой темы: каждый урок имеет собственную адресную страницу, теорию, тренировку, домашнюю работу и проверочные варианты.</p><a class="hero-cta" href="01.html">Начать с урока 1 →</a></header>${problems.length?`<section class="integrity-warning"><b>Проверка данных:</b> ${problems.map(esc).join(' ')}</section>`:''}<section class="catalog-summary"><article><b>${lessons.length}</b><span>поурочных модулей</span></article><article><b>${weeks.length}</b><span>учебных недель</span></article><article><b>${lessons.reduce((s,l)=>s+(l.independent?.variants?.length||0),0)}</b><span>вариантов самостоятельных</span></article><article><b>${lessons.reduce((s,l)=>s+(l.control?.variants?.length||0),0)}</b><span>вариантов контроля</span></article></section><div class="weeks">${groups}</div><nav class="lesson-prev-next"><a href="${esc(meta.topicHref||'#')}">← К теме KTP</a><span></span><a href="${esc(meta.ktpHref||'#')}">К календарю →</a></nav></main>`;
})();
