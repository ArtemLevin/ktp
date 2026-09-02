(function(){
'use strict';
const D=window.KTP_DATA,S=window.KTP_STORE;
const root=document.body,rowId=root.dataset.row,ti=Number(root.dataset.topic);
const row=D?.rows?.find(r=>r.id===rowId),topic=row?.topics?.[ti];
if(!row||!topic){document.getElementById('app').innerHTML='<main class="page"><section class="card"><h1>Страница темы не найдена</h1><a href="../../index.html">Вернуться в КТП</a></section></main>';return;}
const content=window.KTP_CONTENT?.[topic.id]||null;
const state=S?.load?.()||{topics:{},plans:{},notes:{}};
const base=row.bounds.slice();
const bounds=Array.isArray(state.plans?.[row.id]?.bounds)&&state.plans[row.id].bounds.length===base.length?state.plans[row.id].bounds:base;
const rec=state.topics?.[topic.id]||{status:'planned',actualStart:'',actualEnd:''};
const notes=state.notes?.[topic.id]||[];
const parseLocal=iso=>{const [y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d);};
const halfToDate=h=>{const week=Math.max(0,Math.min(D.dates.length-1,Math.floor(h/2))),d=parseLocal(D.dates[week]);if(Math.floor(h)%2===1)d.setDate(d.getDate()+3);return d;};
const fmt=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}),fmtShort=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short',year:'numeric'});
const range=(a,b)=>`${fmt.format(halfToDate(a))} — ${fmt.format(halfToDate(Math.max(a,b-.01)))}`;
const statusLabel=s=>({planned:'Запланировано',in_progress:'В работе',done:'Пройдено',moved:'Перенесено',skipped:'Пропущено'})[s]||'Запланировано';
const esc=v=>String(v??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
const pad=n=>String(n).padStart(2,'0'),hrefFor=i=>`${pad(i+1)}.html`;
const prev=ti>0?hrefFor(ti-1):null,next=ti<row.topics.length-1?hrefFor(ti+1):null;
const baseChanged=bounds.some((v,i)=>v!==base[i]);
const duration=((bounds[ti+1]-bounds[ti])/2).toFixed((bounds[ti+1]-bounds[ti])%2?'1':'0'),baseRange=range(base[ti],base[ti+1]),liveRange=range(bounds[ti],bounds[ti+1]);
const notesHtml=notes.length?notes.slice().reverse().map(n=>`<div class="note"><time>${fmtShort.format(new Date(n.at))}</time>${esc(n.text)}</div>`).join(''):'<div class="note">Заметок к этой теме пока нет.</div>';
const list=(items,cls='clean-list')=>`<ul class="${cls}">${(items||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
const task=(item,index)=>`<li class="task"><div class="task-text">${esc(item.task||item)}</div>${item.answer!=null?`<details class="answer"><summary>Ответ</summary><div>${esc(item.answer)}</div></details>`:''}</li>`;
const taskList=items=>`<ol class="task-list">${(items||[]).map(task).join('')}</ol>`;
const example=ex=>`<article class="example"><div class="example-head"><span>Разобранный пример</span><strong>${esc(ex.title)}</strong></div><p class="problem"><b>Условие.</b> ${esc(ex.problem)}</p><p><b>Идея.</b> ${esc(ex.idea)}</p><p><b>Решение.</b> ${esc(ex.solution)}</p><p><b>Проверка.</b> ${esc(ex.check)}</p><div class="example-answer">Ответ: ${esc(ex.answer)}</div></article>`;
const practiceGroup=(label,key)=>{const items=content?.practice?.[key]||[];return items.length?`<section class="practice-group"><div class="level">${esc(label)}</div>${taskList(items)}</section>`:'';};
const sourceHtml=c=>{if(!c?.source)return'';return `<section class="card source-card"><span class="kicker">Источники и границы</span><h2>Основание содержания</h2><p>${esc(c.source.textbook||'')}</p>${list(c.source.paragraphs||[],'source-list')}<p class="source-note">${esc(c.source.assessment||'')}</p></section>`;};
const fullLesson=c=>`<article class="lesson">
<section class="card lesson-intro" id="start"><span class="kicker">Перед началом</span><h2>Что понадобится</h2>${list(c.prerequisites)}<div class="check-grid">${(c.prerequisiteCheck||[]).map((x,i)=>`<div class="check-item"><b>${i+1}.</b> ${esc(x.task)}<details class="answer"><summary>Проверить</summary><div>${esc(x.answer)}</div></details></div>`).join('')}</div></section>
<section class="card" id="goal"><span class="kicker">Образовательная цель</span><h2>После изучения темы ученик сможет</h2>${list(c.objectives)}<h3>Ожидаемые результаты</h3>${list(c.expectedResults,'result-list')}</section>
<section class="card" id="map"><span class="kicker">Карта темы</span><h2>Маршрут</h2><div class="topic-map">${(c.map||[]).map((x,i)=>`<div><span>${i+1}</span>${esc(x)}</div>`).join('')}</div></section>
<section class="card" id="theory"><span class="kicker">Теория</span><h2>Ключевые идеи</h2><div class="theory-grid">${(c.theory||[]).map(x=>`<section class="theory-block"><h3>${esc(x.title)}</h3><p>${x.html||''}</p></section>`).join('')}</div></section>
<section class="card" id="examples"><span class="kicker">Разобранные примеры</span><h2>Как рассуждать</h2><div class="examples">${(c.examples||[]).map(example).join('')}</div></section>
<section class="card" id="mistakes"><span class="kicker">Типичные ошибки</span><h2>Где чаще всего теряют баллы</h2><div class="mistake-grid">${(c.mistakes||[]).map(x=>`<article class="mistake"><strong>${esc(x.title)}</strong><p>${esc(x.explanation)}</p></article>`).join('')}</div></section>
<section class="card" id="practice"><span class="kicker">Тренировка</span><h2>От воспроизведения к переносу</h2><p class="section-note">Сначала решите самостоятельно. Ответ раскрывайте только после попытки.</p>${practiceGroup('A · База','basic')}${practiceGroup('B · Уверенное применение','standard')}${practiceGroup('C · Перенос','transfer')}${practiceGroup('D · Вызов','challenge')}</section>
<section class="card" id="diagnostic"><span class="kicker">Мини-диагностика</span><h2>Проверка ключевых навыков</h2><div class="diagnostic-grid">${(c.diagnostic||[]).map((x,i)=>`<article class="diagnostic-item"><div class="skill">${esc(x.skill)}</div><b>${i+1}. ${esc(x.task)}</b><details class="answer"><summary>Ответ</summary><div>${esc(x.answer)}</div></details></article>`).join('')}</div></section>
<section class="card" id="homework"><span class="kicker">Домашняя работа</span><h2>Закрепление</h2><h3>Обязательная часть</h3>${taskList(c.homework?.required||[])}${(c.homework?.optional||[]).length?`<h3>Дополнительная часть</h3>${taskList(c.homework.optional)}`:''}</section>
<section class="card remember" id="summary"><span class="kicker">Что нужно запомнить</span><h2>Опорные тезисы</h2>${list(c.summary,'remember-list')}</section>
</article>`;
const placeholder=`<article class="card"><span class="kicker">Страница занятия</span><h2>Каркас будущего учебного модуля</h2><p>Эта адресная страница пока синхронизирует план / факт и заметки. Предметное наполнение ещё не подключено.</p><div class="placeholder-list"><div class="placeholder"><strong>Образовательная цель</strong><span>Проверяемые знания и навыки.</span></div><div class="placeholder"><strong>Ключевые идеи и теория</strong><span>Опорный конспект, определения, формулы и примеры.</span></div><div class="placeholder"><strong>Тренировка и диагностика</strong><span>Упражнения разной сложности с ответами.</span></div></div></article>`;
const labCard=content?.lab?.enabled?`<section class="card lab-card"><span class="kicker">Цифровая лаборатория</span><h2>${esc(content.lab.title||'Исследование')}</h2><p>${esc(content.lab.description||'')}</p><a class="cta" href="${esc(content.lab.href)}">Открыть лабораторию →</a></section>`:'';
const quickNav=content?`<nav class="quick-nav" aria-label="Навигация по теме"><a href="#start">Перед началом</a><a href="#theory">Теория</a><a href="#examples">Примеры</a><a href="#practice">Тренировка</a><a href="#diagnostic">Диагностика</a><a href="#homework">Домашняя работа</a></nav>`:'';
document.title=`${topic.title} — ${row.grade} класс · KTP 3.0`;
document.getElementById('app').innerHTML=`<main class="page">
<div class="topbar"><a class="back" href="../../index.html?focus=${encodeURIComponent(row.id)}&view=timeline">← КТП 3.0</a><a class="catalog" href="../index.html">Все страницы тем</a></div>
<section class="hero"><div class="eyebrow">${row.grade} класс · ${esc(row.subject)} · ${esc(row.book)}</div><h1>${esc(topic.title)}</h1><div class="hero-meta"><span class="pill">Тема ${ti+1} из ${row.topics.length}</span><span class="pill">${topic.type==='reserve'?'Резерв / повторение':'Учебный раздел'}</span><span class="pill">2026/27</span>${content?.meta?.chapter?`<span class="pill">${esc(content.meta.chapter)}</span>`:''}</div><div class="live-note">${content?'Полноценный учебный модуль: теория, примеры, тренировка, диагностика и домашняя работа.':'Страница-заглушка синхронизирует план / факт и заметки с KTP 3.0.'}</div></section>
${quickNav}
<section class="grid"><article class="metric"><label>Плановый период</label><strong>${liveRange}</strong>${baseChanged?`<small>Исходно: ${baseRange}</small>`:'<small>По базовому календарному плану</small>'}</article><article class="metric"><label>Продолжительность</label><strong>${duration} нед.</strong><small>${Math.round((bounds[ti+1]-bounds[ti])*3.5)} календарных дней по шкале КТП</small></article><article class="metric"><label>Статус</label><strong><span class="status ${esc(rec.status||'planned')}">${statusLabel(rec.status||'planned')}</span></strong><small>Состояние берётся из KTP 3.0</small></article><article class="metric"><label>Факт</label><strong>${rec.actualStart?fmt.format(parseLocal(rec.actualStart)):'Начало не отмечено'}</strong><small>${rec.actualEnd?'Завершено: '+fmt.format(parseLocal(rec.actualEnd)):'Завершение не отмечено'}</small></article></section>
<section class="layout"><div>${content?fullLesson(content):placeholder}</div><aside class="side-stack"><section class="card"><span class="kicker">Паспорт темы</span><h2>${row.grade} класс</h2><div class="facts"><div class="fact"><span>Предмет</span><b>${esc(row.subject)}</b></div><div class="fact"><span>Учебная линия</span><b>${esc(row.book)}</b></div><div class="fact"><span>Позиция</span><b>${ti+1} / ${row.topics.length}</b></div><div class="fact"><span>Тип</span><b>${topic.type==='reserve'?'Резерв':'Основная тема'}</b></div><div class="fact"><span>ID</span><b>${esc(topic.id)}</b></div></div></section>${labCard}<section class="card"><span class="kicker">Заметки из KTP</span><h2>Контекст преподавателя</h2><div class="notes">${notesHtml}</div><div class="sync">Статус, фактические даты и заметки редактируются на основной странице KTP 3.0.</div></section>${sourceHtml(content)}</aside></section>
<nav class="nav">${prev?`<a href="${prev}">← ${esc(row.topics[ti-1].title)}</a>`:'<a class="disabled">← Предыдущей темы нет</a>'}${next?`<a href="${next}">${esc(row.topics[ti+1].title)} →</a>`:'<a class="disabled">Следующей темы нет →</a>'}</nav>
</main>`;
})();
