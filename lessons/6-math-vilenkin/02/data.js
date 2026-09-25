(function(){'use strict';const S=window.KTP_LESSON_SERIES;if(!S||!window.KTP_G6_BUILD_SERIES)return;S.lessons=window.KTP_G6_BUILD_SERIES({start:19,source:"Часть 1 · §2 · п. 6–11",defs:[["Простые и составные числа","prime"],["Разложение на простые множители","factor"],["Наибольший общий делитель","gcd"],["Взаимно простые числа","gcd"],["Наименьшее общее кратное","lcm"],["Общий знаменатель дробей","frac"],["Сравнение дробей","frac"],["Сложение дробей с разными знаменателями","frac"],["Вычитание дробей с разными знаменателями","frac"],["Сложение смешанных чисел","mixed"],["Вычитание смешанных чисел","mixed"],["Комбинации сложения и вычитания","mixed"],["Текстовые задачи на дроби","frac"],["Дроби и координатная прямая","frac"],["Разность смешанных чисел","mixed"],["Сумма смешанных чисел","mixed"],["Рациональный выбор общего знаменателя","frac"],["Анализ ошибок в действиях с дробями","frac"],["Самостоятельная диагностика темы","review"],["Обобщение темы","review"]]});
const bindResource=(id,globalLesson,topicTitle)=>{
  const lesson=S.lessons.find(x=>String(x.id)===id);
  if(!lesson)return;
  const base='../../../materials/54-exercises.html?row=6-math-vilenkin&topic=02&lesson='+id+'&audience=';
  lesson.resources=[
    {kind:'printable',audience:'student',label:'Для учащихся',format:'Web · печать / PDF',title:'25.09. 6 класс. 54 упражнения для тотального закрепления. '+topicTitle+'. Для учащихся',href:base+'student'},
    {kind:'printable',audience:'teacher',label:'Для преподавателя',format:'Web · ответы · печать / PDF',title:'25.09. 6 класс. 54 упражнения для тотального закрепления. '+topicTitle+'. Для преподавателя',href:base+'teacher'}
  ];
  lesson.resourceMeta={rubric:'54 упражнения для тотального закрепления',publicationDate:'25.09.2026',globalLesson};
};
bindResource('01',19,'Простые и составные числа');
bindResource('02',20,'Разложение на простые множители');
})();