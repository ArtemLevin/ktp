(function(){
'use strict';
const D=window.KTP_G11_COORDINATE_DEFINITIONS,pool=window.KTP_G11_COORDINATE_QUESTION_POOL;
const task=(id,mode,index,variant=16)=>{const q=pool(mode,variant)[index];return {id,skill:q.skill,task:q.text,answer:q.answer,audit:q.audit};};
KTP_REGISTER_CONTENT('11-geometry-atanasyan::4',{
 meta:{title:'Метод координат в пространстве. Движения',chapter:'Глава VII, пп. 71–84* + ФРП-2025',status:'content-ready'},
 objectives:['Читать координаты точки и вектора в прямоугольной системе.','Находить середину, длину и расстояние.','Вычислять скалярное произведение и проверять ортогональность.','Различать углы векторов, прямых и плоскостей.','Находить расстояние до плоскости.','Отдельно исследовать сферу, движения и подобие как расширение KTP.'],
 expectedResults:D.map(d=>d.title+': применяет правило и проверяет условия.'),
 prerequisites:['Операции с векторами в пространстве.','Середина отрезка и направленные перемещения.','Теорема Пифагора.','Косинус и синус угла.','Перпендикулярность прямой и плоскости.'],
 prerequisiteCheck:[{id:'pre-1',skill:'Направление',task:'Как выразить AB через векторы OA и OB?',answer:'AB=OB−OA.'},{id:'pre-2',skill:'Середина',task:'J — середина AB. Выразите OJ.',answer:'OJ=½(OA+OB).'}, {id:'pre-3',skill:'Длина',task:'Может ли длина вектора быть отрицательной?',answer:'Нет.'},{id:'pre-4',skill:'Базис',task:'Достаточно ли некомпланарности для разложения вектора?',answer:'Да; для координатных метрических формул дополнительно нужна ортонормированность базиса.'},{id:'pre-5',skill:'Перпендикуляр',task:'Какой отрезок задаёт расстояние от точки до плоскости?',answer:'Перпендикуляр из точки на плоскость.'}],
 map:D.map((d,i)=>({title:'Урок '+(i+45)+'. '+d.title,description:d.extension?'Расширение KTP, отдельный поурочный контроль.':'Координатное ядро и проверка условий.'})),
 theory:D.map(d=>({title:d.title,html:d.theory.map(p=>'<p>'+p+'</p>').join('')+'<span data-spatial-scene="'+d.scene+'"></span>'})),
 examples:D.map((d,i)=>{const q=pool(d.mode,1)[0];return {id:'ex-'+(i+1),title:d.title,problem:q.text,idea:'Укажите геометрический объект и правило.',solution:q.solution,check:'Подставьте результат обратно и проверьте условия.',answer:q.answerCore,audit:q.audit};}),
 mistakes:D.map(d=>({title:d.mistake,explanation:pool(d.mode,1)[4].answerCore})),
 practice:{basic:['axes','components','endpoints','length','angle','dot'].map((m,i)=>task('a-'+i,m,0)),standard:['endpoints','length','dot','planeAngle','planeDistance','diagnostic'].map((m,i)=>task('b-'+i,m,1)),transfer:['endpoints','length','dot','planeAngle','planeDistance','diagnostic'].map((m,i)=>task('c-'+i,m,2)),challenge:['angle','dot','planeAngle','planeDistance','symmetry','transfer'].map((m,i)=>task('d-'+i,m,4))},
 diagnostic:D.map((d,i)=>task('diag-'+i,d.mode,4)),
 homework:{required:['endpoints','length','angle','dot','planeAngle','planeDistance'].map((m,i)=>task('hw-'+i,m,0,17)),optional:['symmetry','transfer'].map((m,i)=>task('extra-'+i,m,0,17))},
 summary:D.map(d=>d.theory[0]),spatialScenes:window.KTP_G11_COORDINATE_SCENES,
 lab:{enabled:true,planned:false,title:'Координатная лаборатория',href:'../../labs/11-geometry-atanasyan/coordinate-space/index.html',description:'Угол с плоскостью, расстояние и зеркальная симметрия: сравните формулу с моделью.'},
 assessments:{enabled:true,planned:false,title:'Базовая тематическая проверка',independentHref:'../../assessments/11-geometry-atanasyan/05/independent.html',controlHref:'../../assessments/11-geometry-atanasyan/05/control.html',description:'6×7 / 14 баллов и 6×10 / 20 баллов. Сфера, движения и подобие проверяются отдельно в поурочном расширении KTP.'},
 source:{textbook:'Л. С. Атанасян и др., Геометрия 10–11, редакция 2019; глава VII, пп.71–84*. ФРП-2025, базовый уровень.',chapter:'Координаты и скалярное произведение — базовое ядро; п.79* используется для требуемого ФРП расстояния.',assessment:'Сфера (75), движения (80–83) и подобие (84*) — адресное расширение KTP с отдельным поурочным контролем.',links:[{title:'Официальная ФРП-2025',href:'https://edsoo.ru/wp-content/uploads/2025/06/21_frp_matematika_10_11-klassy_baza_04062025_itog-na-sajt.pdf'}]}
});
})();
