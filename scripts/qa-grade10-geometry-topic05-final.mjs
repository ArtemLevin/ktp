import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

let checks=0;
const assert=(condition,message)=>{checks++;if(!condition)throw new Error(message)};
const read=file=>fs.readFileSync(file,'utf8');
const first=text=>Number(String(text).match(/-?\d+(?:[.,]\d+)?/)?.[0].replace(',','.'));
const near=(a,b)=>Math.abs(a-b)<1e-8;
const compiled=(file,context)=>vm.runInContext(read(file),context,{filename:file});
const context=vm.createContext({window:{}});

for(const file of ['assessments/10-geometry-atanasyan/05/data.js','lessons/10-geometry-atanasyan/05/series.js','lessons/10-geometry-atanasyan/05/scenes.js','lessons/10-geometry-atanasyan/05/data.js','lessons/10-geometry-atanasyan/05/data-b.js'])
  new vm.Script(read(file),{filename:file});
compiled('assessments/10-geometry-atanasyan/05/data.js',context);
const A=context.window.KTP_ASSESSMENT_DATA;
assert(A.meta.rowId==='10-geometry-atanasyan'&&A.meta.topic==='05','assessment identity');
assert(A.topic.title==='Повторение','assessment title');
for(const word of ['Введение','глава I','глава II','глава III','пп. 74–76, 79–80','ФРП-2025','enrichment-only'])
  assert(A.meta.sourceNote.includes(word),'source boundary '+word);

const grids={
 independent:[['AXIOM','REL','COND','PROJ','SECTION','SURFACE','CHECK'],7,14],
 control:[['AXIOM','REL','COND','THREE_PERP',null,'SECTION','SURFACE','EULER',null,'MODEL'],10,20]
};
for(const [kind,[grid,count,max]] of Object.entries(grids)){
  const work=A.topic[kind];
  assert(work.maxScore===max&&work.variants.length===6,kind+' max and six variants');
  const signatures=new Set();
  for(const variant of work.variants){
    assert(variant.tasks.length===count,kind+' v'+variant.id+' count');
    assert(variant.tasks.reduce((sum,t)=>sum+t.points,0)===max,kind+' v'+variant.id+' score');
    assert(variant.tasks.every(t=>t.text&&t.answer&&t.solution&&t.skill),kind+' v'+variant.id+' complete key');
    grid.forEach((skill,i)=>skill&&assert(variant.tasks[i].skill.includes(skill),kind+' v'+variant.id+' slot '+(i+1)));
    signatures.add(JSON.stringify(variant.tasks.map(t=>[t.text,t.answer])));
    const t=variant.tasks;
    const metric=t[kind==='control'?4:3];
    if(kind==='independent'||variant.id%2){
      const m=metric.text.match(/SH=(\d+), HA=(\d+), SA=(\d+)/);
      assert(m&&Number(m[1])**2+Number(m[2])**2===Number(m[3])**2,'Pythagorean data '+kind+' v'+variant.id);
      assert(metric.answer.includes(m[1]+'/'+m[3]),'line-plane sine '+kind+' v'+variant.id);
    }else{
      const m=metric.text.match(/a=(\d+), высота (\d+)/);
      assert(m&&metric.skill==='DIHEDRAL','dihedral construction v'+variant.id);
      assert(near(Number(metric.answer.split('/')[0])/Number(metric.answer.split('/')[1]),2*Number(m[2])/Number(m[1])),'dihedral tangent v'+variant.id);
    }
    const section=t[kind==='control'?5:4];
    const sm=section.text.match(/(?:основания |основания )(\d+).*k=(\d+)\/(\d+)/);
    assert(sm&&near(first(section.answer),Number(sm[1])**2*(Number(sm[2])/Number(sm[3]))**2),'section area '+kind+' v'+variant.id);
    const surface=t[kind==='control'?6:5];
    const fm=surface.text.match(/a=(\d+),.*апофем[ау]\s*=?\s*(\d+)/);
    assert(fm&&first(surface.answer)===Number(fm[1])**2+2*Number(fm[1])*Number(fm[2]),'pyramid surface '+kind+' v'+variant.id);
    if(kind==='independent'){
      const k=Number(t[6].text.match(/k=(\d+)/)?.[1]);
      assert(k&&t[6].answer.includes('S₂/S₁='+k*k)&&t[6].answer.includes('V₂/V₁='+k**3),'similarity repair v'+variant.id);
      continue;
    }
    const h=Number(surface.text.match(/высота (\d+)/)?.[1]);
    const a=Number(fm[1]),l=Number(fm[2]);
    assert(near(l*l,h*h+(a/2)**2),'regular pyramid geometry v'+variant.id);
    assert(first(t[9].answer.match(/V=\(1\/3\)a²h=(\d+)/)?.[1])===a*a*h/3,'pyramid volume correction v'+variant.id);
    const em=t[7].text.match(/Ne=(\d+), Nf=(\d+)/),Nv=Number(t[7].answer.match(/Nv=(\d+)/)?.[1]);
    assert(em&&Nv-Number(em[1])+Number(em[2])===2,'Euler v'+variant.id);
    if(variant.id%2){
      const m=t[8].text.match(/Sосн=(\d+), высота (\d+), боковое ребро (\d+)/);
      assert(m&&first(t[8].answer)===Number(m[1])*Number(m[2])&&Number(m[3])>Number(m[2]),'oblique prism v'+variant.id);
    }else{
      const m=t[8].text.match(/k=(\d+) и объём меньшего (\d+)/);
      assert(m&&first(t[8].answer)===Number(m[2])*Number(m[1])**3,'similar volume v'+variant.id);
    }
  }
  assert(signatures.size===6,kind+' distinct variants');
}

for(const file of ['assessments/10-geometry-atanasyan/05/independent.html','assessments/10-geometry-atanasyan/05/control.html'])
  assert(read(file).includes('data.js')&&read(file).includes('assessment-page.js'),'assessment page wiring '+file);
const nav=read('assessments/topic-links.js');
assert(nav.includes("'10-geometry-atanasyan':{min:0,max:4}"),'all five assessment links');
assert(read('topics/10-geometry-atanasyan/05.html').includes('../../assessments/topic-links.js'),'topic assessment navigation');

for(let topic=1;topic<=5;topic++){
  const n=String(topic).padStart(2,'0');
  assert(fs.existsSync(`content/10-geometry-atanasyan/${n}.js`),'topic '+n+' content');
  assert(fs.existsSync(`assessments/10-geometry-atanasyan/${n}/data.js`),'topic '+n+' assessment');
  assert(fs.existsSync(`topics/10-geometry-atanasyan/${n}.html`),'topic '+n+' page');
}
let lessons=0;
for(const topic of fs.readdirSync('lessons/10-geometry-atanasyan').filter(name=>/^\d\d$/.test(name)))
  lessons+=fs.readdirSync(path.join('lessons/10-geometry-atanasyan',topic)).filter(name=>/^\d\d\.html$/.test(name)).length;
assert(lessons===68,'course contains 68 addressable lesson pages');
for(const [directory,pattern,count] of [['lessons',/^\d\d\.html$/,1143],['assessments',/^data\.js$/,83]]){
  const folders=fs.readdirSync(directory,{withFileTypes:true}).filter(x=>x.isDirectory());
  const actual=folders.reduce((sum,folder)=>sum+fs.readdirSync(path.join(directory,folder.name),{withFileTypes:true}).filter(x=>x.isDirectory()).reduce((acc,sub)=>acc+fs.readdirSync(path.join(directory,folder.name,sub.name)).filter(name=>pattern.test(name)).length,0),0);
  assert(actual===count,directory+' aggregate count '+actual);
}

console.log('Grade 10 Atanasyan topic 05 FINAL assessment/math/structure QA passed: '+checks+' checks.');
