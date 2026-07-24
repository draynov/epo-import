/**
 * Секция 3: Практическо приложение
 * 6 подсекции
 */

import { PortfolioSectionDefinition } from "@/types";
import * as OPTIONS from "../field-options";

export const SECTION_3_PRACTICAL: PortfolioSectionDefinition = {
  sectionId: "section-3",
  title: "Практическо приложение",
  description: "Учебна работа, методи и практики",
  order: 3,
  subsections: [
    // 3.1. Учебни предмети и класове (record_list)
    {
      subsectionId: "classes",
      sectionId: "section-3",
      type: "record_list",
      title: "Учебни предмети и класове",
      description: "Преподавани предмети и класове",
      order: 1,
      displayMode: "table",
      allowMultipleRecords: true,
      endpoint: {
        cmd: "classes",
        method: "POST",
      },
      fields: [
        {
          key: "name",
          label: "Наименование на предмета",
          type: "text",
          required: true,
          maxLength: 150,
        },
        {
          key: "class",
          label: "Клас",
          type: "select",
          required: true,
          options: OPTIONS.CLASS_LEVELS,
          description: "Изберете клас или 'Повече от един клас'",
        },
        {
          key: "multiclass",
          label: "Множество класове",
          type: "multiselect",
          required: false,
          options: OPTIONS.CLASS_LEVELS.filter((o) => o.value !== "20"),
          description: "Показва се само ако е избрано 'Повече от един клас'",
          conditionalOn: {
            field: "class",
            value: "20",
          },
        },
        {
          key: "years",
          label: "Учебни години",
          type: "multiselect",
          required: true,
          options: OPTIONS.ACADEMIC_YEARS,
          description: "Изберете учебни години",
        },
      ],
    },

    // 3.2. Групи (record_list)
    {
      subsectionId: "groups",
      sectionId: "section-3",
      type: "record_list",
      title: "Групи",
      description: "Детски групи (за детска градина)",
      order: 2,
      displayMode: "table",
      allowMultipleRecords: true,
      endpoint: {
        cmd: "groups",
        method: "POST",
      },
      fields: [
        {
          key: "group",
          label: "Група",
          type: "select",
          required: true,
          options: OPTIONS.GROUP_TYPES,
        },
        {
          key: "multigroup",
          label: "Множество групи",
          type: "multiselect",
          required: false,
          options: OPTIONS.GROUP_TYPES.filter((o) => o.value !== "6"),
          conditionalOn: {
            field: "group",
            value: "6",
          },
        },
        {
          key: "name",
          label: "Име на групата",
          type: "text",
          required: true,
          maxLength: 255,
        },
        {
          key: "years",
          label: "Учебни години",
          type: "multiselect",
          required: true,
          options: OPTIONS.ACADEMIC_YEARS,
          description: "Изберете учебни години",
        },
      ],
    },

    // 3.3. Умения и компетентности (record_list)
    {
      subsectionId: "competences",
      sectionId: "section-3",
      type: "record_list",
      title: "Умения и компетентности",
      description: "Професионални умения и компетенции",
      order: 3,
      displayMode: "list",
      allowMultipleRecords: true,
      endpoint: {
        cmd: "competences",
        method: "POST",
      },
      fields: [
        {
          key: "competence",
          label: "Компетентност",
          type: "select",
          required: true,
          options: OPTIONS.COMPETENCES,
        },
        {
          key: "content",
          label: "Описание",
          type: "textarea",
          required: true,
        },
      ],
    },

    // 3.4. Методи на преподаване (direct_fields)
    {
      subsectionId: "teaching-methods",
      sectionId: "section-3",
      type: "direct_fields",
      title: "Методи на преподаване",
      description: "Приложени методи и подходи",
      order: 4,
      endpoint: {
        cmd: "portfolio",
        method: "POST",
      },
      fields: [
        {
          key: "teachingmethods",
          label: "Методи на преподаване",
          type: "textarea",
          required: false,
        },
      ],
    },

    // 3.5. Философия на преподаване (direct_fields)
    {
      subsectionId: "teaching-philosophy",
      sectionId: "section-3",
      type: "direct_fields",
      title: "Философия на преподаване",
      description: "Педагогическа философия и подход",
      order: 5,
      endpoint: {
        cmd: "portfolio",
        method: "POST",
      },
      fields: [
        {
          key: "teachingphilosophy",
          label: "Философия на преподаване",
          type: "textarea",
          required: false,
        },
      ],
    },

    // 3.6. Добри практики (record_list)
    {
      subsectionId: "best-practices",
      sectionId: "section-3",
      type: "record_list",
      title: "Добри практики",
      description: "Иновативни и добри практики",
      order: 6,
      displayMode: "list",
      allowMultipleRecords: true,
      endpoint: {
        cmd: "practices",
        method: "POST",
      },
      fields: [
        {
          key: "name",
          label: "Наименование",
          type: "text",
          required: true,
          maxLength: 150,
        },
        {
          key: "content",
          label: "Описание",
          type: "textarea",
          required: false,
        },
      ],
    },
  ],
};
