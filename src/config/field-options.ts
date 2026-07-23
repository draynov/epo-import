/**
 * Справочни данни - опции за select полета
 * Извлечени от API документацията
 */

import { FieldOption, FieldOptionGroup } from "@/types";

export const ACTUAL_POSITIONS: FieldOption[] = [
  { value: "0", label: "Директор - училище" },
  { value: "1", label: "Заместник-директор - училище" },
  { value: "2", label: "Психолог" },
  { value: "3", label: "Учител" },
  { value: "4", label: "Възпитател" },
  { value: "5", label: "Треньор" },
  { value: "6", label: "Директор - детска градина" },
  { value: "7", label: "Заместник-директор - детска градина" },
  { value: "8", label: "Педагогически съветник" },
  { value: "9", label: "Логопед" },
  { value: "10", label: "Рехабилитатор" },
  { value: "11", label: 'Ръководител направление "ИКТ"' },
  { value: "12", label: "Корепетитор" },
  { value: "13", label: "Хореограф" },
  { value: "14", label: "Директор - център за развитие" },
  { value: "15", label: "Заместник-директор - център за развитие" },
  { value: "16", label: "Старши учител" },
  { value: "17", label: "Друга" },
  { value: "18", label: "Ресурсен учител" },
  { value: "19", label: "Директор на център за личностно развитие" },
  { value: "20", label: "Зам. директор на център за личностно развитие" },
  {
    value: "21",
    label: "Директор на център за специална образователна подкрепа",
  },
  {
    value: "22",
    label: "Зам. директор на център за специална образователна подкрепа",
  },
  { value: "23", label: "Социален педагог" },
  { value: "24", label: "Старши учител на деца и ученици с УИ" },
  { value: "25", label: "Старши възпитател" },
  { value: "26", label: "Директор на ЦПЛР" },
  { value: "27", label: "Директор на РЦПППО" },
  { value: "28", label: "Главен учител" },
];

export const INSTITUTION_TYPES: FieldOption[] = [
  { value: "0", label: "Училище" },
  { value: "1", label: "Детска градина" },
  { value: "2", label: "ЦСОП" },
  { value: "3", label: "ЦПЛР" },
  { value: "4", label: "РЦПППО" },
];

export const EDUCATION_TYPES: FieldOption[] = [
  { value: "0", label: "Начално" },
  { value: "1", label: "Основно" },
  { value: "2", label: "Средно" },
  { value: "3", label: "Полувисше" },
  { value: "4", label: "Висше - бакалавър" },
  { value: "5", label: "Висше - магистър" },
  { value: "6", label: "ОНС Доктор" },
  { value: "7", label: "Доктор на науките" },
];

export const PKS_LEVELS: FieldOption[] = [
  { value: "0", label: "Без степен" },
  { value: "1", label: "1-ва степен" },
  { value: "2", label: "2-ра степен" },
  { value: "3", label: "3-та степен" },
  { value: "4", label: "4-та степен" },
  { value: "5", label: "5-та степен" },
];

export const CREDIT_DURATIONS: FieldOption[] = [
  { value: "0", label: "8" },
  { value: "1", label: "16" },
  { value: "2", label: "32" },
  { value: "3", label: "48" },
  { value: "4", label: "30" },
  { value: "5", label: "200" },
];

export const CREDIT_QUANTITIES: FieldOption[] = [
  { value: "0", label: "0.5 кредита" },
  { value: "1", label: "1 кредит" },
  { value: "2", label: "2 кредита" },
  { value: "3", label: "3 кредита" },
  { value: "4", label: "1.5 кредита" },
  { value: "5", label: "12.5 кредита" },
];

export const QUALIFICATION_TYPES: FieldOption[] = [
  { value: "0", label: "Професионална квалификация" },
  { value: "1", label: "Квалификационен курс" },
  { value: "2", label: "Семинар" },
  { value: "3", label: "Конференция" },
  { value: "4", label: "Обучителен курс" },
  { value: "5", label: "Специализация" },
  { value: "6", label: "Удостоверение" },
  { value: "7", label: "Педагогическа правоспособност" },
  { value: "8", label: "Сертификат" },
  { value: "9", label: "Уебинар" },
];

export const LANGUAGES: FieldOption[] = [
  { value: "0", label: "Английски език" },
  { value: "1", label: "Немски език" },
  { value: "2", label: "Испански език" },
  { value: "3", label: "Френски език" },
  { value: "4", label: "Руски език" },
  { value: "5", label: "Японски език" },
  { value: "6", label: "Корейски език" },
  { value: "7", label: "Португалски език" },
  { value: "8", label: "Словашки език" },
  { value: "9", label: "Китайски език" },
  { value: "10", label: "Арабски език" },
  { value: "11", label: "Беларуски език" },
  { value: "12", label: "Датски език" },
  { value: "13", label: "Гръцки език" },
  { value: "14", label: "Естонски език" },
  { value: "15", label: "Ирландски език" },
  { value: "16", label: "Иврит" },
  { value: "17", label: "Хинди" },
  { value: "18", label: "Хърватски език" },
  { value: "19", label: "Италиански език" },
  { value: "20", label: "Латински език" },
  { value: "21", label: "Люксембургски език" },
  { value: "22", label: "Македонски език" },
  { value: "23", label: "Холандски език" },
  { value: "24", label: "Норвежки език" },
  { value: "25", label: "Румънски език" },
  { value: "26", label: "Словенски език" },
  { value: "27", label: "Албански език" },
  { value: "28", label: "Турски език" },
  { value: "29", label: "Украински език" },
];

export const LANGUAGE_LEVELS: FieldOption[] = [
  { value: "0", label: "А1 (Основно ниво на владеене)" },
  { value: "1", label: "А2 (Основно ниво на владеене)" },
  { value: "2", label: "B1 (Самостоятелно ниво на владеене)" },
  { value: "3", label: "B2 (Самостоятелно ниво на владеене)" },
  { value: "4", label: "C1 (Свободно ниво на владеене)" },
  { value: "5", label: "C2 (Свободно ниво на владеене)" },
];

export const YES_NO_OPTIONS: FieldOption[] = [
  { value: "1", label: "Да" },
  { value: "0", label: "Не" },
];

export const AUTHORSHIP_TYPES: FieldOption[] = [
  { value: "0", label: "Учебник" },
  { value: "1", label: "Учебно помагало" },
  { value: "2", label: "Монография" },
  { value: "3", label: "Методическо пособие" },
  { value: "4", label: "Речници" },
  { value: "5", label: "Сборник материали" },
  { value: "6", label: "Статия във вестници" },
  { value: "7", label: "Статия" },
  { value: "8", label: "Друго" },
  { value: "9", label: "Програма за обучение" },
  { value: "10", label: "Изследване" },
  { value: "11", label: "Образователна платформа" },
  { value: "12", label: "Публикация" },
  { value: "20", label: "Видео" },
];

export const AUTHORSHIP_ROLES: FieldOption[] = [
  { value: "0", label: "Автор" },
  { value: "1", label: "Съавтор" },
];

export const FORUM_TYPES: FieldOption[] = [
  { value: "0", label: "Педагогическа среща" },
  { value: "1", label: "Семинар" },
  { value: "2", label: "Конференция" },
];

export const CLASS_LEVELS: FieldOption[] = [
  { value: "1", label: "1 клас" },
  { value: "2", label: "2 клас" },
  { value: "3", label: "3 клас" },
  { value: "4", label: "4 клас" },
  { value: "5", label: "5 клас" },
  { value: "6", label: "6 клас" },
  { value: "7", label: "7 клас" },
  { value: "8", label: "8 клас" },
  { value: "9", label: "9 клас" },
  { value: "10", label: "10 клас" },
  { value: "11", label: "11 клас" },
  { value: "12", label: "12 клас" },
  { value: "20", label: "Повече от един клас" },
];

export const GROUP_TYPES: FieldOption[] = [
  { value: "0", label: "Първа група" },
  { value: "1", label: "Втора група" },
  { value: "2", label: "Трета група" },
  { value: "3", label: "Първа подготвителна група (ПГ-5г.)" },
  { value: "4", label: "Втората подготвителна група (ПГ-6г.)" },
  { value: "5", label: "Подготвителна група" },
  { value: "6", label: "Повече от една група" },
];

/**
 * Компетентности с групиране (optgroups)
 * Групи: Умения (0-6), Педагогически (7-16), Социални и граждански (17-21),
 * Управленски (22-27), Специални (28-31)
 */
export const COMPETENCES: FieldOptionGroup[] = [
  {
    label: "Умения",
    options: [
      { value: "0", label: "Социални умения" },
      { value: "1", label: "Организационни умения" },
      { value: "2", label: "Технически умения" },
      { value: "3", label: "Когнитивно-базирани умения" },
      { value: "4", label: "Артистични умения" },
      { value: "5", label: "Спортни умения" },
      { value: "6", label: "Умения (общо)" },
    ],
  },
  {
    label: "Педагогически компетентности",
    options: [
      { value: "7", label: "Първоначална професионална подготовка" },
      { value: "8", label: "Планиране на урок или на педагогическа ситуация" },
      { value: "9", label: "Организиране и управление на образователния процес" },
      { value: "10", label: "Оценяване на напредъка на децата/учениците" },
      { value: "11", label: "Управление на процесите в отделни групи или паралелки" },
      { value: "12", label: "Kариерно ориентиране и консултиране" },
      { value: "13", label: "Логопедична дейност" },
      { value: "14", label: "Оценка и диагностика на комуникативните нарушения" },
      { value: "15", label: "Педагогически умения (общо)" },
      { value: "16", label: "Професионално-педагогически" },
    ],
  },
  {
    label: "Социални и граждански компетентности",
    options: [
      { value: "17", label: "Работа в екип" },
      { value: "18", label: "Работа с родители и други заинтересовани страни" },
      { value: "19", label: "Социални и граждански компетентности (общо)" },
      { value: "20", label: "Определяне и постигане на цели" },
      { value: "21", label: "Ориентиране към непрекъснато професионално развитие" },
    ],
  },
  {
    label: "Управленски компетентности",
    options: [
      { value: "22", label: "Управленски компетентности (общо)" },
      { value: "23", label: "Административна и правна култура" },
      { value: "24", label: "Планиране, организиране и контрол" },
      { value: "25", label: "Управление на ресурси" },
      { value: "26", label: "Участие в комисии по атестиране" },
      { value: "27", label: "Участие в дейността на Педагогическия съвет" },
    ],
  },
  {
    label: "Специални компетентности",
    options: [
      { value: "28", label: "Диагностични и консултативни компетентности" },
      { value: "29", label: "Организационни компетентности" },
      { value: "30", label: "Свързани с рехабилитация на слуха и говора" },
      { value: "31", label: "Специални компетентности (общо)" },
    ],
  },
];

/**
 * Helper: Намира името на групата по стойността на компетентността
 */
export function getCompetenceGroup(value: string | number): string | null {
  const valueStr = String(value);
  for (const group of COMPETENCES) {
    const found = group.options.find(opt => String(opt.value) === valueStr);
    if (found) {
      return group.label;
    }
  }
  return null;
}
