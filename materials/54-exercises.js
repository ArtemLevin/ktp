(function(){
'use strict';
const p=new URLSearchParams(location.search),row=p.get('row'),topic=p.get('topic'),lesson=p.get('lesson'),aud=p.get('audience')==='teacher'?'teacher':'student';
const app=document.getElementById('app');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if(!row||!topic||!lesson){app.innerHTML='<section class="error">Не заданы параметры материала.</section>';return;}
const script=document.createElement('script');
script.src='../lessons/'+encodeURIComponent(row)+'/'+encodeURIComponent(topic)+'/resources-54.js';
script.onload=render;
script.onerror=()=>app.innerHTML='<section class="error">Данные материала не загрузились.</section>';
document.head.appendChild(script);
function render(){
  const d=window.KTP_54_RESOURCES?.[row]?.[topic]?.[lesson];
  if(!d){app.innerHTML='<section class="error">Материал для этого урока пока не найден.</section>';return;}
  const audience=aud==='teacher'?'Для преподавателя':'Для учащихся';
  const full=d.publicationLabel+' '+d.grade+' класс. '+d.rubric+'. '+d.title+'. '+audience;
  document.title=full;
  const groups=[['A','Уровень A · база'],['B','Уровень B · стандарт'],['C','Уровень C · рассуждение и контроль ошибок'],['Challenge','Challenge · перенос и обоснование']];
  const sections=groups.map(([code,label])=>{
    const tasks=d.tasks.filter(x=>x.level===code);
    return '<section class="exercise-block"><div class="level-row"><h2>'+esc(label)+'</h2><span>'+tasks.length+' упражнений</span></div><ol start="'+(tasks[0]?.n||1)+'">'+tasks.map(t=>'<li><div class="task">'+esc(t.text)+'</div>'+(aud==='teacher'?'<div class="answer"><b>Ответ.</b> '+esc(t.answer)+'</div>':'')+'</li>').join('')+'</ol></section>';
  }).join('');
  const method=aud==='teacher'
    ? '<section class="method"><div class="kicker">Методический паспорт</div><h2>Как использовать материал</h2><p><b>Навык:</b> '+esc(d.skill)+'.</p><p><b>Маршрут:</b> A — база; B — стандарт; C — объяснение, контрпример и анализ ошибки; Challenge — перенос и обоснование.</p><p><b>Источник КТП:</b> '+esc(d.source.ktp)+' · урок №'+d.globalLesson+'.</p><p><b>Официальная опора:</b> <a href="'+esc(d.source.officialUrl)+'" target="_blank" rel="noopener">'+esc(d.source.officialTitle)+'</a>.</p></section>'
    : '<section class="method student"><div class="kicker">Как работать</div><p>Решайте блоки последовательно. Отмечайте задания, где пришлось возвращаться к правилу, и повторите их через 1–2 дня.</p></section>';
  app.innerHTML='<nav class="toolbar"><a href="javascript:history.back()">← К уроку</a><button type="button" id="print">Печать / сохранить PDF</button></nav><article class="sheet"><header class="cover"><div class="subject">МАТЕМАТИКА</div><div class="rubric">54 упражнения</div><div class="subtitle">для тотального закрепления</div><h1>'+esc(d.title)+'</h1><p>'+d.grade+' класс · урок №'+d.globalLesson+'</p><strong>'+audience+'</strong><small>Публикация: 25 сентября 2026 г.</small></header>'+method+sections+'<footer>Лёвин Артём Александрович · '+esc(full)+'</footer></article>';
  document.getElementById('print')?.addEventListener('click',()=>window.print());
}
})();