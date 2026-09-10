(function(){
'use strict';
const c=window.KTP_CONTENT?.['8-geometry-atanasyan::1'];
if(!c)return;
const has=(arr,text)=>Array.isArray(arr)&&arr.some(x=>String(x).includes(text));
if(!has(c.objectives,'равным углом'))c.objectives.splice(6,0,'Применять теорему об отношении площадей двух треугольников с равным углом через произведения сторон, заключающих эти углы.');
if(!has(c.expectedResults,'равных углов'))c.expectedResults.splice(6,0,'при равных углах сравнивает площади треугольников по произведениям сторон, заключающих эти углы');
if(!has(c.map,'Равный угол'))c.map.splice(5,0,'Равный угол и отношение площадей');
const equalAngleTitle='Треугольники с равным углом';
if(!c.theory?.some(x=>x.title===equalAngleTitle)){
 const i=c.theory.findIndex(x=>x.title==='Треугольники с общей высотой');
 const block={title:equalAngleTitle,html:'Если угол одного треугольника равен углу другого, то их площади относятся как произведения сторон, заключающих эти равные углы: <span class="formula">S₁/S₂=(a₁b₁)/(a₂b₂)</span>. Теорема особенно полезна, когда высоты неизвестны, зато известны две стороны при равных углах.'};
 c.theory.splice(i>=0?i+1:5,0,block);
}
if(!c.examples?.some(x=>x.title==='Равный угол и площади'))c.examples.splice(4,0,{title:'Равный угол и площади',problem:'У двух треугольников равны углы между указанными сторонами. В первом эти стороны равны 6 см и 8 см, во втором — 3 см и 4 см. Площадь второго треугольника 15 см². Найдите площадь первого.',idea:'При равных углах отношение площадей равно отношению произведений заключающих их сторон.',solution:'S₁/S₂=(6·8)/(3·4)=4, поэтому S₁=4·15=60 см².',check:'Произведение двух сторон первого треугольника в 4 раза больше, угол тот же.',answer:'60 см²'});
if(!c.practice?.standard?.some(x=>String(x.task).includes('углы между сторонами равны')))c.practice.standard.push({task:'У двух треугольников углы между сторонами равны. Заключающие их стороны равны 9 см и 12 см у первого, 6 см и 8 см у второго. Площадь второго равна 16 см². Найдите площадь первого.',answer:'36 см²'});
if(!c.diagnostic?.some(x=>String(x.task).includes('равны углы между сторонами')))c.diagnostic.splice(4,0,{task:'У двух треугольников равны углы между сторонами 5 см, 8 см и 10 см, 8 см соответственно. Найдите S₁:S₂.',answer:'1:2.'});
if(!c.homework?.optional?.some(x=>String(x.task).includes('равном угле')))c.homework.optional.push({task:'Объясните, как сравнить площади двух треугольников при равном угле, если известны две стороны каждого треугольника, заключающие этот угол.',answer:'Использовать S₁/S₂=(a₁b₁)/(a₂b₂).'});
if(!has(c.summary,'равном угле'))c.summary.splice(3,0,'При равном угле площади двух треугольников относятся как произведения сторон, заключающих этот угол.');
const pyth=c.geometryScenes?.pythagoras;if(pyth)pyth.ariaLabel='Прямоугольный треугольник ABC с прямым углом A, катетами AB и AC и гипотенузой BC.';
c.geometryScenes=c.geometryScenes||{};
if(!c.geometryScenes['pythagoras-area'])c.geometryScenes['pythagoras-area']={title:'Доказательство теоремы Пифагора площадями',ariaLabel:'Квадрат со стороной a плюс b разделён на четыре равных прямоугольных треугольника и центральный квадрат со стороной c.',viewBox:[0,0,400,380],points:{A:[50,40],B:[350,40],C:[350,340],D:[50,340],E:[230,40],F:[350,220],G:[170,340],H:[50,160]},labels:{A:false,B:false,C:false,D:false,E:false,F:false,G:false,H:false},objects:[{type:'polygon',points:['A','B','C','D']},{type:'polygon',points:['E','F','G','H']},{type:'segment',points:['E','A']},{type:'segment',points:['F','B']},{type:'segment',points:['G','C']},{type:'segment',points:['H','D']}],caption:'(a+b)²=4·ab/2+c², поэтому c²=a²+b².'};
const pt=c.theory?.find(x=>x.title==='Теорема Пифагора');
if(pt&&!String(pt.html).includes('pythagoras-area'))pt.html+=' <span data-geometry-scene="pythagoras-area"></span>';
if(!c.theory?.some(x=>x.title==='Пифагоровы треугольники')){
 const i=c.theory.findIndex(x=>x.title==='Обратная теорема Пифагора');
 c.theory.splice(i>=0?i+1:c.theory.length,0,{title:'Пифагоровы треугольники',html:'Прямоугольные треугольники, длины всех сторон которых выражаются целыми числами, называют <b>пифагоровыми</b>. Примеры троек длин: 3–4–5, 5–12–13, 8–15–17.'});
}
})();
