import fs from 'node:fs';let checks=0;const read=p=>fs.readFileSync(p,'utf8'),assert=(v,m)=>{checks++;if(!v)throw new Error(m)};
const R=read('README.md'),P=read('Plan.md'),L=read('lessons/README.md'),A=read('assessments/README.md'),M=read('content/9-geometry-atanasyan/content-map.md');
for(const [d,n] of [[R,'README'],[P,'Plan'],[L,'lessons'],[A,'assessments']]){assert(d.includes('9-geometry-atanasyan'),`${n}: row missing`);assert(d.includes('Длина окружности и площадь круга'),`${n}: topic04 missing`);}
assert(R.includes('1028')&&R.includes('73 тематических assessment'),'README aggregate metrics');assert(R.includes('**4/7**')&&R.includes('**42/68**'),'README grade9 progress');
assert(R.includes('circle-measures')&&R.includes('Движения'),'README lab/next topic');
assert(P.includes('**73**')&&P.includes('**1028**')&&P.includes('**48**'),'Plan aggregate metrics');assert(P.includes('circle-measures')&&P.includes('04-methodical-plan.md'),'Plan topic04 artifacts');
assert(P.includes('Ближайшая рабочая единица — `9-geometry-atanasyan/05`'),'Plan next unit');
assert(L.includes('**4/7**')&&L.includes('**42/68**')&&L.includes('1028'),'lessons metrics');assert(L.includes('circle-measures'),'lessons lab');
assert(A.includes('**4/7**')&&A.includes('73 тематических assessment'),'assessments metrics');assert(A.includes('01–04'),'assessment nav range docs');
assert(M.match(/\| 04 \| Длина окружности и площадь круга[^\n]*\| full \|/),'content map topic04 full');
console.log(`Grade 9 Atanasyan topic 04 documentation QA passed: ${checks} checks.`);