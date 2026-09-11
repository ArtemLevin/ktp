(function(){
'use strict';
const input=document.getElementById('scale');
const out=document.getElementById('value');
function update(){
 if(out) out.textContent=input.value;
}
if(input) input.addEventListener('input',update);
update();
})();
