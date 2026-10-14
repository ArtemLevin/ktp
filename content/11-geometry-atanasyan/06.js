(function(){
'use strict';
const D=window.KTP_G11_REVIEW_DEFINITIONS,pool=window.KTP_G11_REVIEW_QUESTION_POOL;
const task=(id,mode,index,variant=16)=>{const q=pool(mode,variant)[index];return {id,skill:q.skill,task:q.text,answer:q.answer,answerCore:q.answerCore,solution:q.solution,audit:q.audit,auditOrigin:q.auditOrigin,skillId:q.skillId};};
KTP_REGISTER_CONTENT('11-geometry-atanasyan::5',{
 meta:{title:'Резерв и повторение',chapter:'Итоговая интеграция глав I–VII + ФРП-2025',status:'content-ready'},
 objectives:['Выбирать метод по геометрическому объекту и искомой величине.','Связывать пространственную задачу с плоским сечением или координатной моделью.','Вычислять площади и объёмы без двойного счёта.','Проверять условия теорем, размерность и разумность ответа.','Определять слабый домен и выполнять адресную коррекцию.'],
 expectedResults:D.map(d=>d.title+': применяет правило и проверяет условия.'),
 prerequisites:['Операции с векторами в пространстве.','Середина отрезка и направленные перемещения.','Теорема Пифагора.','Косинус и синус угла.','Перпендикулярность прямой и плоскости.'],
 prerequisiteCheck:[{id:'pre-1',skill:'Направление',task:'Как выразить AB через векторы OA и OB?',answer:'AB=OB−OA.'},{id:'pre-2',skill:'Середина',task:'J — середина AB. Выразите OJ.',answer:'OJ=½(OA+OB).'}, {id:'pre-3',skill:'Длина',task:'Может ли длина вектора быть отрицательной?',answer:'Нет.'},{id:'pre-4',skill:'Базис',task:'Достаточно ли некомпланарности для разложения вектора?',answer:'Да; для координатных метрических формул дополнительно нужна ортонормированность базиса.'},{id:'pre-5',skill:'Перпендикуляр',task:'Какой отрезок задаёт расстояние от точки до плоскости?',answer:'Перпендикуляр из точки на плоскость.'}],
 map:D.map((d,i)=>'Урок '+(i+57)+'. '+d.title+(d.extension?' · расширение KTP':'')),
 theory:D.map(d=>({title:d.title,html:d.theory.map(p=>'<p>'+p+'</p>').join('')+'<span data-'+(d.sceneType==='spatial'?'spatial':'revolution')+'-scene="'+d.scene+'"></span>'})),
 examples:D.map((d,i)=>{const q=pool(d.mode,1)[0];return {id:'ex-'+(i+1),title:d.title,problem:q.text,idea:'Укажите геометрический объект и правило.',solution:q.solution,check:'Подставьте результат обратно и проверьте условия.',answer:q.answerCore,audit:q.audit,auditOrigin:q.auditOrigin,skillId:q.skillId};}),
 mistakes:D.map(d=>({title:d.mistake,explanation:pool(d.mode,1)[4].answerCore})),
 practice:{basic:['surface','sections','polyhedron','round','vectors','plane'].map((m,i)=>task('a-'+i,m,0)),standard:['surface','sections','polyhedron','round','composite','metric'].map((m,i)=>task('b-'+i,m,1)),transfer:['composite','metric','vectors','plane','practical','round'].map((m,i)=>task('c-'+i,m,2)),challenge:['surface','sections','polyhedron','round','composite','proof'].map((m,i)=>task('d-'+i,m,4))},
 diagnostic:D.slice(0,10).map((d,i)=>task('diag-'+i,d.mode,4)),
 homework:{required:['surface','sections','polyhedron','round','vectors','metric'].map((m,i)=>task('hw-'+i,m,0,17)),optional:['proof','practical'].map((m,i)=>task('extra-'+i,m,0,17))},
 summary:D.map(d=>d.theory[0]),spatialScenes:window.KTP_G11_REVIEW_SCENES.spatial,revolutionScenes:window.KTP_G11_REVIEW_SCENES.revolution,
 lab:{enabled:true,planned:false,title:'Диагностика и адресная коррекция',href:'../../labs/11-geometry-atanasyan/review-route/index.html',description:'Десять доменов, ссылки на нужные уроки и две новые задачи после коррекции. Первичный и повторный результаты сохраняются отдельно.'},
 assessments:{enabled:true,planned:false,title:'Итоговая тематическая проверка',independentHref:'../../assessments/11-geometry-atanasyan/06/independent.html',controlHref:'../../assessments/11-geometry-atanasyan/06/control.html',description:'6×7 / 14 баллов и 6×10 / 20 баллов. Итоговая работа охватывает десять базовых доменов 11 класса.'},
 source:{textbook:'Л. С. Атанасян и др., Геометрия 10–11, редакция 2019; интеграция глав I–VII. ФРП-2025, повторение и систематизация.',paragraphs:['Поверхности и сечения: глава IV, 38–46; объёмы: глава V, 52–62*.','Векторы: глава VI, 63–70; координаты, углы и расстояние: глава VII, 71–79*.'],assessment:'Итоговые базовые работы интегрируют освоенное содержание. Движения и подобие как отдельное расширение KTP сохраняют собственный контроль серии 05.'}
});
})();
