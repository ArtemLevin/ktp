(function(){
'use strict';
const body=document.body;
const configsByRow={
  '7-algebra-makarychev':{
    0:{count:18,weeks:'6 учебных недель',href:'../../lessons/7-algebra-makarychev/01/index.html'},
    1:{count:11,weeks:'4 учебные недели',href:'../../lessons/7-algebra-makarychev/02/index.html'},
    2:{count:12,weeks:'4 учебные недели',href:'../../lessons/7-algebra-makarychev/03/index.html'},
    3:{count:18,weeks:'6 учебных недель',href:'../../lessons/7-algebra-makarychev/04/index.html'},
    4:{count:18,weeks:'6 учебных недель',href:'../../lessons/7-algebra-makarychev/05/index.html'},
    5:{count:13,weeks:'5 учебных недель',href:'../../lessons/7-algebra-makarychev/06/index.html'},
    6:{count:12,weeks:'4 учебные недели',href:'../../lessons/7-algebra-makarychev/07/index.html'}
  },
  '8-algebra-makarychev':{
    0:{count:15,weeks:'5 учебных недель',href:'../../lessons/8-algebra-makarychev/01/index.html'},
    1:{count:15,weeks:'5 учебных недель',href:'../../lessons/8-algebra-makarychev/02/index.html'},
    2:{count:27,weeks:'9 учебных недель',href:'../../lessons/8-algebra-makarychev/03/index.html'},
    3:{count:12,weeks:'4 учебные недели',href:'../../lessons/8-algebra-makarychev/04/index.html'},
    4:{count:13,weeks:'5 учебных недель',href:'../../lessons/8-algebra-makarychev/05/index.html'},
    5:{count:8,weeks:'3 учебные недели',href:'../../lessons/8-algebra-makarychev/06/index.html'},
    6:{count:12,weeks:'4 учебные недели',href:'../../lessons/8-algebra-makarychev/07/index.html'}
  },
  '9-algebra-makarychev':{
    0:{count:18,weeks:'6 учебных недель',href:'../../lessons/9-algebra-makarychev/01/index.html'}
  },
  '11-algebra-alimov':{
    0:{count:16,weeks:'первые 16 уроков курса',href:'../../lessons/11-algebra-alimov/01/index.html'},
    1:{count:16,weeks:'уроки 17–32 курса',href:'../../lessons/11-algebra-alimov/02/index.html'},
    2:{count:13,weeks:'уроки 33–45 курса',href:'../../lessons/11-algebra-alimov/03/index.html'}
  }
};
const cfg=configsByRow[body.dataset.row]?.[Number(body.dataset.topic)];
if(!cfg)return;
const side=document.querySelector('.side-stack');
if(!side)return;
const card=document.createElement('section');
card.className='card';
card.innerHTML=`<span class="kicker">Поурочная подготовка</span><h2>${cfg.count} последовательных уроков</h2><p>Тема разложена на ${cfg.weeks}. Для каждого урока доступны теория, примеры, тренировка, домашняя работа и проверочные варианты.</p><a class="cta" href="${cfg.href}">Открыть ${cfg.count} уроков →</a>`;
side.insertBefore(card,side.children[1]||null);
})();