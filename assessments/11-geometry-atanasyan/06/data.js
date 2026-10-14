(function(){
'use strict';
const pool=window.KTP_G11_REVIEW_QUESTION_POOL;
const independent=[['surface',5],['sections',0],['polyhedron',1],['round',3],['vectors',2],['metric',1],['proof',9]];
const control=[['surface',5],['sections',3],['polyhedron',3],['round',5],['composite',2],['vectors',2],['metric',3],['plane',1],['practical',0],['proof',9]];
const work=(matrix,maxScore,duration)=>({maxScore,duration,purpose:'Итоговый базовый результат: площади, сечения, объёмы, векторы, координатная метрика, планиметрия, условия и практические единицы.',variants:Array.from({length:6},(_,v)=>({id:v+1,tasks:matrix.map(([domain,n])=>{const q=pool(domain,v+1)[n];return {...q,domain,answer:q.answerCore,points:2,solution:q.solution+' Критерии: 1 балл — верный метод или обнаружение ошибки; 1 балл — результат или обоснованное исправление.'};})}))});
window.KTP_ASSESSMENT_DATA={meta:{rowId:'11-geometry-atanasyan',grade:11,subject:'Геометрия',book:'Атанасян · Бутузов · Кадомцев и др.',year:'2026/27',topic:'06',sourceNote:'Авторская итоговая интеграция серий 01–05: главы I–VII Атанасяна 2019 и ФРП-2025. Движения остаются отдельным расширением KTP; итоговые обязательные варианты проверяют базовую линию.'},topic:{title:'Резерв и повторение',source:'Итоговая диагностика 11 класса и маршрут адресной коррекции.',independent:work(independent,14,'30–35 минут'),control:work(control,20,'45 минут')}};
})();
