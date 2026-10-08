(function(){
'use strict';
const root="../../../materials/top10/2026-10/";
const resources=[
  {
    "slug": "8a_l18",
    "row": "8-algebra-makarychev",
    "idx": 1,
    "local": "03",
    "n": 18,
    "grade": 8,
    "title": "Квадратные корни и уравнение x²=a",
    "files": [
      "8a_l18_10_student.pdf",
      "8a_l18_10_teacher.pdf",
      "8a_l18_54_student.pdf",
      "8a_l18_54_teacher.pdf",
      "8a_l18_10_strong_student.pdf",
      "8a_l18_10_strong_teacher.pdf",
      "8a_l18_54_strong_student.pdf",
      "8a_l18_54_strong_teacher.pdf"
    ]
  },
  {
    "slug": "7a_l17",
    "row": "7-algebra-makarychev",
    "idx": 0,
    "local": "17",
    "n": 17,
    "grade": 7,
    "title": "Текстовые задачи с помощью уравнений",
    "files": [
      "7a_l17_10_student.pdf",
      "7a_l17_10_teacher.pdf",
      "7a_l17_54_student.pdf",
      "7a_l17_54_teacher.pdf",
      "7a_l17_10_strong_student.pdf",
      "7a_l17_10_strong_teacher.pdf",
      "7a_l17_54_strong_student.pdf",
      "7a_l17_54_strong_teacher.pdf"
    ]
  },
  {
    "slug": "6m_l30",
    "row": "6-math-vilenkin",
    "idx": 1,
    "local": "12",
    "n": 30,
    "grade": 6,
    "title": "Сложение и вычитание дробей и смешанных чисел",
    "files": [
      "6m_l30_std_10_student.pdf",
      "6m_l30_std_10_teacher.pdf",
      "6m_l30_std_54_student.pdf",
      "6m_l30_std_54_teacher.pdf",
      "6m_l30_strong_10_student.pdf",
      "6m_l30_strong_10_teacher.pdf",
      "6m_l30_strong_54_student.pdf",
      "6m_l30_strong_54_teacher.pdf"
    ]
  },
  {
    "slug": "11a_l18",
    "row": "11-algebra-alimov",
    "idx": 1,
    "local": "02",
    "n": 18,
    "grade": 11,
    "title": "Производная и промежутки монотонности",
    "files": [
      "11a_l18_std_10_student.pdf",
      "11a_l18_std_10_teacher.pdf",
      "11a_l18_std_54_student.pdf",
      "11a_l18_std_54_teacher.pdf",
      "11a_l18_strong_10_student.pdf",
      "11a_l18_strong_10_teacher.pdf",
      "11a_l18_strong_54_student.pdf",
      "11a_l18_strong_54_teacher.pdf"
    ]
  },
  {
    "slug": "9a_l18",
    "row": "9-algebra-makarychev",
    "idx": 0,
    "local": "18",
    "n": 18,
    "grade": 9,
    "title": "Итоговая диагностика: числа и вычисления",
    "files": [
      "9a_l18_std_10_student.pdf",
      "9a_l18_std_10_teacher.pdf",
      "9a_l18_std_54_student.pdf",
      "9a_l18_std_54_teacher.pdf",
      "9a_l18_strong_10_student.pdf",
      "9a_l18_strong_10_teacher.pdf",
      "9a_l18_strong_54_student.pdf",
      "9a_l18_strong_54_teacher.pdf"
    ]
  }
];
const registry=window.KTP_LESSON_RESOURCE_PATCHES||(window.KTP_LESSON_RESOURCE_PATCHES={});
for(const pkg of resources){
  const key=pkg.row+"::"+pkg.idx+"::"+pkg.local;
  const list=pkg.files.map(file=>{
    const aud=file.includes("_teacher.pdf")?"teacher":"student";
    const strong=file.includes("strong");
    const count=/_10_/.test(file)?10:54;
    const line=strong?"для сильных":"стандартный";
    return {kind:"printable",audience:aud,label:count+" упражнений · "+line+" · "+(aud==="teacher"?"преподавателю":"учащимся"),format:aud==="teacher"?"PDF · ответы, решения":"PDF",title:pkg.title,href:root+pkg.slug+"/"+file};
  });
  registry[key]=[...(registry[key]||[]),...list];
}
})();
