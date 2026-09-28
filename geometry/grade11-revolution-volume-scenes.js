(function(global){
'use strict';
const scene=(lesson,title,ariaLabel,solid,caption,section=null,camera={yaw:-35,pitch:25,scale:64,origin:[210,205]},math={})=>({
  lesson,title,ariaLabel,solid,section,camera,caption,math
});

global.KTP_G11_REVOLUTION_VOLUME_SCENES={
  'g11-volrev-22-cylinder':scene(
    22,
    'Объём цилиндра',
    'Прямой круговой цилиндр радиуса 1,2 и высоты 2,4; показано осевое сечение',
    {type:'cylinder',radius:1.2,height:2.4},
    'Основание имеет площадь πr², поэтому объём зависит от истинных r и h, а не от экранной формы эллипса.',
    {type:'axial'},
    {yaw:-35,pitch:24,scale:62,origin:[210,215]},
    {focus:'cylinder-volume',radius:1.2,height:2.4}
  ),
  'g11-volrev-23-cylinder-cavity':scene(
    23,
    'Полость в цилиндрическом теле',
    'Цилиндр радиуса 1,4 и высоты 2,2; осевое сечение используется для модели сквозной цилиндрической полости',
    {type:'cylinder',radius:1.4,height:2.2},
    'Визуальная сцена задаёт внешнее тело. Радиус внутренней полости хранится как математический параметр и вычитается по объёму.',
    {type:'axial'},
    {yaw:-35,pitch:24,scale:60,origin:[210,210]},
    {focus:'cylinder-cavity',outerRadius:1.4,innerRadius:0.55,height:2.2}
  ),
  'g11-volrev-24-cone':scene(
    24,
    'Объём конуса',
    'Прямой круговой конус радиуса 1,4 и высоты 2,1 с осевым сечением',
    {type:'cone',radius:1.4,height:2.1},
    'Конус с теми же основанием и высотой имеет треть объёма соответствующего цилиндра.',
    {type:'axial'},
    {yaw:-35,pitch:25,scale:62,origin:[210,220]},
    {focus:'cone-volume',radius:1.4,height:2.1}
  ),
  'g11-volrev-25-frustum':scene(
    25,
    'Объём усечённого конуса',
    'Усечённый конус с радиусами оснований 1,4 и 0,7 и высотой 2',
    {type:'frustum',radius:1.4,topRadius:0.7,height:2},
    'Формула объёма проверяется через разность двух подобных конусов и предельные случаи.',
    null,
    {yaw:-35,pitch:24,scale:63,origin:[210,210]},
    {focus:'frustum-volume',bottomRadius:1.4,topRadius:0.7,height:2}
  ),
  'g11-volrev-26-ball':scene(
    26,
    'Объём шара',
    'Шар радиуса 1,3; экваториальная окружность показана как пространственная проекция',
    {type:'ball',radius:1.3},
    'Объём шара масштабируется как R³; площадь его границы — сферы — как R².',
    null,
    {yaw:-35,pitch:25,scale:78,origin:[210,145]},
    {focus:'ball-volume',radius:1.3}
  ),
  'g11-volrev-27-segment':scene(
    27,
    'Шаровой сегмент',
    'Шар радиуса 1,4, отсечённый плоскостью на расстоянии 0,4 от центра',
    {type:'ball',radius:1.4},
    'Для верхнего сегмента высота h=R−d. Радиус круга сечения вычисляется из R²=d²+ρ².',
    {type:'sphere-plane',normal:[0,0,1],offset:0.4},
    {yaw:-35,pitch:25,scale:72,origin:[210,145]},
    {focus:'spherical-segment',radius:1.4,distance:0.4}
  ),
  'g11-volrev-28-sphere-area-volume':scene(
    28,
    'Площадь сферы и объём шара',
    'Сфера радиуса 1,35; показана экваториальная окружность',
    {type:'sphere',radius:1.35},
    'Связь S=4πR² и V=4πR³/3 помогает различать квадратную и кубическую размерности.',
    null,
    {yaw:-35,pitch:25,scale:76,origin:[210,145]},
    {focus:'sphere-area-ball-volume',radius:1.35}
  ),
  'g11-volrev-29-section':scene(
    29,
    'Сечение шара и объём части',
    'Шар радиуса 1,5; секущая плоскость находится на расстоянии 0,9 от центра',
    {type:'ball',radius:1.5},
    'Сначала восстанавливаются ρ=√(R²−d²) и h=R−d, затем выбирается формула объёма части шара.',
    {type:'sphere-plane',normal:[0,0,1],offset:0.9},
    {yaw:-35,pitch:25,scale:68,origin:[210,150]},
    {focus:'sphere-section-volume',radius:1.5,distance:0.9}
  ),
  'g11-volrev-30-similarity':scene(
    30,
    'Подобные тела вращения',
    'Цилиндр радиуса 1 и высоты 1,5 как базовая модель для масштабирования',
    {type:'cylinder',radius:1,height:1.5},
    'При линейном коэффициенте k площади меняются в k² раз, объёмы — в k³ раз.',
    null,
    {yaw:-35,pitch:24,scale:72,origin:[210,205]},
    {focus:'similarity',k:1.5}
  ),
  'g11-volrev-31-composite':scene(
    31,
    'Составное тело',
    'Цилиндр радиуса 1,2 и высоты 1,8 как нижняя часть модели цилиндр плюс полусфера',
    {type:'cylinder',radius:1.2,height:1.8},
    'Составная задача решается декомпозицией: объёмы частей складываются или вычитаются; поверхности контакта на объём не влияют.',
    null,
    {yaw:-35,pitch:24,scale:67,origin:[210,205]},
    {focus:'composite-volume',cylinderRadius:1.2,cylinderHeight:1.8,hemisphereRadius:1.2}
  ),
  'g11-volrev-32-diagnostic':scene(
    32,
    'Диагностика выбора формулы',
    'Конус радиуса 1,2 и высоты 1,6; осевое сечение образует прямоугольный треугольник 1,2–1,6–2',
    {type:'cone',radius:1.2,height:1.6},
    'Сначала определяется истинная высота и тип тела, затем формула объёма; образующая не подменяет высоту.',
    {type:'axial'},
    {yaw:-35,pitch:25,scale:70,origin:[210,220]},
    {focus:'diagnostic',radius:1.2,height:1.6,slant:2}
  )
};
})(window);
