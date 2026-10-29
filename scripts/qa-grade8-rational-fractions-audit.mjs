import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const base='lessons/8-algebra-makarychev/01/';
const context=vm.createContext({window:{},Math});
for(const name of ['series.js','assessment-factory.js']){
  vm.runInContext(fs.readFileSync(base+name,'utf8'),context,{filename:base+name});
}
const pack=context.window.KTP_G8_RF?.pack;
assert.equal(typeof pack,'function','assessment factory is available');

const gcd=(a,b)=>{while(b!==0)[a,b]=[b,a%b];return Math.abs(a);};
let questions=0;
const denominators=pack('Independent mathematical regression','common_den');
assert.equal(denominators.independent.variants.length,6);

for(let i=1;i<=6;i++){
  const a=i+1,b=i+3,expected=a*b/gcd(a,b);
  const variant=denominators.independent.variants[i-1];
  const actual=variant.tasks[0];
  assert.equal(actual.answer,expected+'x, x≠0','LCM answer for variant '+i);
  assert.match(actual.text,/Наименьший общий знаменатель/,'requested denominator is minimal');
  assert.equal(expected%a,0,'denominator divisible by '+a);
  assert.equal(expected%b,0,'denominator divisible by '+b);
  for(let candidate=1;candidate<expected;candidate++){
    assert.ok(candidate%a!==0||candidate%b!==0,'smaller common denominator for variant '+i);
  }
  questions++;
}

const sameDen=pack('Reference clarity regression','same_den');
for(let i=1;i<=6;i++){
  const tasks=sameDen.control.variants[i-1].tasks;
  assert.match(tasks[2].text,/3\/\(x−\d+\)/,'task 3 has the referenced fraction');
  assert.match(tasks[4].text,/из задания 3 этого варианта/,'task 5 references task 3');
  assert.equal(tasks[4].answer,'x ≠ '+(i+1),'domain matches task 3');
  questions++;
}

const kinds=['classify','domain','zero','property','cancel','same_den','common_den','diff_den','multiply','power','divide','transform1','transform2','inverse','review'];
let variants=0;
for(const kind of kinds){
  const assessment=pack('Full topic variants',kind);
  for(const [part,maxScore,expectedCount] of [['independent',10,6],['control',14,7]]){
    const set=assessment[part];
    assert.equal(set.maxScore,maxScore,kind+'/'+part+' maximum score');
    assert.equal(set.variants.length,6,kind+'/'+part+' variant count');
    for(const variant of set.variants){
      assert.equal(variant.tasks.length,expectedCount,kind+'/'+part+' task count');
      assert.equal(variant.tasks.reduce((sum,t)=>sum+t.points,0),maxScore,kind+'/'+part+' score');
      for(const item of variant.tasks){
        assert.ok(item.text&&item.answer,'non-empty task and answer');
        assert.doesNotMatch(item.text,/\b1\/\d+x\b/,'denominator needs explicit parentheses');
      }
      variants++;
      questions+=variant.tasks.length;
    }
  }
}
console.log('Grade 8 rational fractions audit: PASS; '+variants+' variants; '+questions+' checked task fields and targeted math invariants.');
