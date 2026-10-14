(function(){
'use strict';
const M=window.KTP_COORDINATE_MATH;
function state(mode,t){if(typeof t!=='number'||!Number.isFinite(t)||t<0||t>3)throw new RangeError('t from 0 to 3 required');
 const point=[2,1,t],plane=M.plane([0,0,1],0),foot=M.projectPlane(point,plane);
 return {mode,t,point,foot,distance:Math.abs(M.signedDistance(point,plane)),angle:M.linePlaneAngle(point,[0,0,1]),image:M.mirror(point,plane)};
}
window.KTP_COORDINATE_LAB_STATE=state;window.KTP_CONTENT={'11-geometry-atanasyan::4':{spatialScenes:{}}};
})();
