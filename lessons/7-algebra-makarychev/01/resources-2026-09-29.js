(function(){
  'use strict';
  const lesson=window.KTP_LESSON_SERIES?.lessons?.find(item=>Number(item.number)===13);
  if(!lesson)return;
  const base='../../../materials/daily/2026-09-29_l13_axb/';
  lesson.resources=[...(lesson.resources||[]),
    {label:'10 заданий · стандарт · учащимся',format:'PDF',title:'Линейное уравнение ax=b: три случая числа корней',href:base+'standard_student.pdf'},
    {label:'10 заданий · стандарт · преподавателю',format:'PDF · ответы и решения',title:'Ключ к короткой тренировке',href:base+'standard_teacher.pdf'},
    {label:'10 заданий · для сильных · учащимся',format:'PDF',title:'Углублённая тренировка по той же теме',href:base+'strong_student.pdf'},
    {label:'10 заданий · для сильных · преподавателю',format:'PDF · ответы и решения',title:'Ключ к углублённой тренировке',href:base+'strong_teacher.pdf'},
    {label:'54 задания · стандарт · учащимся',format:'PDF',title:'Полный комплект: три случая уравнения ax=b',href:base+'standard_54_student.pdf'},
    {label:'54 задания · стандарт · преподавателю',format:'PDF · ответы и решения',title:'Ключ к полному стандартному комплекту',href:base+'standard_54_teacher.pdf'},
    {label:'54 задания · для сильных · учащимся',format:'PDF',title:'Полный углублённый комплект по той же теме',href:base+'strong_54_student.pdf'},
    {label:'54 задания · для сильных · преподавателю',format:'PDF · ответы и решения',title:'Ключ к полному углублённому комплекту',href:base+'strong_54_teacher.pdf'}
  ];
})();
