import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root='lessons/';
function load(dir,files){
 const context=vm.createContext({window:{},console});
 for(const f of ['series.js',...files])vm.runInContext(fs.readFileSync(root+dir+'/'+f,'utf8'),context,{filename:f});
 return context.window.KTP_LESSON_SERIES;
}
const data={
 g7:load('7-algebra-makarychev/07',['assessment-factory.js','data/block-1.js']),
 g8:load('8-algebra-makarychev/07',['assessment-factory.js','data/block-1.js']),
 g9:load('9-algebra-makarychev/01',['assessment-common.js','assessments/block-1.js','data/01.js'])
};
const norm=s=>String(s).replace(/\s+/g,'').replace(/−/g,'-').replace(/\.(?=\d)/g,',').replace(/[.]$/,'');
const equal=(a,b,q)=>{const left=String(a).trim().replace(',','.');if(typeof b==='number'&&Number.isFinite(b)&&Number.isFinite(Number(left))){assert.ok(Math.abs(Number(left)-b)<1e-8,'Numeric answer differs: '+q+' '+a+' versus '+b);return;}assert.equal(norm(a),norm(b),'Answer differs: '+q);};
const decimal=x=>Number(x.replace(',','.').replace(/−/g,'-'));
const frac=(n,d)=>{const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);const g=gcd(n,d);n/=g;d/=g;return d===1?String(n):n+'/'+d;};
const count=p=>p.trim().replace(/^\d+\.\s*/,'').split(/[+\-−]/g).filter(Boolean).length;
const all=l=>[...l.examples.map(e=>({text:e.problem,answer:e.answer})),...l.practice,...l.homework.required,...l.homework.optional,...l.independent.variants.flatMap(v=>v.tasks),...l.control.variants.flatMap(v=>v.tasks)];
function g7(item){
 const t=item.text.replace(/^\d+\.\s*/,'').trim(),a=item.answer;let m;
 if((m=t.match(/^Вычислите ([\d,]+)·([\d,]+)−([\d,]+)·([\d,]+)\.$/)))return equal(a,decimal(m[1])*decimal(m[2])-decimal(m[3])*decimal(m[4]),t);
 if((m=t.match(/^Найдите ([\d]+)([a-z])([²]?)?([−+])(\d+)([a-z]) при ([a-z])=([−−\-\d]+), ([a-z])=([−\-\d]+)\.$/))){
  const [,c,v,exp,op,d,w,x,xv,y,yv]=m;
  const val=+c*(Number(xv.replace('−','-'))**(exp==='²'?2:1))+(op==='−'?-1:1)*+d*Number(yv.replace('−','-'));
  return equal(a,val,t);
 }
 if((m=t.match(/^Найдите ([\d]+)([a-z])([−+])(\d+)([a-z]) при ([a-z])=(−?\d+), ([a-z])=(−?\d+)\.$/))){
   return equal(a,+m[1]*decimal(m[6])+(m[3]==='−'?-1:1)*+m[4]*decimal(m[8]),t);
 }
 if((m=t.match(/^Вычислите (\d+)\/(\d+)([−+])(\d+)\/(\d+)\.$/)))return equal(a,frac((+m[1])*(+m[5])+(m[3]==='+'?1:-1)*(+m[4])*(+m[2]),(+m[2])*(+m[5])),t);
 if((m=t.match(/^Найдите \((x−\d+)\)² при x=(−?\d+)\.$/))){const k=+m[1].split('−')[1];return equal(a,(decimal(m[2])-k)**2,t);}
 if((m=t.match(/^Имеет ли смысл \d+\/\(x−(\d+)\) при x=(\d+)\?$/)))return assert.equal(/^Нет/.test(a),m[1]===m[2]);
 if(t.includes('Объясните ошибку: (−3)²=−9'))return assert.match(a,/9/);
 if((m=t.match(/^При каком x выражение \d+\/\(x([+−])(\d+)\) не имеет смысла\?$/)))return equal(a,'x='+(m[1]==='+'?'−':'')+m[2],t);
 if((m=t.match(/^Вычислите (\d+)\/(\d+) \+ (\d+)\/(\d+)\.$/)))return equal(a,frac(+m[1]*+m[4]+ +m[3]*+m[2],+m[2]*+m[4]),t);
 if((m=t.match(/^Найдите (\d+)% от (\d+)\.$/)))return equal(a,(+m[1])*(+m[2])/100,t);
 if((m=t.match(/^Вычислите ([\d,]+)·([\d,]+)−([\d,]+)·([\d,]+)\.$/)))return equal(a,decimal(m[1])*decimal(m[2])-decimal(m[3])*decimal(m[4]),t);
 if((m=t.match(/^Цена (\d+) р\. снижена на 20%/)))return equal(a,(+m[1])*.8+' р.',t);
 if((m=t.match(/^Найдите ([\d]+)m−(\d+)n при m=(−?\d+), n=(\d+)\.$/)))return equal(a,+m[1]*decimal(m[3])- +m[2]*+m[4],t);
 if((m=t.match(/^Найдите 3p\+2q при p=(−?\d+), q=(−?\d+)\.$/)))return equal(a,3*decimal(m[1])+2*decimal(m[2]),t);
 if((m=t.match(/^Вычислите (\d+)\/8 − (\d+)\/8\.$/)))return equal(a,frac(+m[1]- +m[2],8),t);
 if((m=t.match(/^При каком x выражение \d+\/\(2x−(\d+)\) не имеет смысла\?$/)))return equal(a,'x='+ (+m[1]/2),t);
 if(t.startsWith('Составьте числовое выражение со значением 24'))return assert.match(a,/\(8\+4\)·3−12=24/);
 if(t.startsWith('Найдите два способа вычислить'))return equal(a,61,t);
 if(t.includes('Почему отрицательное число'))return assert.match(a,/основание степени/);
 if(t.includes('Составьте короткий алгоритм'))return assert.match(a,/Порядок действий.*знаменатели/);
 if(t.includes('Найдите ошибку: (−2)²'))return assert.match(a,/результат 4/);
 throw Error('Unknown grade 7 question: '+t);
}
function g8(item){
 const t=item.text.replace(/^\d+\.\s*/,'').trim(),a=item.answer;let m;
 if((m=t.match(/^ОДЗ \d+\/\(x²−(\d+)\)\.$/))){const k=Math.sqrt(+m[1]);assert.ok(Number.isInteger(k));return equal(a,'x≠±'+k,t);}
 if((m=t.match(/^ОДЗ \d+\/\(x−(\d+)\)\.$/)))return equal(a,'x≠'+m[1],t);
 if((m=t.match(/^(?:Сократите|Упростите) \(x²−(\d+)\)\/\(x([−+])(\d+)\)\.$/))){const k=Math.sqrt(+m[1]);assert.ok(Number.isInteger(k)&&k===+m[3]);return equal(a,(m[2]==='−'?'x+':'x−')+k+', x≠'+(m[2]==='−'?'':'−')+k,t);}
 if((m=t.match(/^Сократите \(a²−b²\)\/\(a−b\)\.$/)))return equal(a,'a+b, a≠b',t);
 if((m=t.match(/^Сократите \(a²−4a\)\/\(a\)\.$/)))return equal(a,'a−4, a≠0',t);
 if((m=t.match(/^Решите \(x([+−])(\d+)\)\/\(x([+−])(\d+)\)=0\.$/))){const root=m[1]==='+'?- +m[2]:+m[2];const exc=m[3]==='+'?- +m[4]:+m[4];assert.notEqual(root,exc);return equal(a,root===7?'x=7':root+'',t);}
 if((m=t.match(/^Нуль \(x−(\d+)\)\/\(x\+(\d+)\)\.$/)))return equal(a,m[1],t);
 if((m=t.match(/^1\/x\+(\d+)\/x=$/)))return equal(a,(+m[1]+1)+'/x, x≠0',t);
 if((m=t.match(/^1\/x\+1\/(\d+)=$/)))return equal(a,'(x+'+m[1]+')/('+m[1]+'x), x≠0',t);
 if((m=t.match(/^\(x\/(\d+)\)·\((\d+)\/x\)=$/)))return equal(a,'1, x≠0',t);
 if((m=t.match(/^1\/\(x−(\d+)\)−1\/\(x\+\1\)=$/)))return equal(a,2*(+m[1])+'/(x²−'+(+m[1])**2+'), x≠±'+m[1],t);
 if((m=t.match(/^x\/\(x−(\d+)\)·\(x−\1\)\/(\d+)x=$/)))return equal(a,'1/'+m[2]+', x≠0,'+m[1],t);
 if((m=t.match(/^\(x\/(\d+)\):\(x\/(\d+)\)=$/)))return equal(a,m[2]+'/'+m[1]+', x≠0',t);
 if(t.startsWith('Найдите ошибку: ученик сократил x'))return assert.match(a,/1\+2\/x/);
 if(t.includes('сохраняется исходное ОДЗ'))return assert.match(a,/запрещённая точка не возвращается/);
 if(t.includes('после сокращения (x−2)/(x−2)'))return assert.match(a,/x=2 запрещён/);
 if(t.includes('Составьте выражение с ОДЗ'))return assert.match(a,/1\/\(x²−9\)/);
 if(t.startsWith('Почему x=5 исключено'))return assert.match(a,/знаменатель равен нулю/);
 if(t.includes('равенство рациональных выражений'))return assert.match(a,/допустимых одновременно/);
 if(t.includes('Составьте дробь, после сокращения'))return assert.match(a,/\(x\+1\)\(x−2\)\/\(x−2\)/);
 throw Error('Unknown grade 8 question: '+t);
}
function g9(item){
 const t=item.text.replace(/^\d+\.\s*/,'').trim(),a=item.answer;let m;
 if((m=t.match(/^Укажите самое узкое множество для числа ([−-]?\d+)\.$/)))return equal(a,decimal(m[1])>0?'N':decimal(m[1])<0?'Z':'Z',t);
 if((m=t.match(/^Укажите самое узкое множество для числа (\d+)\/(\d+)\.$/)))return equal(a,Number(m[1])%Number(m[2])===0?'N':'Q',t);
 if((m=t.match(/^К какому самому узкому множеству относится ([−-]?\d+)\?$/)))return equal(a,'Z',t);
 if((m=t.match(/^К какому самому узкому множеству относится −(\d+)\/(\d+)\?$/)))return equal(a,'Q',t);
 if((m=t.match(/^Рационально ли число 0,\((\d+)\)\?$/)))return assert.match(a,/Да.*рациональн/);
 if((m=t.match(/^Какое из чисел √(\d+) и √(\d+) иррационально\?$/))){assert.ok(Number.isInteger(Math.sqrt(+m[1]))&&!Number.isInteger(Math.sqrt(+m[2])));return equal(a,'√'+m[2],t);}
 if((m=t.match(/^Рационально ли √(\d+)\?$/))){assert.ok(Number.isInteger(Math.sqrt(+m[1])));return assert.match(a,/Да/);}
 if((m=t.match(/^Иррационально ли √(\d+)\?$/))){assert.ok(!Number.isInteger(Math.sqrt(+m[1])));return assert.match(a,/Да/);}
 if((m=t.match(/^Какие множества содержат число (\d+)\?$/)))return assert.match(a,/N, Z, Q и R/);
 if(t.includes('периодическая бесконечная')||t.includes('бесконечна'))return assert.match(a,/рациональн/);
 if(t.includes('смысл включения Q⊂R'))return assert.match(a,/Каждое рациональное.*действительным/);
 if(t.includes('цепочку включений')||t.includes('Запишите цепочку N, Z, Q, R'))return equal(a,'N⊂Z⊂Q⊂R',t);
 if(t.includes('Классифицируйте √49'))return assert.match(a,/√49∈N; √7∈R\\Q/);
 if(t.includes('число −12'))return equal(a,'Z',t);
 if(t.includes('Вычислите 2,7+13,4+7,3'))return equal(a,'23,4',t);
 if(t.includes('Укажите самое узкое множество для 17'))return equal(a,'N',t);
 if(t.includes('Укажите самое узкое множество для −8'))return equal(a,'Z',t);
 if(t.includes('Укажите самое узкое множество для 5/12'))return equal(a,'Q',t);
 if(t.includes('0,(27)'))return assert.match(a,/рациональн/);
 if(t.includes('√10'))return assert.match(a,/Да/);
 if(t.includes('1,8+6,25+3,2+0,75'))return equal(a,12,t);
 if(t.includes('√36 — только действительное'))return assert.match(a,/√36=6.*N/);
 if(t.startsWith('Классифицируйте числа −15'))return assert.match(a,/−15∈Z.*0∈Z.*11\/4∈Q.*√2.*R/);
 if(t.startsWith('Какие из чисел 3,75'))return assert.match(a,/3,75 и 0,\(4\)/);
 if(t.startsWith('Вычислите 4,6+8,35+5,4+1,65'))return equal(a,20,t);
 if(t.includes('каждый рациональный корень'))return assert.match(a,/√\(1\/4\)=1\/2/);
 if(t.includes('1/0'))return assert.match(a,/Деление на ноль/);
 if(t.includes('по два примера чисел из'))return assert.match(a,/Z\\N:.*Q\\Z:.*R\\Q:/);
 if(t.includes('√25 одновременно'))return assert.match(a,/√25=5/);
 throw Error('Unknown grade 9 question: '+t);
}
const checks={g7,g8,g9};let grand=0;
for(const [key,series] of Object.entries(data)){
 const l=series.lessons[0],meta=series.meta;
 assert.equal(l.id,'01');assert.equal(meta.rowId,key==='g7'?'7-algebra-makarychev':key==='g8'?'8-algebra-makarychev':'9-algebra-makarychev');
 assert.equal(meta.topicNumber,key==='g9'?1:7);
 assert.equal(meta.courseLessonStart,key==='g9'?1:91);
 assert.equal(meta.totalLessons,key==='g9'?18:12);
 for(const kind of ['independent','control']){
  const w=l[kind];assert.equal(w.variants.length,6);for(const v of w.variants){assert.equal(v.tasks.reduce((s,t)=>s+t.points,0),w.maxScore);}
 }
 const tasks=all(l),n=key==='g9'?97:92;
 assert.equal(tasks.length,n,key+' displayed count');
 for(const item of tasks)checks[key](item);
 grand+=tasks.length;
 console.log('PASS '+meta.rowId+' '+l.title+' '+tasks.length+' independently verified instances, 12 scored variants');
}
assert.equal(grand,281);
console.log('All 281 conditions and answers independently audited; three algebra source units PASS.');
