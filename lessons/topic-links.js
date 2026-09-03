(function(){
'use strict';
const body=document.body;
if(body.dataset.row!=='7-algebra-makarychev')return;
const configs={
  0:{count:18,weeks:'6 учебных недель',href:'../../lessons/7-algebra-makarychev/01/index.html'},
  1:{count:11,weeks:'4 учебные недели',href:'../../lessons/7-algebra-makarychev/02/index.html'},
  2:{count:12,weeks:'4 учебные недели',href:'../../lessons/7-algebra-makarychev/03/index.html'}
};
const cfg=configs[Number(body.dataset.topic)];
if(!cfg)return;
const side=document.querySelector('.side-stack');
if(!side)return;
const card=document.createElement('section');
card.className='card';
card.innerHTML=`<span class="kicker">Поурочная подготовка</span><h2>${cfg.count} последовательных уроков</h2><p>Тема разложена на ${cfg.weeks}. Для каждого урока доступны теория, примеры, тренировка, домашняя работа и проверочные варианты.</p><a class="cta" href="${cfg.href}">Открыть ${cfg.count} уроков →</a>`;
side.insertBefore(card,side.children[1]||null);
})();
