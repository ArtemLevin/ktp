(function(){
'use strict';
const S=window.KTP_LESSON_SERIES;if(!S)return;
const last=(S.lessons||[]).find(x=>x.globalNumber===60);if(last)last.milestone='Итог темы';
const orth=(S.lessons||[]).find(x=>x.globalNumber===58);
if(orth){
  for(const kind of ['independent','control']){
    for(const variant of orth[kind]?.variants||[]){
      const first=variant.tasks?.[0];if(!first)continue;
      const n=Number(variant.id||1);
      first.text=`В прямоугольном треугольнике ∠A=90°, AB=${3+n}, AC=${4+n}. Где находится ортоцентр?`;
      first.answer='В вершине A — вершине прямого угла.';
      first.skill='ортоцентр';
    }
  }
}
})();