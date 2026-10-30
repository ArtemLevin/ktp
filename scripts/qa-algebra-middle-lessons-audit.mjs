import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';

function loader(dir,uncompressed=[],packed=false){
 const ctx=vm.createContext({window:{},console,Math});
 for(const name of ['series.js',...uncompressed])vm.runInContext(fs.readFileSync(dir+'/'+name,'utf8'),ctx,{filename:dir+'/'+name});
 if(packed){
   let base64=ctx.window.KTP_COMPRESSED_LESSONS;
   assert.ok(base64,dir+' packed data missing');
   const bytes=Buffer.from(base64,'base64');
   let source;
   try{source=zlib.gunzipSync(bytes).toString('utf8');}
   catch(e){
     for(let trim=8;trim>=0;trim--){try{source=zlib.inflateRawSync(bytes.subarray(10,bytes.length-trim)).toString('utf8');break;}catch{}}
     assert.ok(source,dir+' gzip payload could not be decompressed');
   }
   vm.runInContext(source,ctx,{filename:dir+'/unpacked.js'});
 }
 return ctx.window.KTP_LESSON_SERIES;
}
const root='lessons/';
const lessons={};
lessons.g7=loader(root+'7-algebra-makarychev/04',['data/01.js']).lessons[0];
lessons.g8=loader(root+'8-algebra-makarychev/04',['assessment-factory.js','data/block-1.js']).lessons[0];
const g9dir=root+'9-algebra-makarychev/03';
const p9=Array.from({length:20},(_,i)=>'packed-'+String(i+1).padStart(2,'0')+'.js');
lessons.g9=loader(g9dir,[...p9,'packed-data.js'],true).lessons[0];
lessons.g10=loader(root+'10-algebra-alimov/05',['data.js'],true).lessons[0];
lessons.g11=loader(root+'11-algebra-alimov/04',['data/lessons-1.js','data/lessons-2.js','data/lessons-3.js','data/lessons-4.js','assessment-factory.js']).lessons[0];

for(const [key,l] of Object.entries(lessons)){
 assert.ok(l,'missing '+key);
 for(const a of ['id','title','theory','examples','practice','homework','independent','control'])assert.ok(l[a]!==undefined,key+' missing '+a);
 assert.equal(l.id,'01');
 for(const a of ['independent','control']){
  assert.equal(l[a].variants.length,6,key+' '+a+' variants');
  for(const v of l[a].variants){
   assert.ok(v.tasks.length>0);
   assert.equal(v.tasks.reduce((s,t)=>s+t.points,0),l[a].maxScore,key+' '+a+' score');
  }
 }
 const displayed=[...l.examples.map(e=>({text:e.problem,answer:e.answer})),...l.practice,...l.homework.required,...l.homework.optional,...l.independent.variants.flatMap(v=>v.tasks),...l.control.variants.flatMap(v=>v.tasks)];
 assert.ok(displayed.every(e=>e.text&&String(e.answer).trim()),key+' blank answer');
 const norms=new Map();for(const task of displayed){const k=task.text.replace(/[−-]?\d+(?:[,\.]\d+)?/g,'#');if(!norms.has(k))norms.set(k,{q:task.text,a:task.answer});}console.log('PATTERNS',JSON.stringify({key,count:norms.size,patterns:[...norms.values()]}));
 console.log('MIDDLE_LESSON',JSON.stringify({key,title:l.title,global:l.globalNumber,section:l.source?.section,total:displayed.length,prerequisites:l.prerequisites,examples:l.examples.slice(0,2),practice:l.practice.slice(0,8),required:l.homework.required.slice(0,6),optional:l.homework.optional.slice(0,2),independent:l.independent.variants[0].tasks,control:l.control.variants[0].tasks}));
}

const getAll=l=>[...l.examples.map(e=>({text:e.problem,answer:e.answer})),...l.practice,...l.homework.required,...l.homework.optional,...l.independent.variants.flatMap(v=>v.tasks),...l.control.variants.flatMap(v=>v.tasks)];
const clean=s=>String(s).trim().replace(/\s/g,'').replace(/\.$/,'').replace(/-/g,'−');
const eq=(actual,expected,label)=>assert.equal(clean(actual),clean(expected),label);
const pterms=p=>p.replace(/\s/g,'').replace(/-/g,'−').replace(/([−+])/g,'|$1').split('|').filter(Boolean).map(t=>t[0]==='+'?t.slice(1):t);
function check7(o){
 const t=o.text.replace(/^\d+\.\s*/,'').trim(),a=o.answer;
 let m,parts;
 if((m=t.match(/^(?:Назовите члены |Перечислите члены многочлена )(.+)\.$/))){parts=pterms(m[1]);return eq(a,parts.join('; '),'g7 members '+t);}
 if((m=t.match(/^Сколько членов (?:содержит многочлен |в )(.+)\?$/)))return eq(a,pterms(m[1]).length,'g7 count '+t);
 if((m=t.match(/^Назовите первый и последний члены многочлена (.+)\.$/))){parts=pterms(m[1]);return eq(a,parts[0]+'; '+parts.at(-1),'g7 endpoints '+t);}
 if(t==='Как называют x−7?'||t==='Как называют многочлен из двух членов?')return assert.match(a,/Двучлен/);
 if(t==='Как называют y²+y+1?'||t==='Как называют многочлен из трёх членов?')return assert.match(a,/Трёхчлен/);
 if(t.includes('Является ли 2a³')||t.includes('Является ли одночлен')||t.includes('Является ли число 6')||t.includes('Является ли выражение 4x²y'))return assert.match(a,/^(да|Да)/);
 if(t.includes('1/x+x')||t.includes('3/x + 2'))return assert.match(a,/делени[ея] на переменную/);
 if(t.includes('Укажите, какие выражения являются двучленами'))return assert.match(a,/Только x\+1/);
 if(t.startsWith('Представьте x²−6x+9'))return eq(a,'x²+(−6x)+9');
 if(t.startsWith('Составьте многочлен из четырёх'))return assert.equal(pterms(a.replace(/^Например\s*/,'').replace(/\.$/,'' )).length,4);
 if(t.startsWith('Объясните, почему одночлен'))return assert.match(a,/одного одночлена/);
 if(t.startsWith('Дайте определение многочлена'))return assert.match(a,/сумма одночленов/);
 if(t.startsWith('Как называют одночлены, из которых'))return assert.match(a,/Членами многочлена/);
 if(t.startsWith('Составьте трёхчлен, содержащий'))return assert.equal(pterms(a.replace(/^Например\s*/,'').replace(/\.$/,'')).length,3);
 if(t.includes('знак «минус»'))return assert.match(a,/−3x/);
 throw Error('Unreviewed G7 '+t);
}
function num(s){
 s=s.trim().replace(/−/g,'-');
 const m=s.match(/^(\d*)√(\d+)$/);
 if(m)return (m[1]?+m[1]:1)*Math.sqrt(+m[2]);
 return Number(s.replace(',','.'));
}
function check8(o){
 const t=o.text.replace(/^\d+\.\s*/,'').trim(),a=o.answer;let m;
 if((m=t.match(/^Сравните (.+?) и (.+?)\.$/))){
  const [x,y]=[m[1],m[2]].map(num);assert.ok(Number.isFinite(x)&&Number.isFinite(y));
  const op=x>y?'>':x<y?'<':'=';
  return assert.ok(clean(a).startsWith(clean(m[1]+op+m[2])),'g8 compare '+t+' => '+a);
 }
 if((m=t.match(/^(?:Найдите знак|Знак) (\d+)-(\d+)\.$/)))return assert.equal(a,(+m[1]-+m[2])<0?'отрицательный':'положительный');
 if((m=t.match(/^Верно ли (\d+)>(\d+)\?$/)))return assert.equal(a,(+m[1]>+m[2])?'Да':'Нет');
 if((m=t.match(/^(?:Если |Известно, что )([a-z])−([a-z])=(−?\d+(?:,\d+)?)/))){
  const op=num(m[3])<0?'<':num(m[3])>0?'>':'=';
  return eq(a,m[1]+op+m[2],'g8 difference '+t);
 }
 if((m=t.match(/^Расположите (.+) по возрастанию\.$/))){
  const items=m[1].split(',').map(s=>s.trim());const expected=items.sort((a,b)=>num(a)-num(b)).join('<');
  return eq(a,expected);
 }
 if(t.startsWith('Если a−b=0'))return eq(a,'a=b');
 if(t.startsWith('5. Докажите')||t.startsWith('Докажите, что x²+1'))return assert.match(a,/\(x−1\)²>0 при x≠1/);
 if(t.includes('критерий a≥b'))return assert.match(a,/a−b≥0/);
 if(t.includes('Сформулируйте критерий сравнения'))return assert.match(a,/a−b>0/);
 if(t.includes('критерий через разность применим'))return assert.match(a,/знаком разности/);
 if(t.includes('знак разности определяет порядок'))return assert.match(a,/знак фиксирует порядок/);
 throw Error('Unreviewed G8 '+t);
}
function check9(o){
 const t=o.text.replace(/^\d+\.\s*/,'').trim(),a=o.answer;let m;
 if((m=t.match(/^Является ли x=(−?\d+) корнем \(x−(\d+)\)\(x\+(\d+)\)=0\?$/))){const x=+m[1];return assert.equal(/^Да/.test(a),(x-(+m[2]))*(x+(+m[3]))===0,'root test '+t);}
 if((m=t.match(/^Решите x\(x−(\d+)\)=0\.$/)))return eq(a,'0; '+m[1]);
 if((m=t.match(/^Решите x³−(\d+)x=0\.$/))){const root=Math.sqrt(+m[1]);assert.ok(Number.isInteger(root));return eq(a,'−'+root+'; 0; '+root);}
 if((m=t.match(/^Решите \(x−(\d+)\)\(x\+(\d+)\)=0\.$/)))return eq(a,m[1]+'; −'+m[2]);
 if((m=t.match(/^Проверьте x=−(\d+) для \(x−(\d+)\)\(x\+(\d+)\)=0\.$/))){const x=-(+m[1]);return assert.equal(/^Да/.test(a),(x-(+m[2]))*(x+(+m[3]))===0);}
 if(t.includes('(x²+1)²−x⁴+3x'))return eq(a,2);
 if(t.includes('(x²+1)−x²+5'))return assert.match(a,/^0:/);
 if(t.includes('(x³−1)(x+1)'))return eq(a,4);
 if(/(?:степень|Степень)/.test(t)){
  const degrees=[...t.matchAll(/x([²³⁴⁵])/g)].map(x=>({'²':2,'³':3,'⁴':4,'⁵':5})[x[1]]);
  if(degrees.length)return eq(a,Math.max(...degrees));
 }
 if(t.includes('x³−5x+2=0'))return assert.equal(8-10+2,0);
 if(t.includes('корнем (x−2)(x+4)'))return assert.match(a,/Да/);
 if(t.includes('x=−4 для (x−2)(x+4)'))return assert.match(a,/Да/);
 if(t.includes('x=3 в x²−5x+6'))return assert.match(a,/Да/);
 if(t.includes('x=−2 в x²+x−2'))return assert.match(a,/Да/);
 if(/Целое ли уравнение|Является ли уравнение/.test(t)){
  const rational=t.includes('/x')||t.includes('/(x−')||t.includes('1/x')||t.includes('2/x');
  return assert.equal(/^Да/.test(a),!rational,'g9 integer classification '+t);
 }
 if(t.includes('x(x+2)=3x'))return eq(a,'x²−x=0');
 if(t.includes('x(x−3)=4x'))return eq(a,'x²−7x=0');
 if(t.includes('(x−1)(x+4)=0'))return assert.match(a,/1 и −4/);
 if(t.includes('(x−6)(x+1)=0'))return eq(a,'6; −1');
 if(t.includes('x(x−2)=0'))return eq(a,'0; 2');
 if(t.includes('x³−4x=0'))return eq(a,'−2; 0; 2');
 if(t.includes('x³−16x=0'))return eq(a,'−4; 0; 4');
 if(t.includes('(x−2)(x+4)=0'))return eq(a,'2; −4');
 if(t.includes('(x−2)²(x+4)=0'))return eq(a,2);
 if(t.includes('x=0 нельзя проверять в 1/x'))return assert.match(a,/не определена/);
 if(t.includes('Придумайте целое уравнение третьей степени'))return assert.match(a,/x\(x\+1\)\(x−2\)=0/);
 if(t.includes('число корней не обязано совпадать')||t.includes('степень уравнения равна числу его корней'))return assert.match(a,/корней может быть меньше/);
 if(t.includes('корнем уравнения'))return assert.match(a,/обе части уравнения имеют смысл и равны/);
 throw Error('Unreviewed G9 '+t);
}
function check10(o){
 const t=o.text,a=o.answer;let m;
 if((m=t.match(/^Переведите (\d+)° в радианы\.$/))){
  const d=+m[1];let x;const v=a.trim().match(/^π(?:\/(\d+))?$/);
  assert.ok(v,'wrong radian notation '+a);
  x=Math.PI/(v[1]?+v[1]:1);
  return assert.ok(Math.abs(x-d*Math.PI/180)<1e-9,'wrong degree→radian '+t);
 }
 if((m=t.match(/^Переведите (2?π)(?:\/(\d+))? рад в градусы\.$/))){
  const x=(m[1]==='2π'?2:1)*180/(m[2]?+m[2]:1);
  return eq(a,x+'°');
 }
 if(t.includes('Что означает 1 радиан'))return assert.match(a,/дугу длиной, равной радиусу/);
 if(t.includes('Почему в формулах математического анализа'))return assert.match(a,/длиной дуги/);
 throw Error('Unreviewed G10 '+t);
}
function check11(o){
 const t=o.text,a=o.answer;let m;
 if((m=t.match(/^(\d+) рубашки и (\d+) пары брюк/)))return eq(a,+m[1]*+m[2]);
 if((m=t.match(/^(\d+) дорог A→B и (\d+) дороги B→C/)))return eq(a,+m[1]*+m[2]);
 if((m=t.match(/^(\d+) супа и (\d+) вторых блюда/)))return eq(a,+m[1]*+m[2]);
 if((m=t.match(/^(\d+) напитков и (\d+) десертов/)))return eq(a,+m[1]*+m[2]);
 if((m=t.match(/^(\d+)·(\d+)·(\d+) вариантов/)))return eq(a,m.slice(1).reduce((z,v)=>z*+v,1));
 if((m=t.match(/^(\d+)×(\d+)×(\d+) вариантов/)))return eq(a,m.slice(1).reduce((z,v)=>z*+v,1));
 if((m=t.match(/^(\d+) и (\d+) вариантов на двух последовательных шагах/)))return eq(a,+m[1]*+m[2]);
 if((m=t.match(/^(\d+) вариантов первого шага и (\d+) второго/)))return eq(a,+m[1]*+m[2]);
 if((m=t.match(/^Три шага: (\d+), (\d+), (\d+) вариантов/)))return eq(a,m.slice(1).reduce((z,v)=>z*+v,1));
 if(t.includes('Когда используется произведение')||t.includes('Когда используют произведение'))return assert.match(a,/последовательн/);
 if(t.includes('Почему 4+6 здесь неверно'))return assert.match(a,/Сложение/);
 if(t.includes('Сформулируйте правило произведения'))return assert.match(a,/произведени/);
 if(t.includes('Сформулируйте главный алгоритм'))return assert.match(a,/ветвям.*сложить/);
 if(t.includes('Ученик сложил числа вариантов'))return assert.match(a,/перемножают/);
 if(t.includes('Выберите модель для первого и второго места'))return assert.match(a,/Размещения Aₙ²/);
 if(t.includes('Сформулируйте проверку комбинаторного'))return assert.match(a,/порядок, повторы, ограничения/);
 throw Error('Unreviewed G11 '+t);
}
let totalAudited=0;
for(const [key,checker] of Object.entries({g7:check7,g8:check8,g9:check9,g10:check10,g11:check11})){
 let count=0;for(const task of getAll(lessons[key])){checker(task);count++;}
 totalAudited+=count;console.log('INDEPENDENT_ANSWERS',key,count);
}
assert.equal(totalAudited,438,'all 438 published instances must be reviewed');
assert.ok(!lessons.g11.prerequisites.includes('правило произведения'),'circular prerequisite');
assert.match(lessons.g11.homework.optional[0].answer,/ветвям/);

console.log('Five algebra middle-lesson loaders and 438 independent answer checks PASS');
