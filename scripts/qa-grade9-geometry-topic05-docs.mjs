import fs from 'node:fs';let checks=0;const read=p=>fs.readFileSync(p,'utf8'),assert=(v,m)=>{checks++;if(!v)throw new Error(m)};
const R=read('README.md'),P=read('Plan.md'),L=read('lessons/README.md'),A=read('assessments/README.md'),M=read('content/9-geometry-atanasyan/content-map.md');
for(const [d,n] of [[R,'README'],[P,'Plan'],[L,'lessons'],[A,'assessments']]){assert(d.includes('9-geometry-atanasyan'),`${n} row`);assert(d.includes('Движения'),`${n} topic05`);}
assert(R.includes('1037')&&R.includes('74 тематических assessment'),'README aggregate');assert(R.includes('**5/7**')&&R.includes('**51/68**'),'README progress');assert(R.includes('plane-transformations')&&R.includes('Подобие фигур'),'README lab/next');
assert(P.includes('**74**')&&P.includes('**1037**')&&P.includes('**47**'),'Plan metrics');assert(P.includes('05-methodical-plan.md')&&P.includes('plane-transformations'),'Plan artifacts');assert(P.includes('Ближайшая рабочая единица — `9-geometry-atanasyan/06`'),'Plan next');
assert(L.includes('**5/7**')&&L.includes('**51/68**')&&L.includes('1037'),'lessons metrics');assert(L.includes('plane-transformations'),'lessons lab');
assert(A.includes('**5/7**')&&A.includes('74 тематических assessment'),'assessment metrics');assert(A.includes('01–05'),'assessment range');
assert(M.match(/\| 05 \| Движения[^\n]*\| full \|/),'map topic05 full');
console.log(`Grade 9 Atanasyan topic 05 documentation QA passed: ${checks} checks.`);