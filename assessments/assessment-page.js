(function(){
'use strict';
const data=window.KTP_ASSESSMENT_DATA;
const body=document.body;
const kind=body.dataset.kind||'independent';
const topicId=body.dataset.topic||data?.meta?.topic;
const topic=data?.topic;
const work=topic?.[kind];
const app=document.getElementById('assessment-app');
if(!data||!topic||!work||!app){
  if(app) app.innerHTML='<main class="shell"><section class="panel"><h1>Материал не найден</h1><p>Проверьте подключение data.js и параметры страницы.</p></section></main>';
  return;
}
const typeLabel=kind==='control'?'Контрольная работа':'Самостоятельная работа';
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const level=p=>p<=1?'A · база':p===2?'B · применение':'C · перенос';
const gradeScale=work.maxScore===14
  ?[{r:'12–14',g:'5'},{r:'9–11',g:'4'},{r:'6–8',g:'3'},{r:'0–5',g:'2'}]
  :[{r:'17–20',g:'5'},{r:'13–16',g:'4'},{r:'8–12',g:'3'},{r:'0–7',g:'2'}];
let selected=1;
let showAll=false;
let showAnswers=false;
function skillsOf(v){return [...new Set(v.tasks.map(t=>t.skill).filter(Boolean))];}
function taskHtml(t,i){return `<article class="task"><div class="task-top"><span class="task-no">${i+1}</span><span class="level">${esc(level(t.points))}</span><span class="points">${t.points} ${t.points===1?'балл':t.points<5?'балла':'баллов'}</span></div><div class="skill">${esc(t.skill||'Навык')}</div><div class="task-text">${esc(t.text)}</div><div class="work-space" aria-hidden="true"></div></article>`;}
function keyHtml(v){return `<section class="teacher-key"><div class="key-title">Ответы и критерии · вариант ${v.id}</div><ol>${v.tasks.map((t,i)=>`<li><b>${i+1}. ${esc(t.answer)}</b>${t.solution?`<div>${esc(t.solution)}</div>`:''}<span>${t.points} балл(а)</span></li>`).join('')}</ol></section>`;}
function variantHtml(v){const skills=skillsOf(v);return `<section class="variant ${v.id===selected?'active':''}" data-variant="${v.id}"><header class="paper-head"><div><div class="paper-kicker">7 класс · Алгебра · Макарычев</div><h2>${esc(typeLabel)} · вариант ${v.id}</h2><p>${esc(topic.title)}</p></div><div class="student-fields"><span>ФИО ____________________________</span><span>Дата __________</span></div></header><div class="paper-meta"><span>${esc(work.duration)}</span><span>Максимум ${work.maxScore} баллов</span><span>Калькулятор не требуется</span></div><div class="instruction"><b>Инструкция.</b> Записывайте основные преобразования. В заданиях уровня C важен ход рассуждения: полный балл ставится за математически обоснованное решение.</div><div class="skill-strip">${skills.map(s=>`<span>${esc(s)}</span>`).join('')}</div><div class="tasks">${v.tasks.map(taskHtml).join('')}</div>${keyHtml(v)}</section>`;}
function controlsHtml(){return `<section class="controls panel"><div class="variant-buttons" role="group" aria-label="Выбор варианта">${work.variants.map(v=>`<button type="button" data-pick="${v.id}" class="${v.id===selected?'selected':''}">Вариант ${v.id}</button>`).join('')}</div><div class="control-actions"><button type="button" data-all>${showAll?'Показывать один вариант':'Показать все 6 вариантов'}</button><button type="button" data-answers>${showAnswers?'Скрыть ответы':'Показать ответы и критерии'}</button><button type="button" data-print>Печать / PDF</button></div></section>`;}
function introHtml(){return `<header class="hero"><div class="hero-top"><a href="../../../topics/7-algebra-makarychev/${topicId}.html">← К странице темы</a><span>${esc(data.meta.year)}</span></div><div class="eyebrow">${esc(typeLabel)} · 6 вариантов</div><h1>${esc(topic.title)}</h1><p>${esc(work.purpose)}</p><div class="hero-pills"><span>${esc(work.duration)}</span><span>${work.maxScore} баллов</span><span>6 равноценных вариантов</span></div></header>`;}
function guideHtml(){return `<section class="guide panel"><div><span class="section-label">Методический паспорт</span><h2>Что проверяет работа</h2><p>${esc(work.purpose)}</p><p class="source">${esc(topic.source||data.meta.sourceNote)}</p></div><div><span class="section-label">Шкала</span><h2>Ориентир оценки</h2><div class="grade-grid">${gradeScale.map(x=>`<span><b>${x.r}</b><em>${x.g}</em></span>`).join('')}</div><p class="rubric">В заданиях на 2–4 балла допускается частичный балл за верный метод при вычислительной ошибке, если дальнейшие шаги согласованы с полученным промежуточным результатом.</p></div></section>`;}
function render(){body.classList.toggle('all-on',showAll);body.classList.toggle('answers-on',showAnswers);app.innerHTML=`<main class="shell">${introHtml()}${controlsHtml()}${guideHtml()}<div class="papers">${work.variants.map(variantHtml).join('')}</div><footer>Все задания разработаны специально для KTP 3.0. Структура проверки согласована с тематическими границами учебника и диагностическим профилем СиКР.</footer></main>`;app.querySelectorAll('[data-pick]').forEach(btn=>btn.addEventListener('click',()=>{selected=Number(btn.dataset.pick);showAll=false;render();window.scrollTo({top:0,behavior:'smooth'});}));app.querySelector('[data-all]')?.addEventListener('click',()=>{showAll=!showAll;render();});app.querySelector('[data-answers]')?.addEventListener('click',()=>{showAnswers=!showAnswers;render();});app.querySelector('[data-print]')?.addEventListener('click',()=>window.print());}
document.title=`${typeLabel}: ${topic.title} — KTP 3.0`;
render();
})();