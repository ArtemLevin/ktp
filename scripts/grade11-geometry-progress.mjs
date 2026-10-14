import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export function grade11GeometryProgress(root=process.cwd()){
  const count=(dir,re)=>fs.readdirSync(path.join(root,dir),{withFileTypes:true}).reduce((n,e)=>
    n+(e.isDirectory()?count(path.join(dir,e.name),re):e.isFile()&&re.test(e.name)?1:0),0);
  const line='lessons/11-geometry-atanasyan',numbers=[];
  let lessonSeries=0,completeSeries=0;
  for(const entry of fs.readdirSync(path.join(root,line),{withFileTypes:true})){
    if(!entry.isDirectory()||!/^\d\d$/.test(entry.name))continue;
    const dir=path.join(line,entry.name),routes=fs.readdirSync(path.join(root,dir)).filter(n=>/^\d\d\.html$/.test(n));
    if(!routes.length)continue;
    const ctx={window:{}};
    vm.runInNewContext(fs.readFileSync(path.join(root,dir,'series.js'),'utf8'),ctx);
    const m=ctx.window.KTP_LESSON_SERIES.meta,start=m.courseLessonStart||m.globalStart||1;
    routes.forEach(n=>numbers.push(start+Number(n.slice(0,2))-1));lessonSeries++;
    if(routes.length===(m.plannedTotalLessons||m.totalLessons)&&
      ['data.js','independent.html','control.html'].every(n=>fs.existsSync(path.join(root,'assessments/11-geometry-atanasyan',entry.name,n))))completeSeries++;
  }
  numbers.sort((a,b)=>a-b);
  if(numbers.some((n,i)=>n!==i+1))throw Error('Published grade 11 lesson routes must be contiguous from 1');
  const lessonCount=numbers.length,assessmentSeries=fs.readdirSync(path.join(root,'assessments/11-geometry-atanasyan'),{withFileTypes:true})
    .filter(e=>e.isDirectory()&&fs.existsSync(path.join(root,'assessments/11-geometry-atanasyan',e.name,'data.js'))).length;
  const totalAssessments=count('assessments',/^data\.js$/),ctx={window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'js/data.js'),'utf8'),ctx);
  const remainingTopics=ctx.window.KTP_DATA.rows.reduce((n,r)=>n+r.topics.length,0)-totalAssessments;
  const lineStatus=completeSeries===6&&lessonCount===68&&assessmentSeries===6?'готово':'в работе';
  return {lineStatus,totalAssessments,remainingTopics,totalLessons:count('lessons',/^\d\d\.html$/),lessonCount,lessonSeries,completeSeries,assessmentSeries,
    range:'1–'+lessonCount,summary:`${completeSeries}/6, ${lessonCount}/68, ${assessmentSeries}/6`,
    row:`| ${completeSeries}/6 | ${lessonCount}/68 | ${assessmentSeries}/6 |`,
    lessonRow:`| ${lessonSeries}/6 | ${lessonCount}/68 | 1–${lessonCount} |`,
    contentMap:`Поурочный слой: ${lessonCount}/68; тематические assessment-комплекты: ${assessmentSeries}/6`};
}
