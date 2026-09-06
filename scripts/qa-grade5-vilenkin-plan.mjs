import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT=process.cwd();
const ROW='5-math-vilenkin';
const EXPECTED_BOUNDS=[0,7,14,20,25,29,35,39,43,47,53,61,64,68];
const EXPECTED_COUNTS=[18,17,15,13,10,15,10,10,10,15,20,7,10];
const EXPECTED_TOPICS=[
  'Натуральные числа',
  'Сложение и вычитание натуральных чисел',
  'Умножение и деление натуральных чисел',
  'Делители и кратные',
  'Площадь и объём',
  'Обыкновенные дроби',
  'Сложение и вычитание дробей с одинаковыми знаменателями',
  'Сложение и вычитание дробей с разными знаменателями',
  'Умножение и деление обыкновенных дробей',
  'Десятичные дроби',
  'Умножение и деление десятичных дробей',
  'Транспортир',
  'Резерв и повторение'
];
const EXPECTED_ENDS=[18,35,50,63,73,88,98,108,118,133,153,160,170];
let checks=0;
const assert=(condition,message)=>{checks++;if(!condition)throw new Error(message);};
const file=p=>path.join(ROOT,p);
const read=p=>fs.readFileSync(file(p),'utf8');

function loadData(){
  const source=read('js/data.js');
  new vm.Script(source,{filename:'js/data.js'});
  const context=vm.createContext({window:{}});
  new vm.Script(source,{filename:'js/data.js'}).runInContext(context);
  return context.window.KTP_DATA;
}

function validateRow(){
  const data=loadData();
  const row=data.rows.find(item=>item.id===ROW);
  assert(row,`${ROW}: row missing from js/data.js`);
  assert(row.grade===5,`${ROW}: grade must be 5`);
  assert(row.subject==='Математика',`${ROW}: wrong subject`);
  assert(row.book==='Виленкин',`${ROW}: wrong textbook line`);
  assert(row.hours==='170 ч',`${ROW}: hours must be 170 ч`);
  assert(JSON.stringify(row.bounds)===JSON.stringify(EXPECTED_BOUNDS),`${ROW}: bounds mismatch: ${JSON.stringify(row.bounds)}`);
  assert(row.bounds.length===row.topics.length+1,`${ROW}: bounds/topics length mismatch`);
  assert(row.bounds[0]===0&&row.bounds.at(-1)===68,`${ROW}: bounds must cover 0..68`);
  row.bounds.slice(1).forEach((value,index)=>assert(value>row.bounds[index],`${ROW}: non-increasing boundary at ${index+1}`));
  assert(row.topics.length===13,`${ROW}: expected 13 topics`);
  row.topics.forEach((topic,index)=>{
    assert(topic.id===`${ROW}::${index}`,`${ROW}: wrong topic id at ${index+1}`);
    assert(topic.title===EXPECTED_TOPICS[index],`${ROW}: topic ${index+1} title mismatch`);
  });
}

function validatePlanningDocs(){
  for(const p of ['content/5-math-vilenkin/content-map.md','lessons/5-math-vilenkin/lesson-plan.md']){
    assert(fs.existsSync(file(p)),`${p}: missing`);
    assert(read(p).trim().length>1000,`${p}: unexpectedly short`);
  }
  const map=read('content/5-math-vilenkin/content-map.md');
  assert(map.includes('170 часов'),`content-map: federal 170-hour frame missing`);
  assert(map.includes('[0,7,14,20,25,29,35,39,43,47,53,61,64,68]'),`content-map: approved bounds missing`);
  assert(map.includes('Простые и составные числа'),`content-map: federal divisibility supplement missing`);
  assert(map.includes('Округление натуральных чисел'),`content-map: natural-number rounding supplement missing`);

  const plan=read('lessons/5-math-vilenkin/lesson-plan.md');
  assert(plan.includes('170 уроков'),`lesson-plan: 170-lesson declaration missing`);
  assert(plan.includes('[0,7,14,20,25,29,35,39,43,47,53,61,64,68]'),`lesson-plan: approved bounds missing`);
  EXPECTED_COUNTS.forEach((count,index)=>assert(plan.includes(`| ${String(index+1).padStart(2,'0')} ·`)&&plan.includes(`| ${count} |`),`lesson-plan: topic ${index+1} summary missing`));

  const numbers=[];
  for(const line of plan.split(/\r?\n/)){
    const match=line.match(/^\|\s*(\d{1,3})\s*\|/);
    if(match)numbers.push(Number(match[1]));
  }
  assert(numbers.length===170,`lesson-plan: expected 170 numbered lesson rows, got ${numbers.length}`);
  numbers.forEach((number,index)=>assert(number===index+1,`lesson-plan: lesson sequence break at row ${index+1}, got ${number}`));
  EXPECTED_ENDS.forEach(end=>assert(numbers.includes(end),`lesson-plan: topic endpoint ${end} missing`));
}

function validateScaffolds(){
  for(let topic=1;topic<=13;topic++){
    const n=String(topic).padStart(2,'0');
    const p=`topics/${ROW}/${n}.html`;
    assert(fs.existsSync(file(p)),`${p}: scaffold missing`);
    const html=read(p);
    assert(/<meta\s+name=["']viewport["']/i.test(html),`${p}: viewport meta missing`);
    assert(html.includes(`data-row="${ROW}"`),`${p}: row binding missing`);
    assert(html.includes(`data-topic="${topic-1}"`),`${p}: topic binding mismatch`);
  }
}

validateRow();
validatePlanningDocs();
validateScaffolds();
const total=EXPECTED_COUNTS.reduce((sum,n)=>sum+n,0);
assert(total===170,`internal expected lesson total ${total} != 170`);
console.log(`Grade 5 Vilenkin planning QA passed: ${checks} checks, 13 topics, ${total} planned lessons.`);
