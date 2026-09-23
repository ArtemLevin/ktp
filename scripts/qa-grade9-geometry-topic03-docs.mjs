import fs from 'node:fs';let checks=0;const read=p=>fs.readFileSync(p,'utf8'),assert=(v,m)=>{checks++;if(!v)throw new Error(m)};
const R=read('README.md'),P=read('Plan.md'),L=read('lessons/README.md'),A=read('assessments/README.md'),M=read('content/9-geometry-atanasyan/content-map.md'),LP=read('lessons/9-geometry-atanasyan/lesson-plan.md');
for(const [d,n] of [[R,'README'],[P,'Plan'],[L,'lessons'],[A,'assessments']]){assert(d.includes('9-geometry-atanasyan'),`${n}: row missing`);assert(d.includes('Скалярное произведение'),`${n}: topic03 missing`);}
assert(R.includes('1018')&&R.includes('72 тематических assessment'),'README aggregate metrics');assert(R.includes('**3/7**')&&R.includes('**32/68**'),'README grade9 progress');
assert(P.includes('**72**')&&P.includes('**1018**')&&P.includes('**49**'),'Plan aggregate metrics');assert(P.includes('triangle-relations'),'Plan lab');
assert(L.includes('**3/7**')&&L.includes('**32/68**')&&L.includes('1018'),'lessons metrics');
assert(A.includes('**3/7**')&&A.includes('72 тематических assessment'),'assessments metrics');
assert(M.match(/\| 03 \| Соотношения[^\n]*\| full \|/),'content map topic03 full');
assert(LP.indexOf('23. Теорема синусов')<LP.indexOf('25. Теорема косинусов'),'lesson plan follows p97 before p98');
console.log(`Grade 9 Atanasyan topic 03 documentation QA passed: ${checks} checks.`);