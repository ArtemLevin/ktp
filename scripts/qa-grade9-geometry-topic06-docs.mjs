import fs from 'node:fs';let checks=0;const read=p=>fs.readFileSync(p,'utf8'),assert=(v,m)=>{checks++;if(!v)throw new Error(m)};
const R=read('README.md'),P=read('Plan.md'),L=read('lessons/README.md'),A=read('assessments/README.md'),M=read('content/9-geometry-atanasyan/content-map.md');
for(const [d,n] of [[R,'README'],[P,'Plan'],[L,'lessons'],[A,'assessments']]){assert(d.includes('9-geometry-atanasyan'),`${n}: row missing`);assert(d.includes('Подобие фигур'),`${n}: topic06 missing`);}
assert(R.includes('1046')&&R.includes('75 тематических assessment'),'README aggregate');assert(R.includes('**6/7**')&&R.includes('**60/68**'),'README progress');assert(R.includes('similarity-transform')&&R.includes('Повторение'),'README lab/next');
assert(P.includes('**75**')&&P.includes('**1046**')&&P.includes('**46**'),'Plan metrics');assert(P.includes('06-methodical-plan.md')&&P.includes('similarity-transform'),'Plan artifacts');assert(P.includes('Ближайшая рабочая единица — `9-geometry-atanasyan/07`'),'Plan next');
assert(L.includes('**6/7**')&&L.includes('**60/68**')&&L.includes('1046'),'lessons metrics');assert(L.includes('similarity-transform'),'lessons lab');
assert(A.includes('**6/7**')&&A.includes('75 тематических assessment'),'assessment metrics');assert(A.includes('01–06'),'assessment range');
assert(M.match(/\| 06 \| Подобие фигур[^\n]*\| full \|/),'map topic06 full');
console.log(`Grade 9 Atanasyan topic 06 documentation QA passed: ${checks} checks.`);