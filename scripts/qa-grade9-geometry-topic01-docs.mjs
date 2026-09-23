import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');let checks=0;const assert=(v,m)=>{checks++;if(!v)throw new Error(m)};
const readme=read('README.md'),plan=read('Plan.md'),lessons=read('lessons/README.md'),assessments=read('assessments/README.md'),map=read('content/9-geometry-atanasyan/content-map.md'),lp=read('lessons/9-geometry-atanasyan/lesson-plan.md');
for(const [doc,name] of [[readme,'README'],[plan,'Plan'],[lessons,'lessons README'],[assessments,'assessments README']]){
 assert(doc.includes('9-geometry-atanasyan'),`${name}: grade 9 line missing`);
 assert(doc.includes('Векторы'),`${name}: vector topic missing`);
}
assert(readme.includes('996')&&readme.includes('70 тематических assessment'),'README aggregate metrics');
assert(plan.includes('1/7')&&plan.includes('10/68'),'Plan topic metrics');
assert(lessons.includes('10/68')&&lessons.includes('996'),'lessons metrics');
assert(assessments.includes('1/7')&&assessments.includes('70'),'assessment metrics');
assert(map.includes('| 01 | Векторы')&&map.includes('| full |'),'content map topic01 status');
assert(lp.includes('1. Вектор как направленный отрезок')&&lp.includes('10. Средняя линия трапеции'),'lesson plan route');
console.log(`Grade 9 Atanasyan topic 01 documentation QA passed: ${checks} checks.`);