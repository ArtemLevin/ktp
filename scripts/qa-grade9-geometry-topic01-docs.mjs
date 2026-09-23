import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');let checks=0;const assert=(v,m)=>{checks++;if(!v)throw new Error(m)};
const readme=read('README.md'),plan=read('Plan.md'),lessons=read('lessons/README.md'),assessments=read('assessments/README.md'),map=read('content/9-geometry-atanasyan/content-map.md'),lp=read('lessons/9-geometry-atanasyan/lesson-plan.md');
for(const [doc,name] of [[readme,'README'],[plan,'Plan'],[lessons,'lessons README'],[assessments,'assessments README']]){
 assert(doc.includes('9-geometry-atanasyan'),`${name}: grade 9 line missing`);
 assert(doc.includes('Векторы'),`${name}: vector topic missing`);
}
const rowText=[readme,plan,lessons,assessments].join('\n');
const seriesMatches=[...rowText.matchAll(/9-geometry-atanasyan[^\n]*?(\d+)\/7/g)].map(m=>Number(m[1]));
assert(seriesMatches.length&&Math.max(...seriesMatches)>=1,'grade 9 series progress must not regress below topic01');
assert(readme.includes('vector-operations')&&lessons.includes('vector-operations'),'vector lab docs');
assert(assessments.includes('Векторы'),'vector assessment docs');
assert(map.includes('| 01 | Векторы')&&map.includes('| full |'),'content map topic01 status');
assert(lp.includes('1. Вектор как направленный отрезок')&&lp.includes('10. Средняя линия трапеции'),'lesson plan route');
console.log(`Grade 9 Atanasyan topic 01 documentation QA passed: ${checks} checks.`);