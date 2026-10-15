import fs from 'node:fs';
import vm from 'node:vm';
const deps={
 '01':[], '02':[], '03':[],
 '04':['lessons/11-geometry-atanasyan/04/question-bank.js'],
 '05':['geometry/vector-math.js','geometry/coordinate-math.js','lessons/11-geometry-atanasyan/05/question-bank.js'],
 '06':['geometry/vector-math.js','geometry/coordinate-math.js','lessons/11-geometry-atanasyan/04/question-bank.js','lessons/11-geometry-atanasyan/05/question-bank.js','lessons/11-geometry-atanasyan/06/question-bank.js']
};
const pick=(source,names)=>Object.fromEntries(names.filter(k=>source?.[k]!==undefined).map(k=>[k,source[k]]));
function render(topic){
 const context=vm.createContext({window:{},Math});
 for(const file of [...deps[topic],'assessments/11-geometry-atanasyan/'+topic+'/data.js'])
   vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
 const A=context.window.KTP_ASSESSMENT_DATA;
 const publicWork=work=>({...pick(work,['duration','maxScore','purpose']),
  variants:work.variants.map(v=>({id:v.id,tasks:v.tasks.map(q=>pick(q,['text','skill','points','position']))}))});
 const bundle={meta:pick(A.meta,['rowId','grade','subject','book','year','topic','sourceNote']),
  topic:{...pick(A.topic,['title','source']),independent:publicWork(A.topic.independent),control:publicWork(A.topic.control)}};
 return '(function(){\n"use strict";\nwindow.KTP_ASSESSMENT_DATA='+JSON.stringify(bundle)+';\n})();\n';
}
for(const topic of Object.keys(deps)){
 const target='assessments/11-geometry-atanasyan/'+topic+'/student-data.js',value=render(topic);
 if(process.argv.includes('--write'))fs.writeFileSync(target,value);
 else if(fs.readFileSync(target,'utf8')!==value)throw Error('Stale student bundle '+topic);
}
console.log('Student bundles: six series checked.');
