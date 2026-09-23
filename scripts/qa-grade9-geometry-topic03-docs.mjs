import fs from 'node:fs';let checks=0;const read=p=>fs.readFileSync(p,'utf8'),assert=(v,m)=>{checks++;if(!v)throw new Error(m)};
const R=read('README.md'),P=read('Plan.md'),L=read('lessons/README.md'),A=read('assessments/README.md'),M=read('content/9-geometry-atanasyan/content-map.md'),LP=read('lessons/9-geometry-atanasyan/lesson-plan.md');
for(const [d,n] of [[R,'README'],[P,'Plan'],[L,'lessons'],[A,'assessments']]){assert(d.includes('9-geometry-atanasyan'),`${n}: row missing`);assert(d.includes('Скалярное произведение'),`${n}: topic03 missing`);}
const rLessons=Number(R.match(/Суммарно опубликовано \*\*(\d+) полноценных/)?.[1]||0),rAssess=Number(R.match(/\*\*(\d+) тематических assessment-комплект/)?.[1]||0);
assert(rLessons>=1018&&rAssess>=72,'README aggregate metrics must not regress below topic03');
const progress=[...R.matchAll(/9-geometry-atanasyan[^\n]*?\*\*(\d+)\/7\*\*[^\n]*?\*\*(\d+)\/68\*\*/g)].map(m=>[Number(m[1]),Number(m[2])]);assert(progress.length&&progress.some(([s,l])=>s>=3&&l>=32),'README grade9 progress must not regress below topic03');
const pSeries=Number(P.match(/полностью готовых тематических серий: \*\*(\d+)\*\*/) ?. [1]||0),pLessons=Number(P.match(/опубликованных уроков: \*\*(\d+)\*\*/) ?. [1]||0),pAssess=Number(P.match(/тематических assessment-комплектов: \*\*(\d+)\*\*/) ?. [1]||0);
assert(pSeries>=72&&pLessons>=1018&&pAssess>=72,'Plan aggregate metrics must not regress below topic03');assert(P.includes('triangle-relations'),'Plan lab');
const lTotal=Number(L.match(/Всего опубликовано \*\*(\d+) полноценных/)?.[1]||0);assert(lTotal>=1018&&L.includes('9-geometry-atanasyan'),'lessons metrics');assert(L.includes('**3/7**')||L.includes('**4/7**')||L.includes('**5/7**')||L.includes('**6/7**')||L.includes('**7/7**'),'lessons grade9 progress');
const aTotal=Number(A.match(/Всего опубликовано \*\*(\d+) тематических assessment-комплект/)?.[1]||0);assert(aTotal>=72,'assessments metrics');assert(A.includes('**3/7**')||A.includes('**4/7**')||A.includes('**5/7**')||A.includes('**6/7**')||A.includes('**7/7**'),'assessments grade9 progress');
assert(M.match(/\| 03 \| Соотношения[^\n]*\| full \|/),'content map topic03 full');
assert(LP.indexOf('23. Теорема синусов')<LP.indexOf('25. Теорема косинусов'),'lesson plan follows p97 before p98');
console.log(`Grade 9 Atanasyan topic 03 documentation QA passed: ${checks} checks.`);