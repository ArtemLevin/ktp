(function(){
'use strict';
const root=document.getElementById('app');
const p=new URLSearchParams(location.search);
const item=p.get('item')||'', line=p.get('line')==='strong'?'strong':'standard';
const audience=p.get('audience')==='teacher'?'teacher':'student';
const meta={
'8a_l18':{grade:8,subject:'Алгебра',lesson:18,date:'05.10.2026',title:'Квадратные корни и уравнение x² = a',skill:'арифметический квадратный корень, число корней x² = a и проверка решений',page:'../../../lessons/8-algebra-makarychev/02/03.html'},
'7a_l17':{grade:7,subject:'Алгебра',lesson:17,date:'06.10.2026',title:'Текстовые задачи с помощью уравнений',skill:'составление линейной модели, решение уравнения и проверка допустимости ответа',page:'../../../lessons/7-algebra-makarychev/01/17.html'},
'6m_l30':{grade:6,subject:'Математика',lesson:30,date:'07.10.2026',title:'Сложение и вычитание дробей и смешанных чисел',skill:'общий знаменатель, сложение и вычитание смешанных чисел',page:'../../../lessons/6-math-vilenkin/02/12.html'},
'11a_l18':{grade:11,subject:'Алгебра',lesson:18,date:'08.10.2026',title:'Производная и промежутки монотонности',skill:'определение знака производной и промежутков возрастания и убывания',page:'../../../lessons/11-algebra-alimov/02/02.html'},
'9a_l18':{grade:9,subject:'Алгебра',lesson:18,date:'08.10.2026',title:'Итоговая диагностика: числа и вычисления',skill:'корни, приближения, проценты, тарифы, погрешности и практические вычисления',page:'../../../lessons/9-algebra-makarychev/01/18.html'}
};
const d=meta[item], bank=window.KTP_TOP10_54_BANKS?.[item];
const tasks=bank?.lines?.[line];
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mat=t=>esc(t).replace(/(?<![\w/])(\d{1,4})\/(\d{1,4})(?![\w/])/g,(_,n,den)=>'<span class="frac"><span class="num">'+n+'</span><span class="den">'+den+'</span></span>');
if(!d||!Array.isArray(tasks)||tasks.length!==54||tasks.some((t,i)=>t.n!==i+1||!t.text)){
 root.innerHTML='<p class="error">Набор упражнений отсутствует либо не прошёл проверку структуры.</p>';
 return;
}
if(tasks.some(t=>!['A','B','C','Контроль'].includes(t.level))){
 root.innerHTML='<p class="error">Некорректные уровни упражнений.</p>';return;
}
const isTeacher=audience==='teacher';
const audTitle=isTeacher?'Для преподавателя':'Для учащихся';
document.title=d.grade+' класс. Урок №'+d.lesson+'. 54 упражнения. '+d.title+'. '+audTitle;
const groups=[['A','Базовый уровень'],['B','Основной уровень'],['C','Повышенный уровень'],['Контроль','Проверка полного понимания']];
const blocks=groups.map(([lvl,title])=>{
 const entries=tasks.filter(t=>t.level===lvl);
 return '<section class="section"><div class="section-title"><h2>'+lvl+' · '+title+'</h2><small>'+entries.length+' заданий</small></div>'+
 '<ol start="'+(entries[0]?.n||1)+'">'+entries.map(t=>'<li><div class="task">'+mat(t.text)+'</div>'+
 (isTeacher?'<div class="answer"><strong>ОТВЕТ:</strong> '+mat(t.answer)+'</div><div class="solution"><strong>РЕШЕНИЕ:</strong> '+mat(t.solution)+'</div>':'')+'</li>').join('')+'</ol></section>';
}).join('');
root.innerHTML='<nav><a href="'+d.page+'#resources">← К уроку КТП</a><button id="print" type="button">Печать / сохранить PDF</button></nav>'+
'<header><div class="kicker">'+esc(d.subject)+' · '+d.grade+' класс · урок №'+d.lesson+'</div>'+
'<h1>54 упражнения для тотального закрепления</h1><h2>'+esc(d.title)+'</h2>'+
'<p class="sub">'+esc(line==='strong'?'Линия для сильных учеников':'Стандартная линия')+' · '+audTitle+' · '+esc(d.date)+'</p>'+
'<span class="pill">'+audTitle+'</span></header>'+
'<section class="intro"><p><b>Навык:</b> '+esc(d.skill)+'.</p>'+
(isTeacher?'<p><b>Методический маршрут:</b> A — диагностика базы; B — основная тренировка; C — перенос; «Контроль» — обобщение, анализ ошибок и проверка понимания. Используйте выборочные задания для самостоятельной работы; ключи и пояснения расположены после каждого упражнения.</p>':
'<p>Решайте задания последовательно. Записывайте ход решения и ответ. Отмечайте упражнения, которые потребовали повторения правила.</p>')+
'</section>'+blocks+
'<footer>Лёвин Артём Александрович · Синхронизировано с КТП 2026/27 · урок №'+d.lesson+' · Версия '+(isTeacher?'преподавателя':'учащегося')+'</footer>';
document.getElementById('print')?.addEventListener('click',()=>window.print());
})();