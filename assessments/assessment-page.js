(function(){
'use strict';
const data=window.KTP_ASSESSMENT_DATA;
const body=document.body;
const kind=body.dataset.kind||'independent';
const teacher=body.dataset.audience!=='student';
const topicId=body.dataset.topic||data?.meta?.topic;
const topic=data?.topic;
const work=topic?.[kind];
const app=document.getElementById('assessment-app');
const typeLabel=kind==='control'?'Контрольная работа':'Самостоятельная работа';
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const level=p=>p<=1?'A · база':p===2?'B · применение':'C · перенос';

// P1.3: reusable per-criterion evidence. Missing marks remain unknown, never scored zero.
const domainGroups={
 '03':{
  VOLUME_SCALE:'Подобие и размерность',SIMILAR_SOLIDS:'Подобие и размерность',
  CYLINDER_CONE_RATIO:'Основные формулы объёма',CYLINDER_VOLUME:'Основные формулы объёма',
  CONE_SLANT:'Основные формулы объёма',FRUSTUM_VOLUME:'Основные формулы объёма',
  SPHERE_BALL:'Сфера и объём шара',SPHERICAL_SEGMENT:'Шаровые части',
  SPHERICAL_SECTOR:'Шаровые части',SPHERICAL_LAYER:'Шаровые части',
  COMPOSITE_VOLUME:'Составные объёмы',CONE_FACTOR:'Математическое обоснование',
  CYLINDER_CAVITY_REASONING:'Математическое обоснование'
 }
};
const reviewAdvice={
 'Понятия тел и поверхностей':'Повторить различие тела, его границы и кругового сечения.',
 'Сечения и теорема Пифагора':'Построить рабочее прямоугольное сечение и явно указать гипотенузу.',
 'Подобие в сечениях':'Сопоставить подобные осевые треугольники и расстояния от вершины.',
 'Образующая и площади':'Проверить формулы боковой и полной площадей и скрытые основания.',
 'Составные поверхности':'Отметить открытые и внутренние поверхности составной модели.',
 'Доказательство геометрических условий':'Восстановить обоснование катетов и неравенств из условий задачи.',
 'Подобие и размерность':'Повторить кубическую зависимость объёма от линейного масштаба.',
 'Призмы и перпендикулярная высота':'Построить рабочее сечение и отделить ребро от высоты.',
 'Пирамиды и формулы объёма':'Повторить множитель 1/3 и формулу усечённой пирамиды.',
 'Составной объём':'Найти вычитаемую часть и обосновать знак операции.',
 'Доказательство и исправление ошибок':'Проверить геометрическое основание формулы и доказать результат.',
 'Основные формулы объёма':'Сопоставить цилиндр, конус и усечённый конус по формулам.',
 'Сфера и объём шара':'Разделить площадь границы и объём шара.',
 'Шаровые части':'Восстановить высоты сегментов и способ вычисления слоя.',
 'Составные объёмы':'Разбить тело на части и проверить сложение/вычитание.',
 'Математическое обоснование':'Записать обоснование каждого перехода и проверку неравенства.'
};
function criteriaFor(task){
 const raw=task?.criteria;
 if(Array.isArray(raw)&&raw.length){
  const rows=raw.map(c=>typeof c==='string'?{points:1,text:c}:{points:Number(c?.points),text:String(c?.text||'')});
  if(rows.every(c=>Number.isInteger(c.points)&&c.points>0&&c.text.trim().length>0)
    &&rows.reduce((n,c)=>n+c.points,0)===task.points)return {rows,generic:false};
 }
 const n=Number(task?.points)||1;
 const phrases=n===1?['Проверить основной результат']:
  n===2?['Правильный метод или обнаружение ошибки','Корректный результат или обоснованное исправление']:
  Array.from({length:n},(_,i)=>i===0?'Обоснованный выбор метода':i===n-1?'Проверенный результат':'Промежуточное обоснование');
 return {rows:phrases.map(text=>({points:1,text})),generic:true};
}
function domainFor(task,topicCode){
 return task?.diagnostic?.domain||domainGroups[topicCode]?.[task.skill]||task?.domain||task?.skill||'Другие навыки';
}
function assessmentSummary(variant,marks,topicCode){
 const domains=new Map();let earned=0,markedPoints=0,allPoints=0,markedParts=0,allParts=0;
 variant.tasks.forEach((task,index)=>{
  const name=domainFor(task,topicCode),rubric=criteriaFor(task).rows;
  if(!domains.has(name))domains.set(name,{domain:name,possible:0,markedPoints:0,earned:0,marked:0,criteria:0});
  const group=domains.get(name);
  rubric.forEach((part,j)=>{
   group.possible+=part.points;allPoints+=part.points;allParts++;group.criteria++;
   const value=marks[String(variant.id)+'/'+index+'/'+j];
   if(Number.isInteger(value)&&value>=0&&value<=part.points){
    earned+=value;markedPoints+=part.points;markedParts++;
    group.earned+=value;group.markedPoints+=part.points;group.marked++;
   }
  });
 });
 const groups=[...domains.values()].map(g=>({...g,complete:g.marked===g.criteria,
  percentage:g.marked===g.criteria?Math.round(100*g.earned/g.possible):null,
  advice:reviewAdvice[g.domain]||'Разобрать именно те шаги, по которым потеряны баллы.'}));
 return {earned,markedPoints,allPoints,markedParts,allParts,
  complete:markedParts===allParts,groups,
  toRecheck:groups.filter(g=>g.complete&&g.percentage<70)};
}
window.KTP_ASSESSMENT_DIAGNOSTICS=Object.freeze({criteriaFor,domainFor,assessmentSummary});
if(!data||!topic||!work||!app){
  if(app) app.innerHTML='<main class="shell"><section class="panel"><h1>Материал не найден</h1><p>Проверьте подключение данных и параметры страницы.</p></section></main>';
  return;
}


const gradeScale=work.maxScore===14
  ?[{r:'12–14',g:'5'},{r:'9–11',g:'4'},{r:'6–8',g:'3'},{r:'0–5',g:'2'}]
  :[{r:'17–20',g:'5'},{r:'13–16',g:'4'},{r:'8–12',g:'3'},{r:'0–7',g:'2'}];
let selected=1;
let showAll=false;
let showAnswers=false;
const marks=Object.create(null);
function skillsOf(v){return [...new Set(v.tasks.map(t=>t.skill).filter(Boolean))];}
function taskHtml(t,i){return `<article class="task"><div class="task-top"><span class="task-no">${i+1}</span><span class="level">${esc(level(t.points))}</span><span class="points">${t.points} ${t.points===1?'балл':t.points<5?'балла':'баллов'}</span></div><div class="skill">${esc(t.skill||'Навык')}</div><div class="task-text">${esc(t.text)}</div><div class="work-space" aria-hidden="true"></div></article>`;}

function pointWord(n){return n%10===1&&n%100!==11?'балл':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'балла':'баллов';}
function diagnosticHtml(variant){
 const report=assessmentSummary(variant,marks,String(topicId));
 const completed=report.complete;
 let markup='<h3>Диагностическая карта · вариант '+variant.id+'</h3>';
 markup+='<p class="diagnostic-lead">Оценено '+report.markedParts+' из '+report.allParts+' критериев; '+report.earned+' '+pointWord(report.earned)+' по отмеченным критериям'+(completed?' из '+work.maxScore+'.':'. До завершения проверки итоговая оценка не определяется.')+'</p>';
 if(report.markedParts===0)markup+='<p class="diagnostic-help">Выберите 0 или количество заработанных баллов по каждому критерию. Пустая оценка означает, что действие ещё не проверено.</p>';
 markup+='<ul class="diagnostic-domains">'+report.groups.map(group=>{
   const note=group.complete?(group.earned+' / '+group.possible+' · '+group.percentage+'%'):'Проверено '+group.marked+' из '+group.criteria+' критериев';
   return '<li><strong>'+esc(group.domain)+'</strong><span>'+esc(note)+'</span></li>';
 }).join('')+'</ul>';
 if(report.toRecheck.length){
   markup+='<h4>Приоритеты для повторной проверки</h4><ul class="diagnostic-advice">'+report.toRecheck.map(g=>'<li>'+esc(g.domain)+': '+esc(g.advice)+'</li>').join('')+'</ul>';
 }
 markup+='<p class="diagnostic-disclaimer">Это рабочая карта наблюдений. Один ответ или низкий балл по разделу требуют дополнительного задания для подтверждения пробела.</p>';
 return markup;
}
function keyHtml(v){
 const rows=v.tasks.map((t,i)=>{
  const rubric=criteriaFor(t),parts=rubric.rows.map((part,j)=>{
   const name=String(v.id)+'/'+i+'/'+j,score=marks[name];
   let options='<option value=""'+(score===undefined?' selected':'')+'>Не проверено</option>';
   for(let n=0;n<=part.points;n++)options+='<option value="'+n+'"'+(score===n?' selected':'')+'>'+n+' '+pointWord(n)+'</option>';
   return '<li class="criterion-item"><label><span>'+esc(part.text)+' · '+part.points+' '+(part.points===1?'балл':'балла')+'</span><select class="criterion-score" aria-label="Оценка: задание '+(i+1)+', критерий '+(j+1)+'" data-rubric-grade="'+esc(name)+'" data-variant-id="'+v.id+'">'+options+'</select></label></li>';
  }).join('');
  return '<li class="key-task"><strong>'+ (i+1)+'. '+esc(t.answer)+'</strong>'+(t.solution?'<div>'+esc(t.solution)+'</div>':'')+'<p class="key-domain">Навык: '+esc(domainFor(t,String(topicId)))+'</p><ul class="criterion-list">'+parts+'</ul>'+(rubric.generic?'<p class="rubric-note">Общие критерии: используйте предметное обоснование при выставлении частичных баллов.</p>':'')+'</li>';
 }).join('');
 return '<section class="teacher-key"><div class="key-title">Ответы и критерии · вариант '+v.id+'</div><p class="teacher-key-intro">Отмечайте доказанные действия по отдельности. Балл за правильный результат сохраняется при арифметической описке, если метод и дальнейшие действия математически согласованы.</p><ol>'+rows+'</ol><div class="diagnostic-summary" data-diagnostic-summary="'+v.id+'">'+diagnosticHtml(v)+'</div></section>';
}

function variantHtml(v){const skills=skillsOf(v);return `<section class="variant ${v.id===selected?'active':''}" data-variant="${v.id}"><header class="paper-head"><div><div class="paper-kicker">${esc(data.meta.grade)} класс · ${esc(data.meta.subject)} · ${esc(data.meta.book)}</div><h2>${esc(typeLabel)} · вариант ${v.id}</h2><p>${esc(topic.title)}</p></div><div class="student-fields"><span>ФИО ____________________________</span><span>Дата __________</span></div></header><div class="paper-meta"><span>${esc(work.duration)}</span><span>Максимум ${work.maxScore} баллов</span><span>Калькулятор не требуется</span></div><div class="instruction"><b>Инструкция.</b> Записывайте основные преобразования. В заданиях уровня C важен ход рассуждения: полный балл ставится за математически обоснованное решение.</div><div class="skill-strip">${skills.map(s=>`<span>${esc(s)}</span>`).join('')}</div><div class="tasks">${v.tasks.map(taskHtml).join('')}</div>${teacher?keyHtml(v):''}</section>`;}
function controlsHtml(){return `<section class="controls panel"><div class="variant-buttons" role="group" aria-label="Выбор варианта">${work.variants.map(v=>`<button type="button" data-pick="${v.id}" class="${v.id===selected?'selected':''}">Вариант ${v.id}</button>`).join('')}</div><div class="control-actions"><button type="button" data-all>${showAll?'Показывать один вариант':'Показать все 6 вариантов'}</button>${teacher?`<button type="button" data-answers>${showAnswers?'Скрыть ответы':'Показать ответы и критерии'}</button>`:''}<button type="button" data-print>Печать / PDF</button></div></section>`;}
function introHtml(){const row=data.meta.rowId||'';return `<header class="hero"><div class="hero-top"><a href="../../../topics/${esc(row)}/${esc(topicId)}.html">← К странице темы</a><span>${esc(data.meta.year)}</span></div><div class="eyebrow">${esc(typeLabel)} · 6 вариантов</div><h1>${esc(topic.title)}</h1><p>${esc(work.purpose)}</p><div class="hero-pills"><span>${esc(work.duration)}</span><span>${work.maxScore} баллов</span><span>6 равноценных вариантов</span></div></header>`;}
function guideHtml(){return `<section class="guide panel"><div><span class="section-label">Методический паспорт</span><h2>Что проверяет работа</h2><p>${esc(work.purpose)}</p><p class="source">${esc(topic.source||data.meta.sourceNote)}</p></div><div><span class="section-label">Шкала</span><h2>Ориентир оценки</h2><div class="grade-grid">${gradeScale.map(x=>`<span><b>${x.r}</b><em>${x.g}</em></span>`).join('')}</div><p class="rubric">В заданиях на 2–4 балла допускается частичный балл за верный метод при вычислительной ошибке, если дальнейшие шаги согласованы с полученным промежуточным результатом.</p></div></section>`;}
function render(){body.classList.toggle('all-on',showAll);body.classList.toggle('answers-on',teacher&&showAnswers);app.innerHTML=`<main class="shell">${introHtml()}${controlsHtml()}${guideHtml()}<div class="papers">${work.variants.map(variantHtml).join('')}</div><footer>${esc(data.meta.sourceNote||'Все задания разработаны специально для KTP 3.0.')}</footer></main>`;app.querySelectorAll('[data-pick]').forEach(btn=>btn.addEventListener('click',()=>{selected=Number(btn.dataset.pick);showAll=false;render();window.scrollTo({top:0,behavior:'smooth'});}));app.querySelector('[data-all]')?.addEventListener('click',()=>{showAll=!showAll;render();});app.querySelector('[data-answers]')?.addEventListener('click',()=>{showAnswers=!showAnswers;render();});app.querySelectorAll('[data-rubric-grade]').forEach(select=>select.addEventListener('change',()=>{
 const key=select.dataset.rubricGrade,variantId=Number(select.dataset.variantId);
 if(select.value==='')delete marks[key];else marks[key]=Number(select.value);
 const variant=work.variants.find(x=>x.id===variantId);
 const summary=app.querySelector('[data-diagnostic-summary="'+variantId+'"]');
 if(variant&&summary)summary.innerHTML=diagnosticHtml(variant);
}));
app.querySelector('[data-print]')?.addEventListener('click',()=>window.print());}
document.title=`${typeLabel}: ${topic.title} — ${data.meta.grade} класс · KTP 3.0`;
render();
})();
