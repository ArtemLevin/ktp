import fs from 'node:fs';
let checks=0;
const read=p=>fs.readFileSync(p,'utf8');
const assert=(v,m)=>{checks++;if(!v)throw new Error(m)};
const numberAfter=(text,label)=>{
  const i=text.indexOf(label);
  if(i<0)return NaN;
  const chunk=text.slice(i,i+140);
  const m=chunk.match(/\*\*(\d+)\*\*/)||chunk.match(/(\d+)/);
  return m?Number(m[1]):NaN;
};
const R=read('README.md'),P=read('Plan.md'),L=read('lessons/README.md'),A=read('assessments/README.md'),M=read('content/9-geometry-atanasyan/content-map.md');
for(const [d,n] of [[R,'README'],[P,'Plan'],[L,'lessons'],[A,'assessments']]){
  assert(d.includes('9-geometry-atanasyan'),`${n}: row missing`);
  assert(d.includes('Повторение'),`${n}: topic07 missing`);
}
assert(numberAfter(R,'Суммарно опубликовано')>=1054,'README lesson aggregate must not regress');
assert(R.match(/(?:76|77|78|79|8\d|9\d|1\d\d) тематических assessment-комплект/),'README assessment aggregate must not regress');
assert(R.includes('**7/7**')&&R.includes('**68/68**'),'README line complete');
assert(R.includes('10 линий')&&R.includes('planimetry-router'),'README completion/lab');
assert(R.includes('10-geometry-atanasyan'),'README next phase');
assert(numberAfter(P,'полностью готовых тематических серий:')>=76,'Plan series metric must not regress');
assert(numberAfter(P,'опубликованных уроков:')>=1054,'Plan lesson metric must not regress');
assert(numberAfter(P,'тематических assessment-комплектов:')>=76,'Plan assessment metric must not regress');
assert(P.includes('07-methodical-plan.md')&&P.includes('planimetry-router'),'Plan artifacts');
assert(P.includes('10-geometry-atanasyan'),'Plan next');
assert(L.includes('**7/7**')&&L.includes('**68/68**'),'lessons grade9 complete');
assert(numberAfter(L,'Всего опубликовано')>=1054,'lessons aggregate must not regress');
assert(L.includes('planimetry-router'),'lessons lab');
assert(A.includes('**7/7**'),'assessment grade9 complete');
assert(numberAfter(A,'Всего опубликовано')>=76,'assessment aggregate must not regress');
assert(A.includes('01–07'),'assessment range');
assert(M.match(/\| 07 \| Повторение[^\n]*\| full \|/),'content map topic07 full');
console.log(`Grade 9 Atanasyan topic 07 documentation QA passed: ${checks} checks.`);
