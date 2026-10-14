import fs from 'node:fs';
import vm from 'node:vm';

let checks=0;
const check=(value,message)=>{checks++;if(!value)throw Error(message);};
const read=p=>fs.readFileSync(p,'utf8');
const plan=read('content/11-geometry-atanasyan/04-methodical-plan.md');
const ctx={window:{}};
vm.runInNewContext(read('js/data.js'),ctx);
const D=ctx.window.KTP_DATA,row=D.rows.find(r=>r.id==='11-geometry-atanasyan');
check(row?.grade===11&&row.subject==='Геометрия'&&row.book==='Атанасян','line identity');
check(row.topics[3].title==='Векторы в пространстве','topic identity');
check(row.bounds[3]===32&&row.bounds[4]===44,'12 lessons: bounds 32-44');
check(row.topics[2].title==='Объёмы тел вращения','previous topic');
check(row.topics[4].title==='Метод координат в пространстве. Движения','next topic');
const date=half=>{
  const d=new Date(D.dates[Math.floor(half/2)]+'T00:00:00Z');
  d.setUTCDate(d.getUTCDate()+(half%2?3:0));
  return d.toISOString().slice(0,10).split('-').reverse().join('.');
};
check(plan.includes(date(32)+'–'+date(43)),'period derived from KTP');
for(const token of ['`11-geometry-atanasyan`','`3` / `04` / 4 из 6','33–44','глава VI, §§1–3, пп. 63–70',
  '34 часа','24 урока','координатный метод','скалярное произведение','серии 05',
  '144 поурочных варианта / 792 оцениваемых задания','6+2',
  '6 вариантов × 7 заданий / 14 баллов','6 вариантов × 10 заданий / 20 баллов',
  '12 тематических вариантов / 102 задания','3/6, 32/68, 3/6','4/6, 44/68, 4/6',
  'Нулевой вектор не имеет определённого направления','сонаправлен с любым вектором',
  'OA − OB = BA','неколлинеарности','некомпланарных','единственно','почти вырожденная',
  'planning QA','browser/mobile/print/PDF','регрессии 01–03/геометрии 10'])
  check(plan.includes(token),'plan requirement '+token);
for(let p=63;p<=70;p++)check(new RegExp('\\| '+p+' \\|').test(plan),'source point '+p);
const ctxScenes={window:{}};
vm.runInNewContext(read('geometry/vector-math.js'),ctxScenes);
vm.runInNewContext(read('geometry/grade11-vector-scenes.js'),ctxScenes);
for(let lesson=33;lesson<=44;lesson++){
  check(new RegExp('\\| '+lesson+' \\|').test(plan),'lesson '+lesson+' planned');
  const ids=Object.keys(ctxScenes.window.KTP_G11_VECTOR_SCENES).filter(id=>ctxScenes.window.KTP_G11_VECTOR_SCENES[id].lesson===lesson);
  check(ids.length===1&&plan.includes('`'+ids[0]+'`'),'one scene mapped for '+lesson);
}
const lessonPlan=read('lessons/11-geometry-atanasyan/lesson-plan.md');
const section=lessonPlan.split('## 04 ·')[1]?.split('## 05 ·')[0];
for(let lesson=33;lesson<=44;lesson++)check(section?.includes(lesson+'. **'),'approved annual lesson '+lesson);
check(read('content/11-geometry-atanasyan/content-map.md').includes('| 04 «Векторы в пространстве» | 33–44 |'),'source-map row');
for(const p of ['README.md','Plan.md']){
  const text=read(p);
  check(text.includes('| `11-geometry-atanasyan` | **3/6** | **32/68** | **3/6** |'),'published metrics preserved '+p);
  check(text.includes('04-methodical-plan.md')&&text.includes('VECTOR_CONTRACT.md'),'new foundation documented '+p);
}
console.log(`Grade 11 geometry topic 04 planning QA passed: ${checks} checks.`);
