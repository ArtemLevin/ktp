(function(){
'use strict';
const $=id=>document.getElementById(id);
const identity=$('identity'),aInput=$('a'),bInput=$('b'),aOut=$('ao'),bOut=$('bo');
const symbolic=$('symbolic'),numeric=$('numeric'),steps=$('steps'),geometry=$('geometry'),question=$('question'),hint=$('hint');
const fmt=n=>Number.isInteger(n)?String(n):String(Number(n.toFixed(4)));
const configs={
  sqsum:{
    symbolic:'(a + b)² = a² + 2ab + b²',
    calc:(a,b)=>[(a+b)**2,a*a+2*a*b+b*b],
    steps:(a,b)=>[
      ['1. Перепишите квадрат как произведение',`(a+b)²=(a+b)(a+b)`],
      ['2. Выполните четыре произведения',`a² + ab + ab + b²`],
      ['3. Приведите подобные',`a² + 2ab + b²`],
      ['4. Подставьте числа',`(${a}+${b})²=${a*a}+${2*a*b}+${b*b}`]
    ],
    question:'Почему средний член равен именно 2ab?',
    hint:'При умножении двух двучленов возникают два одинаковых произведения: a·b и b·a.',
    geometry:true
  },
  sqdiff:{
    symbolic:'(a − b)² = a² − 2ab + b²',
    calc:(a,b)=>[(a-b)**2,a*a-2*a*b+b*b],
    steps:(a,b)=>[
      ['1. Перепишите квадрат как произведение',`(a−b)²=(a−b)(a−b)`],
      ['2. Раскройте скобки',`a² − ab − ab + b²`],
      ['3. Приведите подобные',`a² − 2ab + b²`],
      ['4. Подставьте числа',`(${a}−${b})²=${a*a}−${2*a*b}+${b*b}`]
    ],
    question:'Почему последний член в квадрате разности положителен?',
    hint:'Он получается как (−b)·(−b)=b².',
    geometry:false
  },
  diffsq:{
    symbolic:'a² − b² = (a − b)(a + b)',
    calc:(a,b)=>[a*a-b*b,(a-b)*(a+b)],
    steps:(a,b)=>[
      ['1. Узнайте два квадрата',`a²−b²`],
      ['2. Запишите сопряжённые множители',`(a−b)(a+b)`],
      ['3. Проверьте раскрытием',`a²+ab−ab−b²=a²−b²`],
      ['4. Подставьте числа',`${a*a}−${b*b}=(${a}−${b})(${a}+${b})`]
    ],
    question:'Что происходит со средними произведениями при раскрытии сопряжённых скобок?',
    hint:'ab и −ab взаимно уничтожаются.',
    geometry:false
  },
  cubesum:{
    symbolic:'a³ + b³ = (a + b)(a² − ab + b²)',
    calc:(a,b)=>[a**3+b**3,(a+b)*(a*a-a*b+b*b)],
    steps:(a,b)=>[
      ['1. Узнайте сумму кубов',`a³+b³`],
      ['2. Первый множитель повторяет знак',`a+b`],
      ['3. Второй множитель',`a²−ab+b²`],
      ['4. Числовая проверка',`${a**3}+${b**3}=(${a}+${b})(${a*a}−${a*b}+${b*b})`]
    ],
    question:'Почему во втором множителе знак при ab противоположен знаку между кубами?',
    hint:'Именно этот знак обеспечивает сокращение смешанных членов при обратном умножении.',
    geometry:false
  },
  cubediff:{
    symbolic:'a³ − b³ = (a − b)(a² + ab + b²)',
    calc:(a,b)=>[a**3-b**3,(a-b)*(a*a+a*b+b*b)],
    steps:(a,b)=>[
      ['1. Узнайте разность кубов',`a³−b³`],
      ['2. Первый множитель повторяет знак',`a−b`],
      ['3. Второй множитель',`a²+ab+b²`],
      ['4. Числовая проверка',`${a**3}−${b**3}=(${a}−${b})(${a*a}+${a*b}+${b*b})`]
    ],
    question:'Чем второй множитель разности кубов отличается от второго множителя суммы кубов?',
    hint:'У разности кубов внутри квадратного трёхчлена стоит +ab; у суммы кубов — −ab.',
    geometry:false
  }
};
function render(){
  const a=Number(aInput.value),b=Number(bInput.value),cfg=configs[identity.value];
  aOut.value=a;bOut.value=b;
  symbolic.textContent=cfg.symbolic;
  const [left,right]=cfg.calc(a,b);
  numeric.textContent=`При a=${a}, b=${b}: левая часть = ${fmt(left)}, правая часть = ${fmt(right)}. ${left===right?'Равенство подтверждено.':'Проверьте вычисления.'}`;
  steps.className='steps';
  steps.innerHTML=cfg.steps(a,b).map(([title,text])=>`<div class="step"><strong>${title}</strong><span>${text}</span></div>`).join('');
  question.textContent=cfg.question;hint.textContent=cfg.hint;
  geometry.classList.toggle('hidden',!cfg.geometry);
  if(cfg.geometry){
    const total=a+b,pa=100*a/total,pb=100*b/total;
    $('area').style.gridTemplateColumns=`${pa}% ${pb}%`;
    $('area').style.gridTemplateRows=`${pa}% ${pb}%`;
    $('geoText').textContent=`Большой квадрат имеет сторону a+b=${total}. Его площадь разбивается на a²=${a*a}, два прямоугольника ab=${a*b} и b²=${b*b}.`;
  }
}
[identity,aInput,bInput].forEach(el=>el.addEventListener('input',render));
render();
})();
