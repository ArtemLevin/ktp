(function(){
'use strict';
const S=window.KTP_LESSON_SERIES,defs=window.KTP_G11_REVIEW_DEFINITIONS,pool=window.KTP_G11_REVIEW_QUESTION_POOL;
const grading=max=>[{grade:5,min:Math.ceil(max*.85),max},{grade:4,min:Math.ceil(max*.65),max:Math.ceil(max*.85)-1},{grade:3,min:Math.ceil(max*.45),max:Math.ceil(max*.65)-1},{grade:2,min:0,max:Math.ceil(max*.45)-1}];
function work(mode,kind){if(mode==='diagnostic'){const count=kind==='independent'?7:10,maxScore=count*2;return {title:kind==='independent'?'Итоговая самостоятельная':'Итоговая диагностика',duration:kind==='independent'?'30–35 минут':'45 минут',maxScore,grading:grading(maxScore),purpose:'Выявить слабые домены и назначить адресную коррекцию.',variants:Array.from({length:6},(_,v)=>{const p=pool(mode,v+(kind==='independent'?17:23));return {id:v+1,tasks:p.slice(0,count).map(q=>({...q,points:2,criteria:['1 балл: метод или обоснование.','1 балл: верный результат или исправление.']}))};})};}const quick=kind==='independent',points=quick?[2,2,2,2,2]:[2,2,2,3,2,3],maxScore=quick?10:14;
 return {title:quick?'Самостоятельная работа':'Поурочный контроль',duration:quick?'12–15 минут':'20–25 минут',maxScore,grading:grading(maxScore),purpose:mode==='correction'?'Образцы для повторения; индивидуальную повторную проверку выполните по слабому домену в тренажёре.':'Проверить действие, условия формулы и самостоятельное исправление ошибки.',variants:Array.from({length:6},(_,v)=>{const p=pool(mode,v+(quick?1:7)),indices=quick?[0,1,2,3,4]:[0,1,2,5,4,7];return {id:v+1,tasks:indices.map((n,i)=>({...p[n],points:points[i],criteria:points[i]===3?['2 балла: метод и обоснование.','1 балл: верный результат.']:['1 балл: действие или обнаружение ошибки.','1 балл: результат или обоснованное исправление.']}))};})};
}
for(const [i,d] of defs.entries()){
 const p=pool(d.mode,1),globalNumber=57+i;
 S.lessons.push({id:String(i+1).padStart(2,'0'),number:i+1,globalNumber,week:29+Math.floor(i/2),mode:d.mode,title:d.title,
 prerequisites:['Результаты серий 01–05 и выбор метода по геометрической модели.','Чтение пространственного рисунка и проверка условий правила.'],
 objectives:['Применять правило: '+d.title.toLowerCase()+'.','Обосновывать ход решения и исправлять типичную ошибку.'],
 theory:d.theory.map((html,j)=>({title:['Основное правило','Применение и условия','Проверка и границы'][j],html,spatialFigure:j===0&&d.sceneType==='spatial'?d.scene:null,revolutionFigure:j===0&&d.sceneType==='revolution'?d.scene:null})),
 examples:[0,1,4].map((n,j)=>({title:['Полный разбор','Другая ситуация','Анализ ошибки'][j],problem:p[n].text,idea:'Определите объект и условия используемого правила.',solution:p[n].solution,answer:p[n].answerCore,check:i===0?[
  'Подстановка r=2 см, h=6 см: Sбок=2π·2·6=24π см². Это площадь боковой поверхности без оснований.',
  'Образующая: l=√(6²+8²)=10 см; Sбок=π·6·10=60π см². Высоту h нельзя подставлять вместо l.',
  'Для полной поверхности замкнутого цилиндра нужны два основания: Sполн=2πrh+2πr²; одно основание оставит площадь неполной.'
 ][j]:'Выполните обратную подстановку или проверьте геометрический инвариант.',audit:p[n].audit,auditOrigin:p[n].auditOrigin,skillId:p[n].skillId})),
 mistakes:[{title:d.mistake,explanation:p[4].answerCore},{title:'Объект не определён',explanation:'Укажите тело, рабочую плоскость и искомую величину.'},{title:'Ответ без условия',explanation:'Проверьте ненулевые направления, ортонормированность системы и тип геометрического объекта.'},{title:'Размер снят с рисунка',explanation:'Вычисляйте по модели; экранная проекция зависит от камеры.'}],
 practice:pool(d.mode,13).slice(0,8),homework:{required:pool(d.mode,14).slice(0,6),optional:pool(d.mode,15).slice(8,10)},
 independent:work(d.mode,'independent'),control:work(d.mode,'control'),summary:[...d.theory,'Объект → условия → формула → результат → проверка.'],
 resources:[{label:'Опорный модуль',format:'Web',title:'Вся тема',href:S.meta.topicHref},{label:'Исследование',format:'Web',title:'Диагностика и коррекция',href:'../../../labs/11-geometry-atanasyan/review-route/index.html'}],
 source:{textbook:'Л. С. Атанасян и др., Геометрия 10–11, редакция 2019.',section:d.point,assessment:'Повторение освоенных результатов 11 класса; движения остаются отдельным расширением KTP из серии 05.'},milestone:i===10?'Итоговая диагностика':i===11?'Коррекция и завершение курса':undefined});
}
})();
