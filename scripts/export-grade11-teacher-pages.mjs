import fs from 'node:fs';
import path from 'node:path';
// Run locally: node scripts/export-grade11-teacher-pages.mjs
// Generated teacher pages are intentionally gitignored and should be access-controlled.
const deps={
 '01':[],'02':[],'03':[],
 '04':['lessons/11-geometry-atanasyan/04/question-bank.js'],
 '05':['geometry/vector-math.js','geometry/coordinate-math.js','lessons/11-geometry-atanasyan/05/question-bank.js'],
 '06':['geometry/vector-math.js','geometry/coordinate-math.js','lessons/11-geometry-atanasyan/04/question-bank.js','lessons/11-geometry-atanasyan/05/question-bank.js','lessons/11-geometry-atanasyan/06/question-bank.js']
};
for(const [topic,dependencies] of Object.entries(deps))for(const kind of ['independent','control']){
 const directory=path.join('assessments','11-geometry-atanasyan',topic);
 const base=fs.readFileSync(path.join(directory,kind+'.html'),'utf8');
 const scripts=[...dependencies.map(item=>'<script src="../../../'+item+'"></script>'),'<script src="data.js"></script>'].join('');
 const page=base.replace('data-audience="student"','data-audience="teacher"').replace('<script src="student-data.js"></script>',scripts);
 if(!page.includes('data-audience="teacher"')||!page.includes('<script src="data.js"></script>'))throw Error('Invalid teacher view '+topic+'/'+kind);
 const filename=path.join(directory,'teacher-'+kind+'.html');
 fs.writeFileSync(filename,page);
 console.log('Local teacher workbook: '+filename);
}
