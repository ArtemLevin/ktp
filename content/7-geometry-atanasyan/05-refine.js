(function(){
'use strict';
const c=window.KTP_CONTENT?.['7-geometry-atanasyan::4'];if(!c?.geometryScenes)return;
const symmetry=c.geometryScenes['axial-symmetry'];
if(symmetry){
 symmetry.objects=[
  {type:'line',points:['U','V'],style:'emphasis'},
  {type:'segment',points:['P','O'],ticks:1},
  {type:'segment',points:['O','Q'],ticks:1},
  {type:'rightAngle',vertex:'O',arms:['P','U']}
 ];
}
const lineCircle=c.geometryScenes['line-circle'];
if(lineCircle){
 lineCircle.points.N1=[610,55];
 lineCircle.points.N2=[610,185];
}
})();
