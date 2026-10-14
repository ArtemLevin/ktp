(function(){
'use strict';
const spatial={},revolution={};
const copy=(target,id,source,lesson,title,caption)=>{if(!source)throw Error('Review source scene is missing: '+id);target[id]={...source,lesson,title,caption,ariaLabel:title+'. '+caption};};
const P=window.KTP_G11_VOLUME_SCENES,R=window.KTP_G11_REVOLUTION_VOLUME_SCENES,V=window.KTP_G11_VECTOR_SCENES,C=window.KTP_G11_COORDINATE_SCENES;
copy(revolution,'g11-review-57-surface',R['g11-volrev-25-frustum'],57,'Поверхности и развёртки','Внешняя поверхность усечённого конуса состоит из боковой поверхности и двух кругов. Сначала найдите истинную образующую.');
copy(revolution,'g11-review-58-section',R['g11-volrev-29-section'],58,'Сечение шара','Радиус сечения находится через прямоугольный треугольник: ρ²=R²−d². Расстояние d измеряется от центра шара.');
copy(spatial,'g11-review-59-polyhedron',P['g11-vol-05-pyramid'],59,'Основание и высота пирамиды','Перпендикулярная высота связывает площадь основания с объёмом: V=Sоснh/3. Длина наклонного ребра не заменяет высоту.');
copy(revolution,'g11-review-60-round',R['g11-volrev-24-cone'],60,'Объём конуса','Площадь основания умножается на перпендикулярную высоту и на 1/3. Сравните с цилиндром на том же основании.');
copy(spatial,'g11-review-61-composite',P['g11-vol-09-composite'],61,'Составная модель','Укажите части и их пересечения. Объёмы неперекрывающихся частей складываются; общие внутренние грани во внешней поверхности не учитываются.');
copy(spatial,'g11-review-62-vectors',V['g11-vector-43-midpoint'],62,'Середина и направленный отрезок','Разложите искомое перемещение по заданным векторам и проверьте направление. Затем сопоставьте с координатами концов.');
copy(spatial,'g11-review-63-metric',C['g11-coordinate-53-distance'],63,'Рабочий перпендикуляр','Расстояние — длина перпендикуляра PH. При координатном решении нормируйте нормаль и проверьте, что H принадлежит плоскости.');
spatial['g11-review-64-plane']={lesson:64,title:'Плоский треугольник внутри пространственной задачи',ariaLabel:'Прямоугольный треугольник OAB с катетами 3 и 4, гипотенузой 5.',caption:'Плоская рабочая задача: OA=3, OB=4, AB=5; площадь равна 6. Для другого масштаба длины, площади и объёмы меняются по разным законам.',points:{O:[0,0,0],A:[3,0,0],B:[0,4,0]},objects:[{type:'segment',points:['O','A']},{type:'segment',points:['O','B']},{type:'segment',points:['A','B'],style:'emphasis'}],camera:{yaw:0,pitch:0,scale:40,origin:[130,230]},viewBox:[0,0,420,290],math:{sides:[3,4,5],area:6},labels:{O:{dx:-15,dy:18},A:{dy:18},B:{dy:-10}}};
copy(spatial,'g11-review-65-proof',V['g11-vector-44-dependent'],65,'Контрпример к единственности','При c⃗=a⃗+b⃗ тройка компланарна. Один вектор имеет разные разложения; вектор вне плоскости по этой тройке не раскладывается.');
copy(revolution,'g11-review-66-practical',R['g11-volrev-23-cylinder-cavity'],66,'Практическая геометрическая модель','Рисунок показывает внешнюю форму. При вычислении вместимости отдельно учитывайте полости и долю заполнения, затем переводите кубические единицы в литры.');
copy(spatial,'g11-review-67-diagnostic',P['g11-vol-02-box'],67,'Итоговая диагностика выбора метода','Для каждого задания сначала назовите объект, искомую величину и условия формулы. Три взаимно перпендикулярных измерения этой схемы дают V=abc.');
copy(spatial,'g11-review-68-correction',C['g11-coordinate-56-diagnostic'],68,'Пример адресной коррекции','Здесь угол векторов — 135°, угол прямых — 45°. После разбора ошибки выберите свой домен и решите две новые задачи в тренажёре.');
window.KTP_G11_REVIEW_SCENES={spatial,revolution};
})();
