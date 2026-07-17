/**
 * Секция 6: Самооценка
 * 2 подсекции
 */

import { PortfolioSectionDefinition } from "@/types";

export const SECTION_6_SELF_ASSESSMENT: PortfolioSectionDefinition = {
  sectionId: "section-6",
  title: "Самооценка",
  description: "Рефлексия и бъдещи планове",
  order: 6,
  subsections: [
    // 6.1. Самонаблюдение (direct_fields)
    {
      subsectionId: "self-monitoring",
      sectionId: "section-6",
      type: "direct_fields",
      title: "Самонаблюдение",
      description: "Рефлексия върху практиката",
      order: 1,
      endpoint: {
        cmd: "portfolio",
        method: "POST",
      },
      fields: [
        {
          key: "selfmonitoring",
          label: "Самонаблюдение",
          type: "textarea",
          required: false,
        },
      ],
    },

    // 6.2. Бъдещи планове (direct_fields)
    {
      subsectionId: "future-plans",
      sectionId: "section-6",
      type: "direct_fields",
      title: "Бъдещи планове",
      description: "Професионално развитие и цели",
      order: 2,
      endpoint: {
        cmd: "portfolio",
        method: "POST",
      },
      fields: [
        {
          key: "futureplans",
          label: "Бъдещи планове",
          type: "textarea",
          required: false,
        },
      ],
    },
  ],
};
