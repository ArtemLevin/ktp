import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const assert=(v,m)=>{if(!v)throw new Error(m)};
const root=read('README.md'),lessons=read('lessons/README.md'),assessments=read('assessments/README.md'),plan=read('Plan.md'),map=read('content/7-geometry-atanasyan/content-map.md'),lessonPlan=read('lessons/7-geometry-atanasyan/lesson-plan.md');

assert(root.includes('Полностью завершены **8 линий**'),'README completed-line count');
assert(root.includes('**918 полноценных поурочных модулей**')&&root.includes('**64 тематических assessment-комплекта**'),'README totals');
const row=root.split('\n').find(line=>line.startsWith('| `7-geometry-atanasyan` |'))||'';
assert(row.includes('| 6/6 | 68/68 | 6/6 | **готово** |'),'README grade7 geometry completion row');
assert(root.includes('06` **«Повторение»**')&&root.includes('урок 67')&&root.includes('урок 68'),'README topic06 description');
assert(root.includes('Следующий содержательный этап — геометрия **8 класса по Атанасяну**'),'README grade8 handoff');

assert(lessons.includes('| `7-geometry-atanasyan` | 6/6 | 68/68 | 1–68 | **готово** |'),'lessons README completion row');
assert(lessons.includes('Всего опубликовано **918 полноценных поурочных модулей**'),'lessons README total');
assert(lessons.includes('06` **«Повторение»** — уроки 61–68'),'lessons README topic06');
assert(lessons.includes('учебным неделям **31–34**'),'lessons README weeks');

assert(assessments.includes('| `7-geometry-atanasyan` | 6/6 | **готово** |'),'assessment README completion row');
assert(assessments.includes('Всего опубликовано **64 тематических assessment-комплекта**'),'assessment README total');
assert(assessments.includes('06` **«Повторение»**')&&assessments.includes('6/6'),'assessment README topic06');
assert(assessments.includes('диапазон тем **01–06**'),'assessment navigation range docs');

assert(plan.includes('| `7-geometry-atanasyan` | **6/6** | **68/68** | **6/6** | готово |'),'Plan grade7 completion row');
for(const token of ['полностью завершённых линий: **8/17**','полностью готовых тематических серий: **64**','опубликованных уроков: **918**','тематических assessment-комплектов: **64**','оставшихся тематических каркасов: **57**'])assert(plan.includes(token),`Plan metric missing: ${token}`);
assert(plan.includes('### Тема 06 — «Повторение»')&&plan.includes('**Статус: полностью готово.**'),'Plan topic06 completion');
assert(plan.includes('## 3.3. 8 класс · Атанасян — `8-geometry-atanasyan`')&&plan.includes('**Следующая рабочая линия.**'),'Plan grade8 handoff');
assert(plan.includes('13 + 14 + 17 + 16 + 8'),'Plan grade8 KTP split');

const mapRow=map.split('\n').find(line=>line.startsWith('| 06 | Повторение |'))||'';
assert(mapRow.includes('26.04–20.05.2027')&&mapRow.includes('61–68')&&mapRow.includes('**full**'),'content map topic06 completion');
assert(map.includes('Следующей темы в линии 7 класса нет'),'content map terminal position');
assert(lessonPlan.includes('## 6. Повторение — 8 уроков (61–68)'),'lesson plan topic06 section');
assert(lessonPlan.includes('Источник: главы I–IV')&&lessonPlan.includes('глобальные учебные недели **31–34**'),'lesson plan source/weeks');

console.log('Grade 7 geometry topic 06 documentation QA passed: 6/6 series, 68/68 lessons, 64 assessments, grade8 handoff documented.');
