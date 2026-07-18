/**
 * Секция 1: Обща информация
 * 5 подсекции
 */

import { PortfolioSectionDefinition } from "@/types";
import * as OPTIONS from "../field-options";

export const SECTION_1_GENERAL_INFO: PortfolioSectionDefinition = {
  sectionId: "section-1",
  title: "Обща информация",
  description: "Основна информация за учителя и трудов стаж",
  order: 1,
  subsections: [
    // 1.1. Основна информация (direct_fields)
    {
      subsectionId: "basic-info",
      sectionId: "section-1",
      type: "direct_fields",
      title: "Основна информация",
      description: "Име, контакти и лични данни",
      order: 1,
      endpoint: {
        cmd: "portfolio",
        method: "POST",
      },
      fields: [
        {
          key: "portfolio_name",
          label: "Име",
          type: "text",
          required: true,
          maxLength: 150,
        },
        {
          key: "portfolio_surname",
          label: "Презиме",
          type: "text",
          required: false,
          maxLength: 150,
        },
        {
          key: "portfolio_family",
          label: "Фамилия",
          type: "text",
          required: false,
          maxLength: 150,
        },
        {
          key: "nationality",
          label: "Националност",
          type: "text",
          required: false,
          maxLength: 150,
        },
        {
          key: "email",
          label: "E-mail",
          type: "text",
          required: false,
          maxLength: 150,
        },
        {
          key: "phone",
          label: "Телефон",
          type: "text",
          required: false,
          maxLength: 50,
        },
      ],
    },

    // 1.2. Трудов стаж (direct_fields)
    {
      subsectionId: "work-experience",
      sectionId: "section-1",
      type: "direct_fields",
      title: "Трудов стаж",
      description: "Общ и учителски стаж в години",
      order: 2,
      endpoint: {
        cmd: "portfolio",
        method: "POST",
      },
      fields: [
        {
          key: "internship_total",
          label: "Общ стаж в години",
          type: "text",
          required: false,
          maxLength: 150,
        },
        {
          key: "internship_teaching",
          label: "Учителски стаж в години",
          type: "text",
          required: false,
          maxLength: 150,
        },
      ],
    },

    // 1.3. Актуална длъжност (direct_fields)
    {
      subsectionId: "current-position",
      sectionId: "section-1",
      type: "direct_fields",
      title: "Актуална длъжност",
      description: "Текуща позиция и институция",
      order: 3,
      endpoint: {
        cmd: "portfolio",
        method: "POST",
      },
      fields: [
        {
          key: "actual_position",
          label: "Заемана длъжност в момента",
          type: "select",
          required: false,
          options: OPTIONS.ACTUAL_POSITIONS,
        },
        {
          key: "actual_position_other",
          label: "Друга заемана длъжност",
          type: "text",
          required: false,
          maxLength: 150,
          conditionalOn: {
            field: "actual_position",
            value: "17", // "Друга"
          },
        },
        {
          key: "actual_type",
          label: "Тип на институцията",
          type: "select",
          required: false,
          options: OPTIONS.INSTITUTION_TYPES,
        },
        {
          key: "actual_name",
          label: "Име на институцията",
          type: "text",
          required: false,
          maxLength: 150,
        },
      ],
    },

    // 1.4. История на длъжностите (record_list)
    {
      subsectionId: "position-history",
      sectionId: "section-1",
      type: "record_list",
      title: "История на длъжностите",
      description: "История на заеманите длъжности и позиции",
      order: 4,
      displayMode: "table",
      allowMultipleRecords: true,
      endpoint: {
        cmd: "positions",
        method: "POST",
      },
      fields: [
        {
          key: "mesec_from",
          label: "Месец от",
          type: "number",
          required: false,
          min: 1,
          max: 12,
        },
        {
          key: "godina_from",
          label: "Година от",
          type: "number",
          required: true,
          min: 1950,
          max: 2100,
        },
        {
          key: "now_to",
          label: "До сега",
          type: "checkbox",
          required: false,
          description: "Ако е отметнато, периодът до не се показва",
        },
        {
          key: "mesec_to",
          label: "Месец до",
          type: "number",
          required: false,
          min: 1,
          max: 12,
        },
        {
          key: "godina_to",
          label: "Година до",
          type: "number",
          required: false,
          min: 1950,
          max: 2100,
        },
        {
          key: "institution",
          label: "Институция",
          type: "text",
          required: true,
          maxLength: 150,
        },
        {
          key: "position",
          label: "Длъжност",
          type: "text",
          required: true,
          maxLength: 150,
        },
      ],
    },

    // 1.5. Любим цитат (direct_fields)
    {
      subsectionId: "favorite-quote",
      sectionId: "section-1",
      type: "direct_fields",
      title: "Любим цитат",
      description: "Любим професионален цитат",
      order: 5,
      endpoint: {
        cmd: "portfolio",
        method: "POST",
      },
      fields: [
        {
          key: "citat",
          label: "Любим цитат",
          type: "textarea",
          required: false,
          maxLength: 255,
        },
      ],
    },
  ],
};
