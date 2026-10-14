(function(){
'use strict';
const pool=window.KTP_G11_REVIEW_QUESTION_POOL,domains=window.KTP_G11_REVIEW_DOMAINS;
const known=id=>{if(!domains.some(d=>d.id===id))throw new RangeError('Unknown review domain');return id;};
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a)||1;
const pi=(n,d)=>{const g=gcd(n,d);return d/g===1?n/g+'π':n/g+'π/'+(d/g);};
const tuple=v=>'('+v.join('; ')+').';
function quiz(domain,variant,index=0){
 known(domain);if(![0,1,3].includes(index))throw new RangeError('Unsupported quiz position');
 const q=pool(domain,variant)[index],a=q.audit,candidates=[q.answerCore];
 if(q.choices)candidates.push(...q.choices);
 else if(q.auditOrigin==='review'&&a.numerator!=null){for(const n of [a.numerator+a.denominator,a.numerator*2,a.numerator-a.denominator])candidates.push(pi(n,a.denominator)+' '+a.unit+'.');}
 else if(Array.isArray(a.result)&&a.result.length===3&&a.result.every(Number.isFinite))candidates.push(tuple(a.result.map(x=>-x)),tuple(a.result.map(x=>x+1)),tuple(a.result.map(x=>x+2)));
 else if(a.kind==='angle')candidates.push('0°.','90°.','135°.','180°.','30°.');
 else if(typeof a.result==='number')for(const v of [a.result+1,a.result*2,a.result/2])candidates.push(v+(a.unit?' '+a.unit:'')+'.');
 else if(a.kind==='segment'){const [from,to]=a.result;candidates.push(to+from+'.','0⃗.','Начало и конец можно выбрать произвольно.');}
 else candidates.push('Достаточно только равенства длин.','Можно сделать вывод по экранной проекции.','Все условия выполняются без проверки.');
 let options=[...new Set(candidates)];
 for(const fallback of ['0.','1.','Данных достаточно без дополнительных условий.','Результат определяется видом рисунка.'])if(options.length<4&&!options.includes(fallback))options.push(fallback);
 options=options.slice(0,4);const rotate=(variant+domains.findIndex(d=>d.id===domain)+index)%4;options=[...options.slice(rotate),...options.slice(0,rotate)];
 return {domain,variant,index,prompt:q.text,options,correct:options.indexOf(q.answerCore),answer:q.answerCore,solution:q.solution};
}
function grade(questions,answers){
 if(!Array.isArray(questions)||!Array.isArray(answers)||questions.length!==answers.length)throw new TypeError('Matching question/answer arrays required');
 const results=questions.map((q,i)=>{const choice=answers[i];if(!Number.isInteger(choice)||choice<0||choice>=q.options.length)throw new RangeError('Every question requires an answer');return {domain:q.domain,correct:choice===q.correct};});
 return {score:results.filter(r=>r.correct).length*2,maxScore:results.length*2,results};
}
function diagnostic(variant){return domains.map(d=>quiz(d.id,variant,0));}
function correction(domain,variant){return [quiz(domain,variant,1),quiz(domain,variant,3)];}
window.KTP_G11_REVIEW_ROUTER=Object.freeze({domains,quiz,grade,diagnostic,correction});
})();
