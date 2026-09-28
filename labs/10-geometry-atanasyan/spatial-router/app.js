(()=>{'use strict';
const q=id=>document.getElementById(id);
const ui={
  scenario:q('scenario'),yaw:q('yaw'),pitch:q('pitch'),yawOut:q('yawOut'),pitchOut:q('pitchOut'),
  workingPlane:q('workingPlane'),resetCamera:q('resetCamera'),drawing:q('drawing'),title:q('title'),
  truth:q('truth'),signal:q('signal'),methods:q('methods'),feedback:q('feedback'),firstStep:q('firstStep'),
  firstText:q('firstText'),trap:q('trap'),controlPrompt:q('controlPrompt'),controlOptions:q('controlOptions'),
  controlFeedback:q('controlFeedback'),attempts:q('attempts'),firstCorrect:q('firstCorrect'),
  accuracy:q('accuracy'),errorCodes:q('errorCodes'),repeatList:q('repeatList'),resetProgress:q('resetProgress')
};
const KEY='ktp-spatial-router-v1';
const DEG=Math.PI/180;
const E=(a,b,cls='edge')=>({a,b,cls});
const F=(pts,work=false)=>({pts,work});

const boxPoints=(x0=-1.2,y0=-.8,z0=0,sx=2.4,sy=1.6,sz=1.8)=>({
  A:[x0,y0,z0],B:[x0+sx,y0,z0],C:[x0+sx,y0+sy,z0],D:[x0,y0+sy,z0],
  A1:[x0,y0,z0+sz],B1:[x0+sx,y0,z0+sz],C1:[x0+sx,y0+sy,z0+sz],D1:[x0,y0+sy,z0+sz]
});
const boxEdges=[
  E('A','B'),E('B','C'),E('C','D','hidden-edge'),E('D','A','hidden-edge'),
  E('A1','B1'),E('B1','C1'),E('C1','D1'),E('D1','A1'),
  E('A','A1'),E('B','B1'),E('C','C1'),E('D','D1','hidden-edge')
];

const scenarios={
  lines:{
    title:'Прямые в пространстве',signal:'Две прямые не параллельны и не имеют общей точки; нужно решить, компланарны ли они.',
    truth:'AB и CC₁ — скрещивающиеся',
    geometry:{points:{A:[-1.6,-1,0],B:[1.6,-1,0],C:[0,1,0],C1:[0,1,2]},edges:[E('A','B','emphasis'),E('C','C1','emphasis')],faces:[],labels:['A','B','C','C1']},
    methods:['Проверить общую плоскость и общую точку','Сравнить экранные наклоны','Измерить кратчайшее расстояние на SVG','Считать непересекающиеся прямые параллельными'],
    correct:0,first:'Проверить компланарность: параллельные и пересекающиеся прямые лежат в одной плоскости, скрещивающиеся — нет.',
    trap:'Плоская проекция может показывать ложное пересечение или ложную параллельность.',code:'REL',
    control:{prompt:'Если две прямые не лежат в одной плоскости, как они называются?',options:['Параллельные','Скрещивающиеся','Перпендикулярные'],correct:1}
  },
  linePlane:{
    title:'Прямая и плоскость',signal:'Прямая a не лежит в α и параллельна прямой b, лежащей в α.',
    truth:'a ∥ α',
    geometry:{points:{P:[-1.8,-1.2,0],Q:[1.8,-1.2,0],R:[1.8,1.2,0],T:[-1.8,1.2,0],A:[-1.3,0,1.4],B:[1.3,0,1.4],X:[-1.3,.55,0],Y:[1.3,.55,0]},edges:[E('A','B','emphasis'),E('X','Y','emphasis')],faces:[F(['P','Q','R','T'],true)],labels:['A','B']},
    methods:['Признак параллельности прямой и плоскости','Признак перпендикулярности прямой и плоскости','Теорема о трёх перпендикулярах','Формула объёма призмы'],
    correct:0,first:'Указать b⊂α, a∥b и отдельно проверить, что a не лежит в α.',
    trap:'Одного сходства направления на рисунке недостаточно.',code:'COND',
    control:{prompt:'Какое дополнительное условие кроме a∥b, b⊂α нужно для вывода a∥α?',options:['a не лежит в α','a⊥b','b⊥α'],correct:0}
  },
  perpPlane:{
    title:'Перпендикулярность прямой и плоскости',signal:'SH перпендикулярна двум пересекающимся прямым XY и UV плоскости α.',
    truth:'SH ⟂ α',
    geometry:{points:{X:[-1.6,0,0],Y:[1.6,0,0],U:[0,-1.2,0],V:[0,1.2,0],H:[0,0,0],S:[0,0,2.1]},edges:[E('X','Y'),E('U','V'),E('H','S','emphasis')],faces:[F(['X','V','Y','U'],true)],labels:['H','S']},
    methods:['Признак перпендикулярности прямой и плоскости','Признак параллельности плоскостей','Теорема косинусов','Соотношение Эйлера'],
    correct:0,first:'Проверить, что XY и UV действительно лежат в α и пересекаются, после чего применить признак.',
    trap:'Перпендикулярности только одной прямой плоскости недостаточно.',code:'COND',
    control:{prompt:'Сколько пересекающихся прямых плоскости достаточно проверить по признаку?',options:['Одну','Две','Три'],correct:1}
  },
  distance:{
    title:'Расстояние от точки до плоскости',signal:'Из S опущен перпендикуляр SH к α; также дана наклонная SA.',
    truth:'d(S,α)=SH',
    geometry:{points:{P:[-1.6,-1,0],Q:[1.6,-1,0],R:[1.6,1,0],T:[-1.6,1,0],H:[0,0,0],S:[0,0,2],A:[1.45,.2,0]},edges:[E('S','H','emphasis'),E('S','A'),E('H','A','hidden-edge')],faces:[F(['P','Q','R','T'],true)],labels:['S','H','A']},
    methods:['Взять длину перпендикуляра SH','Взять длину наклонной SA','Измерить вертикаль на экране','Найти площадь проекции'],
    correct:0,first:'Назвать определение: расстояние от точки до плоскости равно длине перпендикуляра к плоскости.',
    trap:'Наклонная длиннее перпендикуляра и не является расстоянием.',code:'METRIC',
    control:{prompt:'Если SH=6, SA=10, чему равно расстояние от S до α?',options:['10','8','6'],correct:2}
  },
  threePerp:{
    title:'Теорема о трёх перпендикулярах',signal:'SH⊥α, HA — проекция SA, а прямая l⊂α проходит через A и l⊥HA.',
    truth:'l ⟂ SA',
    geometry:{points:{P:[-1.7,-1.2,0],Q:[1.7,-1.2,0],R:[1.7,1.2,0],T:[-1.7,1.2,0],H:[0,0,0],A:[1.25,0,0],S:[0,0,1.9],L1:[1.25,-1,0],L2:[1.25,1,0]},edges:[E('S','H'),E('S','A','emphasis'),E('H','A','emphasis'),E('L1','L2','emphasis')],faces:[F(['P','Q','R','T'],true)],labels:['S','H','A']},
    methods:['Теорема о трёх перпендикулярах','Признак параллельности плоскостей','Соотношение Эйлера','Формула площади боковой поверхности'],
    correct:0,first:'Установить, что HA — ортогональная проекция SA на α; затем перенести перпендикулярность l⊥HA на l⊥SA.',
    trap:'Теорема требует корректно определённой проекции наклонной.',code:'PROJ',
    control:{prompt:'Какая прямая в α является проекцией наклонной SA?',options:['SH','HA','l'],correct:1}
  },
  linePlaneAngle:{
    title:'Угол прямой с плоскостью',signal:'SA — наклонная к α, SH⊥α, HA — её ортогональная проекция.',
    truth:'φ=∠SAH',
    geometry:{points:{P:[-1.6,-1,0],Q:[1.6,-1,0],R:[1.6,1,0],T:[-1.6,1,0],H:[0,0,0],S:[0,0,1.5],A:[1.6,0,0]},edges:[E('S','H'),E('S','A','emphasis'),E('H','A','emphasis')],faces:[F(['P','Q','R','T'],true)],labels:['S','H','A']},
    methods:['Взять угол между SA и HA','Взять угол между SA и SH','Измерить экранный наклон SA','Взять любой угол в плоскости α'],
    correct:0,first:'Построить ортогональную проекцию HA и перейти к прямоугольному треугольнику SHA.',
    trap:'Угол с плоскостью определяется через ортогональную проекцию, а не через перпендикуляр SH.',code:'PROJ',
    control:{prompt:'SH=6, HA=8, SA=10. Чему равен sin φ?',options:['3/5','4/5','3/4'],correct:0}
  },
  dihedral:{
    title:'Двугранный угол',signal:'Две грани имеют общее ребро e. Нужно получить истинный линейный угол.',
    truth:'∠AOB — линейный угол',
    geometry:{points:{E1:[0,-1.5,0],E2:[0,1.5,0],O:[0,0,0],A:[1.5,0,0],A2:[1.5,1.5,0],B:[0,0,1.5],B2:[0,1.5,1.5]},edges:[E('E1','E2','emphasis'),E('O','A','emphasis'),E('O','B','emphasis')],faces:[F(['O','A','A2','E2'],true),F(['O','B','B2','E2'],true)],labels:['O','A','B']},
    methods:['Провести в обеих гранях лучи ⟂ общему ребру','Измерить угол между любыми рёбрами граней','Найти диагональ одной грани','Использовать объём пирамиды'],
    correct:0,first:'Из одной точки O общего ребра провести OA и OB в разных гранях так, чтобы оба луча были перпендикулярны ребру.',
    trap:'Произвольный угол между линиями двух граней не является линейным углом двугранного угла.',code:'PLANE',
    control:{prompt:'Какое условие обязательно для обоих лучей линейного угла?',options:['Они параллельны ребру','Они перпендикулярны ребру','Они равны по длине'],correct:1}
  },
  section:{
    title:'Сечение многогранника',signal:'Секущая плоскость пересекает четыре боковых ребра параллелепипеда.',
    truth:'MNPQ — плоское замкнутое сечение',
    geometry:(()=>{const p=boxPoints();return{points:{...p,M:[-1.2,-.8,.55],N:[1.2,-.8,.85],P:[1.2,.8,1.15],Q:[-1.2,.8,.85]},edges:[...boxEdges,E('M','N','emphasis'),E('N','P','emphasis'),E('P','Q','emphasis'),E('Q','M','emphasis')],faces:[F(['M','N','P','Q'],true)],labels:['M','N','P','Q']};})(),
    methods:['Строить след плоскости последовательно по граням','Соединить все видимые точки по экранному расстоянию','Измерить стороны в пикселях','Сначала применить формулу объёма'],
    correct:0,first:'Найти грань с двумя известными точками, построить след в ней и продолжать через соседние грани до замыкания.',
    trap:'Близость точек на проекции не доказывает, что они лежат в одной грани.',code:'SECTION',
    control:{prompt:'Какая проверка завершает построение?',options:['Все стороны одинаковы','Каждая сторона лежит в грани и многоугольник замкнут','Сечение выглядит симметрично'],correct:1}
  },
  surfaceVolume:{
    title:'Поверхность или объём',signal:'Правильная квадратная пирамида: a=6, h=4, апофема l=5. Требуется объём.',
    truth:'V=48',
    geometry:{points:{A:[-1.5,-1.5,0],B:[1.5,-1.5,0],C:[1.5,1.5,0],D:[-1.5,1.5,0],O:[0,0,0],M:[0,-1.5,0],S:[0,0,2]},edges:[E('S','A'),E('S','B'),E('S','C'),E('S','D'),E('S','O','emphasis'),E('S','M','hidden-edge'),E('A','B'),E('B','C'),E('C','D','hidden-edge'),E('D','A','hidden-edge')],faces:[F(['A','B','C','D'],true)],labels:['S','O','M']},
    methods:['Использовать Sосн и пространственную высоту h','Использовать периметр и апофему l','Сложить площади всех граней','Измерить высоту рисунка'],
    correct:0,first:'Назвать искомую величину объёмом: Sосн=6²=36, затем V=1/3·Sосн·h.',
    trap:'Апофема нужна для боковой поверхности, пространственная высота — для объёма.',code:'VOLUME',
    control:{prompt:'Чему равен объём при a=6 и h=4?',options:['48','60','96'],correct:0}
  },
  similar:{
    title:'Подобные многогранники',signal:'Все линейные размеры второго тела в 1,5 раза больше.',
    truth:'k=1,5; S₂/S₁=2,25; V₂/V₁=3,375',
    geometry:(()=>{const s=boxPoints(-2.4,-.45,0,1.2,.8,.9),l=boxPoints(.2,-.75,0,1.8,1.2,1.35);const rename=(obj,prefix)=>Object.fromEntries(Object.entries(obj).map(([k,v])=>[prefix+k,v]));const ps=rename(s,'s'),pl=rename(l,'l');const es=boxEdges.map(e=>E('s'+e.a,'s'+e.b,e.cls));const el=boxEdges.map(e=>E('l'+e.a,'l'+e.b,e.cls));return{points:{...ps,...pl},edges:[...es,...el],faces:[],labels:[]};})(),
    methods:['Разделить величины по размерности: k, k², k³','Умножить все величины на k','Возвести k в квадрат для объёма','Сравнить размеры на экране'],
    correct:0,first:'Сначала назвать размерность искомой величины: длина → k, площадь → k², объём → k³.',
    trap:'Один и тот же коэффициент нельзя применять к длинам, площадям и объёмам одинаково.',code:'METRIC',
    control:{prompt:'При k=1,5 во сколько раз изменится объём?',options:['1,5','2,25','3,375'],correct:2}
  }
};

function loadState(){
  try{
    const raw=JSON.parse(sessionStorage.getItem(KEY)||'{}');
    return{attempts:Number(raw.attempts)||0,firstCorrect:Number(raw.firstCorrect)||0,errors:raw.errors||{},repeat:Array.isArray(raw.repeat)?raw.repeat:[]};
  }catch{return{attempts:0,firstCorrect:0,errors:{},repeat:[]};}
}
let stats=loadState();
let roundTried=false;

function save(){
  try{sessionStorage.setItem(KEY,JSON.stringify(stats));}catch{}
}
function addError(code,key){
  stats.errors[code]=(stats.errors[code]||0)+1;
  if(!stats.repeat.includes(key))stats.repeat.push(key);
  save();renderStats();
}
function renderStats(){
  ui.attempts.textContent=String(stats.attempts);
  ui.firstCorrect.textContent=String(stats.firstCorrect);
  ui.accuracy.textContent=stats.attempts?Math.round(stats.firstCorrect/stats.attempts*100)+'%':'—';
  const codes=Object.entries(stats.errors).sort((a,b)=>b[1]-a[1]);
  ui.errorCodes.textContent=codes.length?codes.map(([k,v])=>k+' ×'+v).join(', '):'Пока нет.';
  ui.repeatList.textContent=stats.repeat.length?stats.repeat.map(k=>scenarios[k]?.title||k).join('; '):'Пока нет.';
}

function pointCenter(points){
  const vals=Object.values(points),mins=[Infinity,Infinity,Infinity],maxs=[-Infinity,-Infinity,-Infinity];
  vals.forEach(p=>p.forEach((x,i)=>{mins[i]=Math.min(mins[i],x);maxs[i]=Math.max(maxs[i],x);}));
  return mins.map((x,i)=>(x+maxs[i])/2);
}
function project(p,center){
  const d=p.map((x,i)=>x-center[i]);
  const yaw=Number(ui.yaw.value)*DEG,pitch=Number(ui.pitch.value)*DEG;
  const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  const x1=d[0]*cy-d[1]*sy,y1=d[0]*sy+d[1]*cy,z1=d[2];
  const y2=y1*cp-z1*sp,depth=y1*sp+z1*cp;
  return{x:360+82*x1,y:220-82*y2,depth};
}
function svgEl(name,attrs={}){
  const el=document.createElementNS('http://www.w3.org/2000/svg',name);
  Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));
  return el;
}
function renderGeometry(sc){
  ui.drawing.replaceChildren();
  const g=sc.geometry,center=pointCenter(g.points),pp=Object.fromEntries(Object.entries(g.points).map(([k,p])=>[k,project(p,center)]));
  (g.faces||[]).forEach(face=>{
    if(face.work&&!ui.workingPlane.checked)return;
    const poly=svgEl('polygon',{points:face.pts.map(k=>pp[k].x+','+pp[k].y).join(' '),class:face.work?'work-face':'face'});
    ui.drawing.append(poly);
  });
  (g.edges||[]).slice().sort((e1,e2)=>(pp[e1.a].depth+pp[e1.b].depth)-(pp[e2.a].depth+pp[e2.b].depth)).forEach(e=>{
    ui.drawing.append(svgEl('line',{x1:pp[e.a].x,y1:pp[e.a].y,x2:pp[e.b].x,y2:pp[e.b].y,class:e.cls||'edge'}));
  });
  (g.labels||[]).forEach(k=>{
    const p=pp[k];ui.drawing.append(svgEl('circle',{cx:p.x,cy:p.y,r:3.5,class:'point'}));
    const t=svgEl('text',{x:p.x+7,y:p.y-7,class:'label'});t.textContent=k.replace('1','₁');ui.drawing.append(t);
  });
}

function renderScenario(){
  const key=ui.scenario.value,sc=scenarios[key];
  roundTried=false;
  ui.title.textContent=sc.title;ui.truth.textContent=sc.truth;ui.signal.textContent=sc.signal;
  ui.feedback.className='feedback';ui.feedback.textContent='Сначала выберите метод.';
  ui.firstStep.hidden=true;ui.firstText.textContent='';ui.trap.textContent='';
  ui.controlPrompt.textContent=sc.control.prompt;ui.controlFeedback.className='feedback';ui.controlFeedback.textContent='Контроль откроется после выбора метода.';
  ui.methods.replaceChildren();ui.controlOptions.replaceChildren();
  sc.methods.forEach((label,i)=>{
    const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.method=String(i);
    b.addEventListener('click',()=>chooseMethod(key,i,b));ui.methods.append(b);
  });
  sc.control.options.forEach((label,i)=>{
    const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.control=String(i);b.disabled=true;
    b.addEventListener('click',()=>chooseControl(key,i,b));ui.controlOptions.append(b);
  });
  renderGeometry(sc);
}
function chooseMethod(key,i,button){
  const sc=scenarios[key],firstTry=!roundTried;
  roundTried=true;stats.attempts++;
  [...ui.methods.children].forEach(b=>b.classList.remove('correct','wrong'));
  if(i===sc.correct){
    button.classList.add('correct');ui.feedback.className='feedback ok';ui.feedback.textContent='Метод выбран корректно.';
    if(firstTry)stats.firstCorrect++;
  }else{
    button.classList.add('wrong');ui.feedback.className='feedback bad';ui.feedback.textContent='Метод не соответствует главному сигналу конфигурации.';
    addError(sc.code,key);
  }
  ui.firstStep.hidden=false;ui.firstText.textContent=sc.first;ui.trap.textContent=sc.trap;
  [...ui.controlOptions.children].forEach(b=>b.disabled=false);
  save();renderStats();
}
function chooseControl(key,i,button){
  const sc=scenarios[key];
  [...ui.controlOptions.children].forEach(b=>b.classList.remove('correct','wrong'));
  if(i===sc.control.correct){
    button.classList.add('correct');ui.controlFeedback.className='feedback ok';ui.controlFeedback.textContent='Контроль пройден.';
  }else{
    button.classList.add('wrong');ui.controlFeedback.className='feedback bad';ui.controlFeedback.textContent='Проверьте определение, условие теоремы или размерность.';
    addError('CHECK',key);
  }
}
function renderCamera(){
  ui.yawOut.value=ui.yaw.value+'°';ui.pitchOut.value=ui.pitch.value+'°';
  renderGeometry(scenarios[ui.scenario.value]);
}

ui.scenario.addEventListener('change',renderScenario);
ui.yaw.addEventListener('input',renderCamera);
ui.pitch.addEventListener('input',renderCamera);
ui.workingPlane.addEventListener('change',renderCamera);
ui.resetCamera.addEventListener('click',()=>{ui.yaw.value=-35;ui.pitch.value=25;renderCamera();ui.yaw.focus();});
ui.resetProgress.addEventListener('click',()=>{stats={attempts:0,firstCorrect:0,errors:{},repeat:[]};save();renderStats();ui.resetProgress.blur();});

renderStats();renderCamera();renderScenario();
})();