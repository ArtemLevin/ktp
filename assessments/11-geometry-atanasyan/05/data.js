(function(){
'use strict';
const pool=window.KTP_G11_COORDINATE_QUESTION_POOL;
const independent=[['axes',1],['components',0],['endpoints',0],['length',0],['dot',0],['planeAngle',0],['planeDistance',4]];
const control=[['axes',1],['components',0],['endpoints',0],['endpoints',1],['length',0],['angle',1],['dot',1],['planeAngle',0],['planeDistance',0],['diagnostic',4]];
const work=(matrix,maxScore,duration)=>({maxScore,duration,purpose:'Координаты, метрические задачи, скалярное произведение, углы и расстояние. Расширение KTP проверяется отдельно в уроках 49, 54–55.',variants:Array.from({length:6},(_,v)=>({id:v+1,tasks:matrix.map(([mode,n])=>{const q=pool(mode,v+1)[n];return {...q,answer:q.answerCore,points:2,solution:q.solution+' Критерии: 1 балл — верное действие или обнаружение ошибки; 1 балл — результат или обоснованное исправление.'};})}))});
window.KTP_ASSESSMENT_DATA={meta:{rowId:'11-geometry-atanasyan',grade:11,subject:'Геометрия',book:'Атанасян · Бутузов · Кадомцев и др.',year:'2026/27',topic:'05',sourceNote:'Глава VII, пп.71–74, 76–78; п.79* как инструмент расстояния до плоскости по ФРП-2025. Сфера, движения и подобие — отдельное расширение KTP. Авторские задания.'},topic:{title:'Метод координат в пространстве',source:'Базовая тематическая проверка ФРП: координаты, углы, расстояние.',independent:work(independent,14,'30–35 минут'),control:work(control,20,'45 минут')}};
})();
