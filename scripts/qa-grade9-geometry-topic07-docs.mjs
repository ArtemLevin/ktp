import fs from 'node:fs';let checks=0;const read=p=>fs.readFileSync(p,'utf8'),assert=(v,m)=>{checks++;if(!v)throw new Error(m)};
const R=read('README.md'),P=read('Plan.md'),L=read('lessons/README.md'),A=read('assessments/README.md'),M=read('content/9-geometry-atanasyan/content-map.md');
for(const [d,n] of [[R,'README'],[P,'Plan'],[L,'lessons'],[A,'assessments']]){assert(d.includes('9-geometry-atanasyan'),`${n}: row missing`);assert(d.includes('Повторение'),`${n}: topic07 missing`);}
assert(R.includes('1054')&&R.includes('76 тематических assessment-комплект'),'README aggregate');assert(R.includes('**7/7**')&&R.includes('**68/68**'),'README line complete');assert(R.includes('10 линий')&&R.includes('planimetry-router'),'README completion/lab');assert(R.includes('10-geometry-atanasyan'),'README next phase');
assert(P.includes('**76**')&&P.includes('**1054**')&&P.includes('**45**'),'Plan metrics');assert(P.includes('07-methodical-plan.md')&&P.includes('planimetry-router'),'Plan artifacts');assert(P.includes('10-geometry-atanasyan'),'Plan next');
assert(L.includes('**7/7**')&&L.includes('**68/68**')&&L.includes('1054'),'lessons metrics');assert(L.includes('planimetry-router'),'lessons lab');
assert(A.includes('**7/7**')&&A.includes('76 тематических assessment-комплект'),'assessment metrics');assert(A.includes('01–07'),'assessment range');
assert(M.match(/\| 07 \| Повторение[^\n]*\| full \|/),'content map topic07 full');
console.log(`Grade 9 Atanasyan topic 07 documentation QA passed: ${checks} checks.`);