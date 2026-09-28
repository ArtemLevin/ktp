(function(){
'use strict';
const S=window.KTP_LESSON_SERIES;
if(!S)throw new Error('lesson series required');
if(!window.KTP_G11_VOLUME_SCENES)throw new Error('grade 11 volume scenes required');
Object.assign(S.spatialScenes,window.KTP_G11_VOLUME_SCENES);
})();
