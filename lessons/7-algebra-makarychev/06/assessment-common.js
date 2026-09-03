(function(){
'use strict';
const t=(text,answer,points,skill,solution='')=>({text,answer:String(answer),points,skill,solution});
const v=(id,tasks)=>({id,tasks});
const fmt=n=>Number.isInteger(n)?String(n):String(Math.round(n*1000)/1000).replace('.',',');
const pair=(x,y)=>`(${fmt(x)}; ${fmt(y)})`;
const term=(c,name,first=false)=>{if(c===0)return '';const a=Math.abs(c),core=`${a===1?'':a}${name}`;if(first)return `${c<0?'−':''}${core}`;return `${c<0?' − ':' + '}${core}`;};
const eq=(a,b,c)=>{let s='';if(a!==0)s+=term(a,'x',true);if(b!==0)s+=term(b,'y',s==='');if(!s)s='0';return `${s} = ${fmt(c)}`;};
const lhs=(a,b)=>eq(a,b,0).split(' = ')[0];
const line=(k,b)=>{let s='y = ';if(k===0)return s+fmt(b);if(k===1)s+='x';else if(k===-1)s+='−x';else s+=`${fmt(k)}x`;if(b>0)s+=` + ${fmt(b)}`;else if(b<0)s+=` − ${fmt(Math.abs(b))}`;return s;};
const score=tasks=>tasks.reduce((s,x)=>s+x.points,0);
window.KTP_SYSTEM_ASSESSMENT_UTILS={t,v,fmt,pair,term,eq,lhs,line,score};
window.KTP_SYSTEM_BUILDERS={};
window.KTP_SYSTEM_ASSESSMENTS=function(kind){const B=window.KTP_SYSTEM_BUILDERS[kind];if(!B)throw new Error('unknown lesson kind '+kind);const I=[],C=[];for(let i=1;i<=6;i++){const {q,r}=B(i);if(score(q)!==10||score(r)!==14)throw new Error(`bad score ${kind} ${i}: ${score(q)}/${score(r)}`);I.push(v(i,q));C.push(v(i,r));}return{independent:{duration:'12–15 минут',maxScore:10,purpose:'Адресная проверка ключевых навыков урока.',variants:I},control:{duration:'18–22 минуты',maxScore:14,purpose:'Расширенная проверка применения метода и рассуждений.',variants:C}};};
})();
