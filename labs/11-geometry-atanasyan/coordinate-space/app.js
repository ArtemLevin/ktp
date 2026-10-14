(function(){
'use strict';
const $=id=>document.getElementById(id),registry=window.KTP_CONTENT['11-geometry-atanasyan::4'].spatialScenes;
let mode='angle';
function render(){const t=Number($('t').value),state=window.KTP_COORDINATE_LAB_STATE(mode,t);$('tOut').textContent=String(t).replace('.',',');
 registry['coordinate-lab']=window.KTP_COORDINATE_EXPERIMENT(mode,t);const host=document.createElement('span');host.dataset.spatialScene='coordinate-lab';$('scene').replaceChildren(host);window.KTP_SPATIAL.renderAll();
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
 $('formula').textContent=mode==='angle'?'sin α=t/√(5+t²); α≈'+state.angle.toFixed(2).replace('.',',')+'°.':mode==='distance'?'d=|t|='+t+'. H(2;1;0).':'P′(2;1;'+(-t)+'); H — середина PP′.';
 $('observation').textContent=t===0?'P лежит в плоскости: расстояние и угол с плоскостью равны 0; отражение сохраняет точку.':mode==='motion'?'Зеркальная симметрия сохраняет расстояния; повторное отражение возвращает исходную точку.':'Увеличение высоты меняет расстояние линейно, угол — через отношение высоты к длине направления.';
 window.KTP_COORDINATE_LAB_CURRENT=state;
}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;render();}));$('t').addEventListener('input',render);$('onPlane').addEventListener('click',()=>{$('t').value=0;render();});$('reset').addEventListener('click',()=>{$('t').value=2;render();});render();
})();
