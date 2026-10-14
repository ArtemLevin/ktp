(function(){
'use strict';
const S=window.KTP_LESSON_SERIES;
if(!S||!window.KTP_G11_VECTOR_SCENES)throw new Error('Vector scenes and lesson series required');
Object.assign(S.spatialScenes,window.KTP_G11_VECTOR_SCENES);
})();
