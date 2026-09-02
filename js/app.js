(function(){
'use strict';
const D=window.KTP_DATA,S=window.KTP_STORE;
const {rows,dates,dateLabels,months,halfCount}=D;
let state=S.load();
let activeTopic=null,dragInfo=null,miniDrag=null;
const fmt=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short',year:'numeric'});
const fmtLong=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'});
const $=id=>document.getElementById(id);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const esc=v=>String(v??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
const parseLocal=iso=>{const [y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d)};
const isoLocal=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const todayISO=()=>isoLocal(new Date());

function migrateV2DoneIds(){
  let changed=false;
  Object.keys(state.topics).forEach(key=>{
    const m=/^r(\d+)-t(\d+)$/.exec(key);if(!m)return;
    const row=rows[Number(m[1])],ti=Number(m[2]);
    if(row&&row.topics[ti]){const rec=state.topics[key];if(!state.topics[row.topics[ti].id])state.topics[row.topics[ti].id]={...rec,status:rec.status||'done'};delete state.topics[key];changed=true;}
  });
  if(changed)S.save(state);
}
migrateV2DoneIds();

function readUrlState(){
  const p=new URLSearchParams(location.search);
  if(p.get('grade'))$('gradeFilter')?.setAttribute('data-initial',p.get('grade'));
  if(p.get('subject'))$('subjectFilter')?.setAttribute('data-initial',p.get('subject'));
  if(p.get('book'))$('bookFilter')?.setAttribute('data-initial',p.get('book'));
  if(p.get('view')&&['dashboard','timeline','today'].includes(p.get('view')))state.ui.view=p.get('view');
  if(p.get('focus')&&rows.some(r=>r.id===p.get('focus')))state.ui.focusRow=p.get('focus');
}
readUrlState();

function getCurrentPosition(){
  const now=new Date(),first=parseLocal(dates[0]),last=new Date(parseLocal(dates[dates.length-1]).getTime()+7*86400000);
  if(now<first||now>=last)return null;
  let idx=0;for(let i=0;i<dates.length;i++){if(now>=parseLocal(dates[i]))idx=i;else break;}
  const start=parseLocal(dates[idx]),frac=clamp((now-start)/(7*86400000),0,1);
  return {week:idx+1,half:clamp(idx*2+frac*2,0,halfCount),date:now};
}
const current=getCurrentPosition();

function getBounds(row){const saved=state.plans[row.id]?.bounds;if(Array.isArray(saved)&&saved.length===row.bounds.length&&saved[0]===0&&saved[saved.length-1]===halfCount)return saved.slice();return row.bounds.slice();}
function topicRec(topic){return state.topics[topic.id]||{status:'planned',actualStart:'',actualEnd:''}}
function topicNotes(topic){return state.notes[topic.id]||[]}
function halfToDate(half){const week=clamp(Math.floor(half/2),0,dates.length-1),d=parseLocal(dates[week]);if(Math.floor(half)%2===1)d.setDate(d.getDate()+3);return d;}
function halfRangeText(a,b){return `${fmt.format(halfToDate(a))} — ${fmt.format(halfToDate(Math.max(a,b-.01)))}`}
function plannedTopicIndex(row,half=current?.half??0){const b=getBounds(row);if(half==null)return 0;for(let i=0;i<row.topics.length;i++)if(half>=b[i]&&half<b[i+1])return i;return row.topics.length-1;}
function rowMetrics(row){
  const b=getBounds(row);let doneHalf=0,workHalf=0,doneCount=0,workCount=0,reserveHalf=0;
  row.topics.forEach((t,i)=>{const dur=b[i+1]-b[i],rec=topicRec(t);if(t.type==='reserve')reserveHalf+=dur;if(rec.status==='done'){doneHalf+=dur;doneCount++;}else if(rec.status==='in_progress'){workHalf+=dur*.5;workCount++;}});
  const actual=doneHalf+workHalf,planned=current?clamp(current.half,0,halfCount):0,devWeeks=(actual-planned)/2;
  let forecast='—',forecastDate=null;
  if(current&&current.half>=2&&actual>.5){const pace=actual/current.half;if(pace>.08){const projectedHalf=halfCount/pace,d=parseLocal(dates[0]);d.setDate(d.getDate()+Math.round(projectedHalf/2*7));forecastDate=d;forecast=fmt.format(d);}}
  const lagWeeks=Math.max(0,-devWeeks),reserveWeeks=reserveHalf/2;
  return {doneHalf,workHalf,actual,planned,doneCount,workCount,reserveHalf,reserveWeeks,devWeeks,lagWeeks,forecast,forecastDate,actualPct:actual/halfCount*100,plannedPct:planned/halfCount*100,reserveCovers:reserveWeeks+0.01>=lagWeeks};
}
function devLabel(v){if(v<-.5)return {text:`${Math.abs(v).toFixed(1)} нед. отставания`,cls:'late'};if(v>.5)return {text:`${v.toFixed(1)} нед. опережения`,cls:'ahead'};return {text:'по плану',cls:'ok'};}

function fillFilters(){
  const grade=$('gradeFilter'),book=$('bookFilter');
  [...new Set(rows.map(r=>r.grade))].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=`${v} класс`;grade.append(o)});
  [...new Set(rows.map(r=>r.book))].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;book.append(o)});
  ['gradeFilter','subjectFilter','bookFilter'].forEach(id=>{const el=$(id),v=el.dataset.initial;if(v&&[...el.options].some(o=>o.value===v))el.value=v});
}
function filterValues(){return {q:$('search').value.trim().toLowerCase(),grade:$('gradeFilter').value,subject:$('subjectFilter').value,book:$('bookFilter').value}}
function rowMatches(row){const f=filterValues();if(state.ui.focusRow&&row.id!==state.ui.focusRow)return false;if(f.grade!=='all'&&String(row.grade)!==f.grade)return false;if(f.subject!=='all'&&row.subject!==f.subject)return false;if(f.book!=='all'&&row.book!==f.book)return false;if(!f.q)return true;const hay=[row.grade,row.subject,row.book,row.title,...row.topics.map(t=>t.title)].join(' ').toLowerCase();return f.q.split(/\s+/).every(token=>hay.includes(token));}
function visibleRows(){return rows.filter(rowMatches)}
function syncUrl(){const p=new URLSearchParams(),f=filterValues();if(f.grade!=='all')p.set('grade',f.grade);if(f.subject!=='all')p.set('subject',f.subject);if(f.book!=='all')p.set('book',f.book);if(state.ui.view!=='timeline')p.set('view',state.ui.view);if(state.ui.focusRow)p.set('focus',state.ui.focusRow);history.replaceState(null,'',location.pathname+(p.toString()?`?${p}`:'')+location.hash);}

function makeCell(cls,text,start,end){const el=document.createElement('div');el.className=`cell ${cls}`;el.textContent=text;el.style.gridColumn=`${start+1}/${end+1}`;return el}
function addPastLayer(tl){if(!current)return;const l=document.createElement('div');l.className='past-layer';l.style.width=`calc(var(--half) * ${current.half})`;tl.append(l)}
function buildHeader(){
  const head=document.createElement('div');head.className='schedule-head';
  [['month','Месяц'],['date','Дата'],['week','Неделя']].forEach(([kind,label])=>{const row=document.createElement('div');row.className=`head-row ${kind}`;const lab=document.createElement('div');lab.className='head-label';lab.textContent=label;row.append(lab);const tl=document.createElement('div');tl.className='timeline';if(kind==='month')months.forEach(m=>tl.append(makeCell('month-cell',m.name,m.start,m.end)));if(kind==='date')dateLabels.forEach((d,i)=>tl.append(makeCell(`date-cell${current?.week===i+1?' current':''}`,d,i*2,i*2+2)));if(kind==='week')dates.forEach((_,i)=>tl.append(makeCell(`week-cell${current?.week===i+1?' current':''}`,String(i+1),i*2,i*2+2)));addPastLayer(tl);row.append(tl);head.append(row);});
  return head;
}
function buildGradeGroup(grade,gradeRows){
  const wrap=document.createElement('div');wrap.className='grade-group';wrap.dataset.grade=grade;
  const label=document.createElement('div');label.className='grade-label';const btn=document.createElement('button');btn.className='grade-toggle';btn.type='button';const collapsed=state.ui.collapsedGrades.includes(grade);btn.textContent=collapsed?'＋':'−';btn.title=collapsed?'Развернуть':'Свернуть';btn.onclick=()=>toggleGrade(grade);const t=document.createElement('span');t.innerHTML=`${grade} класс <span class="grade-count">${gradeRows.length} учебн. линий</span>`;label.append(btn,t);
  const tl=document.createElement('div');tl.className='grade-timeline';const avg=gradeRows.reduce((s,r)=>s+rowMetrics(r).actualPct,0)/gradeRows.length;tl.innerHTML=`<span>Фактический прогресс</span><span class="grade-progress"><i style="width:${clamp(avg,0,100)}%"></i></span><strong>${Math.round(avg)}%</strong>`;addPastLayer(tl);wrap.append(label,tl);return wrap;
}
function buildSubjectRow(row){
  const bounds=getBounds(row),metrics=rowMetrics(row),dev=devLabel(metrics.devWeeks),sec=document.createElement('section');sec.className='subject-row';sec.dataset.rowid=row.id;sec.dataset.grade=row.grade;sec.dataset.subject=row.subject;sec.dataset.book=row.book;
  const label=document.createElement('div');label.className='subject-label';const badge=document.createElement('span');badge.className='grade-badge';badge.textContent=row.grade;const info=document.createElement('div');info.className='subject-info';info.innerHTML=`<div class="subject-name">${esc(row.subject)} · ${esc(row.book)}</div><div class="subject-meta">${esc(row.hours||`${row.topics.length} разделов`)}</div><div class="row-progress"><span class="row-progress-track"><i style="width:${clamp(metrics.actualPct,0,100)}%"></i></span><span>${Math.round(metrics.actualPct)}%</span></div><div class="row-deviation ${dev.cls}">${dev.text}</div>`;const focus=document.createElement('button');focus.className='focus-btn';focus.type='button';focus.textContent='⊙';focus.title='Сфокусироваться на этой линии';focus.onclick=e=>{e.stopPropagation();setFocus(row.id)};label.append(badge,info,focus);sec.append(label);
  const tl=document.createElement('div');tl.className='timeline';tl.dataset.rowid=row.id;
  row.topics.forEach((topic,ti)=>{const rec=topicRec(topic),c=makeCell(`topic ${topic.type==='reserve'?'reserve ':''}status-${rec.status||'planned'}`,topic.title,bounds[ti],bounds[ti+1]);c.dataset.topicid=topic.id;c.dataset.ti=ti;c.dataset.search=topic.title.toLowerCase();c.title=topic.title;if(current&&current.half>=bounds[ti]&&current.half<bounds[ti+1])c.classList.add('current-hit');const q=filterValues().q;if(q&&q.split(/\s+/).some(token=>topic.title.toLowerCase().includes(token)))c.classList.add('search-match');if(topicNotes(topic).length){const dot=document.createElement('span');dot.className='note-dot';c.append(dot)}c.addEventListener('click',()=>{if(!state.ui.replan)openDrawer(row.id,ti)});c.draggable=!!state.ui.replan&&ti>0;if(c.draggable){c.addEventListener('dragstart',e=>startTopicDrag(e,row.id,ti,c));c.addEventListener('dragend',()=>{dragInfo=null;c.classList.remove('dragging');clearDropMarkers()});}tl.append(c);});
  addPastLayer(tl);tl.addEventListener('dragover',e=>timelineDragOver(e,row.id,tl));tl.addEventListener('drop',e=>timelineDrop(e,row.id,tl));tl.addEventListener('dragleave',e=>{if(!tl.contains(e.relatedTarget))clearDropMarkers()});sec.append(tl);return sec;
}
function renderSchedule(){
  const wrap=$('scheduleWrap'),left=wrap.scrollLeft,top=wrap.scrollTop,schedule=$('schedule');schedule.innerHTML='';schedule.append(buildHeader());
  [...new Set(rows.map(r=>r.grade))].forEach(g=>{const gradeRows=rows.filter(r=>r.grade===g&&rowMatches(r)),group=buildGradeGroup(g,gradeRows.length?gradeRows:rows.filter(r=>r.grade===g));group.hidden=!gradeRows.length;schedule.append(group);if(!state.ui.collapsedGrades.includes(g))gradeRows.forEach(r=>schedule.append(buildSubjectRow(r)));});
  $('empty').classList.toggle('show',visibleRows().length===0);requestAnimationFrame(()=>{wrap.scrollLeft=left;wrap.scrollTop=top;updateMiniMap()});
}
function toggleGrade(grade){const a=state.ui.collapsedGrades,i=a.indexOf(grade);if(i>=0)a.splice(i,1);else a.push(grade);S.save(state);renderSchedule()}
function setFocus(rowId){state.ui.focusRow=rowId;S.save(state);renderAll();syncUrl()}
function clearFocus(){state.ui.focusRow=null;S.save(state);renderAll();syncUrl()}

function startTopicDrag(e,rowId,ti,el){if(!state.ui.replan||ti===0){e.preventDefault();return}dragInfo={rowId,ti};el.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',`${rowId}:${ti}`)}
function clearDropMarkers(){document.querySelectorAll('.drop-marker').forEach(el=>el.remove())}
function timelineDragOver(e,rowId,tl){if(!dragInfo||dragInfo.rowId!==rowId)return;e.preventDefault();e.dataTransfer.dropEffect='move';const rect=tl.getBoundingClientRect(),x=clamp(e.clientX-rect.left,0,rect.width),half=Math.round(x/rect.width*halfCount);clearDropMarkers();const m=document.createElement('div');m.className='drop-marker';m.style.left=`${half/halfCount*100}%`;tl.append(m)}
function timelineDrop(e,rowId,tl){if(!dragInfo||dragInfo.rowId!==rowId)return;e.preventDefault();const rect=tl.getBoundingClientRect(),target=clamp(Math.round((e.clientX-rect.left)/rect.width*halfCount),0,halfCount);applyPlanShift(rowId,dragInfo.ti,target);dragInfo=null;clearDropMarkers()}
function applyPlanShift(rowId,ti,targetHalf){
  const row=rows.find(r=>r.id===rowId);if(!row||ti<=0)return;const before=getBounds(row),start=before[ti];let delta=targetHalf-start;
  if(state.ui.shiftFollowing){const minDelta=before[ti-1]+1-start,maxDelta=(halfCount-1)-before[before.length-2];delta=clamp(delta,minDelta,maxDelta);}else{const minDelta=before[ti-1]+1-start,maxDelta=before[ti+1]-1-start;delta=clamp(delta,minDelta,maxDelta);}
  delta=Math.round(delta);if(!delta)return;const after=before.slice();if(state.ui.shiftFollowing){for(let j=ti;j<after.length-1;j++)after[j]+=delta}else after[ti]+=delta;
  state.plans[rowId]={bounds:after,updatedAt:new Date().toISOString()};const topic=row.topics[ti],rec=topicRec(topic);if((rec.status||'planned')==='planned')state.topics[topic.id]={...rec,status:'moved'};
  S.addHistory(state,{type:'plan_shift',rowId,topicId:topic.id,description:`${row.grade} класс · ${row.subject}: «${topic.title}» ${delta>0?'сдвинута позже':'сдвинута раньше'} на ${Math.abs(delta/2).toFixed(1)} нед.`,beforeBounds:before,afterBounds:after,undoable:true,undone:false});renderAll();
}
function undoLastPlan(){for(let i=state.history.length-1;i>=0;i--){const h=state.history[i];if(h.type==='plan_shift'&&h.undoable&&!h.undone&&Array.isArray(h.beforeBounds)){state.plans[h.rowId]={bounds:h.beforeBounds.slice(),updatedAt:new Date().toISOString()};h.undone=true;S.addHistory(state,{type:'undo',rowId:h.rowId,topicId:h.topicId,description:`Отменено: ${h.description}`});renderAll();return;}}alert('Нет изменений планирования, которые можно отменить.');}

function setView(view){state.ui.view=view;S.save(state);['dashboard','timeline','today'].forEach(v=>{$(`${v}View`).hidden=v!==view;document.querySelector(`.view-tab[data-view="${v}"]`)?.classList.toggle('active',v===view)});renderView(view);syncUrl()}
function renderView(view){if(view==='dashboard')renderDashboard();if(view==='today')renderToday();if(view==='timeline'){renderSchedule();updateMiniMap()}}
function renderDashboard(){
  const vr=visibleRows(),metrics=vr.map(rowMetrics),totalActual=metrics.reduce((s,m)=>s+m.actual,0),total=vr.length*halfCount,totalReserve=metrics.reduce((s,m)=>s+m.reserveWeeks,0),risks=metrics.filter(m=>m.devWeeks<-.5).length,pct=total?totalActual/total*100:0,avgDev=metrics.length?metrics.reduce((s,m)=>s+m.devWeeks,0)/metrics.length:0;
  $('dashboardSummary').innerHTML=`<article class="summary-card"><div class="label">Фактический прогресс</div><div class="value">${Math.round(pct)}%</div><div class="hint">по ${vr.length} видимым учебным линиям</div></article><article class="summary-card ${risks?'warn':'good'}"><div class="label">Требуют внимания</div><div class="value">${risks}</div><div class="hint">отставание более 0,5 недели</div></article><article class="summary-card"><div class="label">Среднее отклонение</div><div class="value">${avgDev>0?'+':''}${avgDev.toFixed(1)} нед.</div><div class="hint">положительное значение = опережение</div></article><article class="summary-card"><div class="label">Доступный резерв</div><div class="value">${totalReserve.toFixed(1)} нед.</div><div class="hint">суммарно по видимым линиям</div></article>`;
  $('dashboardRows').innerHTML=vr.map(r=>{const m=rowMetrics(r),d=devLabel(m.devWeeks);return `<tr data-row="${esc(r.id)}"><td class="line-cell"><div class="line-name">${r.grade} класс · ${esc(r.subject)}</div><div class="line-sub">${esc(r.book)}</div></td><td><div>${Math.round(m.actualPct)}%</div><div class="metric-bar"><i style="width:${clamp(m.actualPct,0,100)}%"></i></div></td><td>${Math.round(m.plannedPct)}%</td><td><span class="dev ${d.cls}">${d.text}</span></td><td>${m.reserveWeeks.toFixed(1)} нед.</td><td>${m.forecast}</td></tr>`}).join('');
  $('dashboardRows').querySelectorAll('tr').forEach(tr=>tr.addEventListener('click',()=>{setFocus(tr.dataset.row);setView('timeline')}));renderHistory();
}
function renderHistory(){const items=state.history.slice(-12).reverse();$('historyList').innerHTML=items.length?items.map(h=>`<div class="history-item"><div class="history-time">${fmtLong.format(new Date(h.at))}${h.undone?' · отменено':''}</div><div class="history-text">${esc(h.description||h.type)}</div></div>`).join(''):'<div class="history-empty">Изменений пока нет.</div>'}
function renderToday(){
  const vr=visibleRows();if(!current){$('todayGrid').innerHTML='<div class="panel-card" style="padding:24px">Сегодняшняя дата находится вне диапазона учебного года 2026/27.</div>';return}
  $('todayGrid').innerHTML=vr.map(r=>{const m=rowMetrics(r),d=devLabel(m.devWeeks),pi=plannedTopicIndex(r),planned=r.topics[pi],activeIndex=r.topics.findIndex(t=>topicRec(t).status==='in_progress'),active=activeIndex>=0?r.topics[activeIndex]:null,next=r.topics[Math.min(r.topics.length-1,(activeIndex>=0?activeIndex:pi)+1)],reserveMsg=m.lagWeeks>.5?(m.reserveCovers?`Резерв ${m.reserveWeeks.toFixed(1)} нед. покрывает текущее отставание.`:`Резерва ${m.reserveWeeks.toFixed(1)} нед. недостаточно для отставания ${m.lagWeeks.toFixed(1)} нед.`):`Резерв: ${m.reserveWeeks.toFixed(1)} нед.`;return `<article class="today-card ${d.cls}"><div class="today-card-top"><div><div class="today-line">${r.grade} класс · ${esc(r.subject)}</div><div class="today-book">${esc(r.book)}</div></div><span class="dev ${d.cls}">${d.text}</span></div><div class="today-topic"><label>По плану</label><strong>${esc(planned.title)}</strong></div><div class="today-fact">Фактически: <strong>${active?esc(active.title):'активная тема не отмечена'}</strong></div><div class="today-fact">Следом: ${esc(next.title)}</div><div class="reserve-note ${m.reserveCovers?'ok':'warn'}">${reserveMsg}</div><div class="today-actions"><button class="btn start-action" data-row="${r.id}" data-ti="${pi}">${active?'Открыть':'Начать тему'}</button><button class="btn primary finish-action" data-row="${r.id}" data-ti="${activeIndex>=0?activeIndex:pi}">${active?'Завершить':'Карточка'}</button></div></article>`}).join('');
  $('todayGrid').querySelectorAll('.start-action').forEach(b=>b.onclick=()=>{const r=rows.find(x=>x.id===b.dataset.row),ti=Number(b.dataset.ti),active=r.topics.findIndex(t=>topicRec(t).status==='in_progress');if(active>=0)openDrawer(r.id,active);else quickStatus(r.id,ti,'in_progress')});$('todayGrid').querySelectorAll('.finish-action').forEach(b=>b.onclick=()=>{const r=rows.find(x=>x.id===b.dataset.row),ti=Number(b.dataset.ti),rec=topicRec(r.topics[ti]);if(rec.status==='in_progress')quickStatus(r.id,ti,'done');else openDrawer(r.id,ti)});
}
function quickStatus(rowId,ti,status){const row=rows.find(r=>r.id===rowId),topic=row?.topics[ti];if(!topic)return;const rec={...topicRec(topic),status};if(status==='in_progress'&&!rec.actualStart)rec.actualStart=todayISO();if(status==='done'&&!rec.actualEnd)rec.actualEnd=todayISO();state.topics[topic.id]=rec;S.addHistory(state,{type:'status',rowId,topicId:topic.id,description:`${row.grade} класс · ${row.subject}: «${topic.title}» → ${statusLabel(status)}`});renderAll()}
function statusLabel(s){return ({planned:'Запланировано',in_progress:'В работе',done:'Пройдено',moved:'Перенесено',skipped:'Пропущено'})[s]||s}
function openDrawer(rowId,ti){
  const row=rows.find(r=>r.id===rowId);if(!row||!row.topics[ti])return;activeTopic={rowId,ti};const topic=row.topics[ti],rec=topicRec(topic),b=getBounds(row),m=rowMetrics(row),d=devLabel(m.devWeeks),notes=topicNotes(topic),hist=state.history.filter(h=>h.topicId===topic.id).slice(-6).reverse();
  $('drawerContent').innerHTML=`<div class="eyebrow">${row.grade} класс · ${esc(row.subject)}</div><h2>${esc(topic.title)}</h2><div class="rowname">${esc(row.book)}${row.hours?' · '+esc(row.hours):''}</div><div class="drawer-section"><div class="drawer-section-title">План</div><dl><dt>Плановый период</dt><dd>${halfRangeText(b[ti],b[ti+1])}</dd><dt>Позиция</dt><dd>${ti+1} из ${row.topics.length}</dd><dt>Отклонение линии</dt><dd><span class="dev ${d.cls}">${d.text}</span></dd><dt>Резерв</dt><dd>${m.reserveWeeks.toFixed(1)} нед.</dd></dl></div><div class="drawer-section"><div class="drawer-section-title">Факт</div><div class="status-grid"><div class="field full"><label>Статус</label><select id="topicStatus"><option value="planned">Запланировано</option><option value="in_progress">В работе</option><option value="done">Пройдено</option><option value="moved">Перенесено</option><option value="skipped">Пропущено</option></select></div><div class="field"><label>Фактическое начало</label><input id="actualStart" type="date" value="${esc(rec.actualStart||'')}" /></div><div class="field"><label>Фактическое завершение</label><input id="actualEnd" type="date" value="${esc(rec.actualEnd||'')}" /></div></div><div class="drawer-actions"><button id="prevTopic" class="btn" type="button">← Ранее</button><button id="nextTopic" class="btn" type="button">Далее →</button><button id="saveFact" class="btn primary wide" type="button">Сохранить план / факт</button></div></div><div class="drawer-section"><div class="drawer-section-title">Заметки преподавателя</div><div class="field"><textarea id="noteText" placeholder="Например: нужно ещё одно занятие, перенести контрольную, повторить метод…"></textarea></div><button id="addNote" class="btn" style="margin-top:7px;width:100%" type="button">Добавить заметку</button><div class="notes-list" style="margin-top:8px">${notes.slice().reverse().map(n=>`<div class="note-item"><time>${fmtLong.format(new Date(n.at))}</time><p>${esc(n.text)}</p></div>`).join('')||'<div class="history-empty">Заметок пока нет.</div>'}</div></div><div class="drawer-section"><div class="drawer-section-title">История темы</div><div class="topic-history">${hist.map(h=>`<div class="topic-history-item"><b>${fmt.format(new Date(h.at))}</b> · ${esc(h.description||h.type)}</div>`).join('')||'<div class="history-empty">Изменений пока нет.</div>'}</div></div>`;
  $('topicStatus').value=rec.status||'planned';$('drawer').classList.add('open');$('drawerBackdrop').classList.add('open');$('drawer').setAttribute('aria-hidden','false');$('saveFact').onclick=saveDrawerFact;$('addNote').onclick=addDrawerNote;$('prevTopic').onclick=()=>openDrawer(rowId,Math.max(0,ti-1));$('nextTopic').onclick=()=>openDrawer(rowId,Math.min(row.topics.length-1,ti+1));
}
function saveDrawerFact(){if(!activeTopic)return;const row=rows.find(r=>r.id===activeTopic.rowId),topic=row.topics[activeTopic.ti],before=topicRec(topic),after={status:$('topicStatus').value,actualStart:$('actualStart').value,actualEnd:$('actualEnd').value};if(after.status==='in_progress'&&!after.actualStart)after.actualStart=todayISO();if(after.status==='done'&&!after.actualEnd)after.actualEnd=todayISO();state.topics[topic.id]=after;S.addHistory(state,{type:'status',rowId:row.id,topicId:topic.id,description:`${row.grade} класс · ${row.subject}: «${topic.title}» — ${statusLabel(before.status||'planned')} → ${statusLabel(after.status)}`});renderAll();openDrawer(row.id,activeTopic.ti)}
function addDrawerNote(){if(!activeTopic)return;const text=$('noteText').value.trim();if(!text)return;const row=rows.find(r=>r.id===activeTopic.rowId),topic=row.topics[activeTopic.ti];state.notes[topic.id]=state.notes[topic.id]||[];state.notes[topic.id].push({id:`n-${Date.now()}`,text,at:new Date().toISOString()});S.addHistory(state,{type:'note',rowId:row.id,topicId:topic.id,description:`Добавлена заметка к теме «${topic.title}»`});renderAll();openDrawer(row.id,activeTopic.ti)}
function closeDrawer(){$('drawer').classList.remove('open');$('drawerBackdrop').classList.remove('open');$('drawer').setAttribute('aria-hidden','true');activeTopic=null}

function renderStats(){const vr=visibleRows();let done=0,work=0,risk=0;vr.forEach(r=>{const m=rowMetrics(r);done+=m.doneCount;work+=m.workCount;if(m.devWeeks<-.5)risk++});$('visibleRows').textContent=vr.length;$('doneCount').textContent=done;$('workCount').textContent=work;$('riskCount').textContent=risk;if(current)$('todayStat').innerHTML=`Сегодня: <strong>${current.week}-я неделя</strong> · ${fmtLong.format(current.date)}`;else $('todayStat').textContent='Текущая дата вне диапазона КТП';$('focusBanner').classList.toggle('show',!!state.ui.focusRow);if(state.ui.focusRow){const r=rows.find(x=>x.id===state.ui.focusRow);$('focusText').textContent=`Фокус: ${r.grade} класс · ${r.subject} · ${r.book}`}}
function renderMonthbar(){const bar=$('monthbar');bar.innerHTML='';months.forEach((m,i)=>{const b=document.createElement('button');b.type='button';b.className='month-chip';b.textContent=m.name;b.dataset.index=i;b.onclick=()=>scrollToHalf(m.start);bar.append(b)});updateActiveMonth()}
function scrollToHalf(half){const wrap=$('scheduleWrap'),label=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label'))||270,h=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--half'))||23;wrap.scrollTo({left:Math.max(0,label+half*h-wrap.clientWidth*.22),behavior:'smooth'})}
function scrollToCurrent(){if(!current){alert('Сегодняшняя дата находится вне диапазона учебного года 2026/27.');return}setView('timeline');setTimeout(()=>scrollToHalf(current.half),20)}
function updateActiveMonth(){const wrap=$('scheduleWrap');if(!wrap)return;const label=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label'))||270,h=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--half'))||23,half=clamp((wrap.scrollLeft+wrap.clientWidth*.25-label)/h,0,halfCount);let idx=months.findIndex(m=>half>=m.start&&half<m.end);if(idx<0)idx=months.length-1;document.querySelectorAll('.month-chip').forEach((b,i)=>b.classList.toggle('active',i===idx))}
function buildMiniMap(){const mm=$('miniMonths');mm.innerHTML='';months.forEach(m=>{const el=document.createElement('div');el.className='mini-month';el.style.width=`${(m.end-m.start)/halfCount*100}%`;el.title=m.name;mm.append(el)});if(current){$('miniPast').style.width=`${current.half/halfCount*100}%`;$('miniToday').style.left=`${current.half/halfCount*100}%`}else{$('miniPast').style.width='0';$('miniToday').style.display='none'}updateMiniMap()}
function updateMiniMap(){const wrap=$('scheduleWrap'),vp=$('miniViewport');if(!wrap||!vp)return;const width=clamp(wrap.clientWidth/wrap.scrollWidth*100,5,100),maxScroll=Math.max(1,wrap.scrollWidth-wrap.clientWidth),left=(wrap.scrollLeft/maxScroll)*(100-width);vp.style.width=`${width}%`;vp.style.left=`${clamp(left,0,100-width)}%`;updateActiveMonth()}
function miniPointerToScroll(clientX){const track=$('miniTrack'),wrap=$('scheduleWrap'),rect=track.getBoundingClientRect(),ratio=clamp((clientX-rect.left)/rect.width,0,1);wrap.scrollLeft=ratio*Math.max(0,wrap.scrollWidth-wrap.clientWidth);updateMiniMap()}
function setupMiniMap(){const track=$('miniTrack'),vp=$('miniViewport');track.addEventListener('pointerdown',e=>{if(e.target===vp)return;miniPointerToScroll(e.clientX)});vp.addEventListener('pointerdown',e=>{miniDrag={x:e.clientX,start:$('scheduleWrap').scrollLeft};vp.setPointerCapture(e.pointerId);vp.classList.add('dragging');e.preventDefault()});vp.addEventListener('pointermove',e=>{if(!miniDrag)return;const trackRect=track.getBoundingClientRect(),wrap=$('scheduleWrap'),delta=(e.clientX-miniDrag.x)/trackRect.width*wrap.scrollWidth;wrap.scrollLeft=miniDrag.start+delta;updateMiniMap()});const end=()=>{miniDrag=null;vp.classList.remove('dragging')};vp.addEventListener('pointerup',end);vp.addEventListener('pointercancel',end)}
function applyUi(){document.body.classList.toggle('compact',state.ui.density==='compact');$('replanNotice').classList.toggle('show',!!state.ui.replan);$('replanBtn').classList.toggle('primary',!!state.ui.replan);$('shiftFollowing').checked=state.ui.shiftFollowing!==false}
function renderAll(){applyUi();renderStats();renderView(state.ui.view);if(state.ui.view!=='timeline')renderSchedule();updateUndoButton();syncUrl()}
function updateUndoButton(){const has=state.history.some(h=>h.type==='plan_shift'&&h.undoable&&!h.undone);$('historyUndoBtn').disabled=!has;$('historyUndoBtn').style.opacity=has?'1':'.45'}
function applyFilters(){renderAll()}
function exportData(){const blob=new Blob([S.exportState(state)],{type:'application/json'}),a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=`ktp-2026-27-state-${todayISO()}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function importData(file){try{const text=await file.text();state=S.importState(text);S.save(state);applyUi();renderAll();alert('Состояние KTP 3.0 импортировано.')}catch(e){alert(`Не удалось импортировать файл: ${e.message}`)}}
function bind(){document.querySelectorAll('.view-tab').forEach(b=>b.onclick=()=>setView(b.dataset.view));['search','gradeFilter','subjectFilter','bookFilter'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',applyFilters));$('todayBtn').onclick=scrollToCurrent;$('densityBtn').onclick=()=>{state.ui.density=state.ui.density==='compact'?'comfortable':'compact';S.save(state);renderAll()};$('replanBtn').onclick=()=>{state.ui.replan=!state.ui.replan;S.save(state);renderAll()};$('shiftFollowing').onchange=e=>{state.ui.shiftFollowing=e.target.checked;S.save(state)};$('historyUndoBtn').onclick=undoLastPlan;$('exportBtn').onclick=exportData;$('importInput').onchange=e=>{if(e.target.files[0])importData(e.target.files[0]);e.target.value=''};$('clearFocus').onclick=clearFocus;$('drawerClose').onclick=closeDrawer;$('drawerBackdrop').onclick=closeDrawer;$('scheduleWrap').addEventListener('scroll',updateMiniMap,{passive:true});window.addEventListener('resize',updateMiniMap,{passive:true});document.addEventListener('keydown',e=>{const tag=document.activeElement?.tagName;if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(tag)){e.preventDefault();$('search').focus()}if(e.key==='Escape'){if($('drawer').classList.contains('open'))closeDrawer();else if(state.ui.focusRow)clearFocus()}})}
fillFilters();renderMonthbar();buildMiniMap();setupMiniMap();bind();applyUi();setView(state.ui.view||'timeline');renderAll();if(current&&state.ui.view==='timeline')setTimeout(scrollToCurrent,180);
})();