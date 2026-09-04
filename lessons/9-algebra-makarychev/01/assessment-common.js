(function(){
'use strict';
const series=window.KTP_LESSON_SERIES;
if(!series)return;
const T=(text,answer,points,skill,solution='')=>({text,answer:String(answer),points,skill,solution});
const V=(id,tasks)=>({id,tasks});
const fmt=(x,d=6)=>Number(x.toFixed(d)).toString().replace('.',',');
const plain=(x,d=12)=>x.toFixed(d).replace('.',',').replace(/0+$/,'').replace(/,$/,'');
const frac=(a,b)=>{const g=(x,y)=>y?g(y,x%y):Math.abs(x);const k=g(a,b);a/=k;b/=k;return b===1?String(a):`${a}/${b}`;};
const pct=x=>`${fmt(x*100,4)}%`;
const builders={};
const api={
  helpers:{T,V,fmt,plain,frac,pct},
  register(kind,fn){
    if(builders[kind])throw new Error(`Duplicate assessment kind: ${kind}`);
    builders[kind]=fn;
  },
  pack(purpose,kind){
    const builder=builders[kind];
    if(!builder)throw new Error(`Unknown assessment kind: ${kind}`);
    const independent=[],control=[];
    for(let i=1;i<=6;i++){
      const {q,r}=builder(i);
      independent.push(V(i,q));
      control.push(V(i,r));
    }
    return {
      independent:{duration:'12–15 минут',maxScore:10,purpose,variants:independent},
      control:{duration:'18–22 минуты',maxScore:14,purpose:`Расширенная проверка: ${purpose}`,variants:control}
    };
  },
  add(opts){
    const assessments=api.pack(opts.assessmentPurpose||'Проверка навыков урока.',opts.kind);
    const lesson={...opts,...assessments};
    delete lesson.kind;
    delete lesson.assessmentPurpose;
    series.lessons.push(lesson);
    return lesson;
  }
};
window.KTP_G9_NUMBERS=api;
})();
