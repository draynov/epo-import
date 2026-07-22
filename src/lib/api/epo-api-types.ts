/**
 * EPO API Types and Constants
 * Based on https://epo.bg/api2/ documentation
 */

// API Configuration
export const EPO_API_CONFIG = {
  BASE_URL: 'https://epo.bg/api2/',
  TOKEN: 'RtFgjjkFLEkMPDKZizVhrEanhQiDnsFgfoyWLTGQyoNPkkMretxxjZYWLkjFRffjdwjJdMoWymZYpbBgVUsUHYQvKYwhfmWXCpau',
  DATE_FORMAT: 'yyyy-MM-dd',
} as const;

// Position types (actual_position) - array indices 0-28
export enum ActualPosition {
  DIRECTOR_SCHOOL = 0,                    // Директор - училище
  DEPUTY_DIRECTOR_SCHOOL = 1,             // Заместник-директор - училище
  PSYCHOLOGIST = 2,                       // Психолог
  TEACHER = 3,                            // Учител
  EDUCATOR = 4,                           // Възпитател
  TRAINER = 5,                            // Треньор
  DIRECTOR_KINDERGARTEN = 6,              // Директор - детска градина
  DEPUTY_DIRECTOR_KINDERGARTEN = 7,       // Заместник-директор - детска градина
  PEDAGOGICAL_ADVISOR = 8,                // Педагогически съветник
  SPEECH_THERAPIST = 9,                   // Логопед
  REHABILITATOR = 10,                     // Рехабилитатор
  ICT_DIRECTOR = 11,                      // Ръководител направление "ИКТ"
  TUTOR = 12,                             // Корепетитор
  CHOREOGRAPHER = 13,                     // Хореограф
  DIRECTOR_DEVELOPMENT_CENTER = 14,       // Директор - център за развитие
  DEPUTY_DIRECTOR_DEVELOPMENT_CENTER = 15,// Заместник-директор - център за развитие
  SENIOR_TEACHER = 16,                    // Старши учител
  OTHER = 17,                             // Друга
  RESOURCE_TEACHER = 18,                  // Ресурсен учител
  DIRECTOR_PERSONAL_DEVELOPMENT = 19,     // Директор на център за личностно развитие
  DEPUTY_DIRECTOR_PERSONAL_DEVELOPMENT = 20, // Зам. директор на център за личностно развитие
  DIRECTOR_SPECIAL_EDUCATION = 21,        // Директор на център за специална образователна подкрепа
  DEPUTY_DIRECTOR_SPECIAL_EDUCATION = 22, // Зам. директор на център за специална образователна подкрепа
  SOCIAL_PEDAGOGUE = 23,                  // Социален педагог
  SENIOR_TEACHER_DISABILITIES = 24,       // Старши учител на деца и ученици с УИ
  SENIOR_EDUCATOR = 25,                   // Старши възпитател
  DIRECTOR_CPLR = 26,                     // Директор на ЦПЛР
  DIRECTOR_RCPPPO = 27,                   // Директор на РЦПППО
  HEAD_TEACHER = 28,                      // Главен учител
}

// Institution types (actual_type) - array indices 0-4
export enum ActualType {
  SCHOOL = 0,           // Училище
  KINDERGARTEN = 1,     // Детска градина
  CSOP = 2,             // ЦСОП
  CPLR = 3,             // ЦПЛР
  RCPPPO = 4,           // РЦПППО
}

// Teacher flag: 0 = YES (is teacher), 1 = NO (not teacher)
export enum TeacherFlag {
  YES = 0,  // ДА - е учител
  NO = 1,   // НЕ - не е учител
}

// Position labels for display
export const POSITION_LABELS: Record<number, string> = {
  [ActualPosition.DIRECTOR_SCHOOL]: 'Директор - училище',
  [ActualPosition.DEPUTY_DIRECTOR_SCHOOL]: 'Заместник-директор - училище',
  [ActualPosition.PSYCHOLOGIST]: 'Психолог',
  [ActualPosition.TEACHER]: 'Учител',
  [ActualPosition.EDUCATOR]: 'Възпитател',
  [ActualPosition.TRAINER]: 'Треньор',
  [ActualPosition.DIRECTOR_KINDERGARTEN]: 'Директор - детска градина',
  [ActualPosition.DEPUTY_DIRECTOR_KINDERGARTEN]: 'Заместник-директор - детска градина',
  [ActualPosition.PEDAGOGICAL_ADVISOR]: 'Педагогически съветник',
  [ActualPosition.SPEECH_THERAPIST]: 'Логопед',
  [ActualPosition.REHABILITATOR]: 'Рехабилитатор',
  [ActualPosition.ICT_DIRECTOR]: 'Ръководител направление "ИКТ"',
  [ActualPosition.TUTOR]: 'Корепетитор',
  [ActualPosition.CHOREOGRAPHER]: 'Хореограф',
  [ActualPosition.DIRECTOR_DEVELOPMENT_CENTER]: 'Директор - център за развитие',
  [ActualPosition.DEPUTY_DIRECTOR_DEVELOPMENT_CENTER]: 'Заместник-директор - център за развитие',
  [ActualPosition.SENIOR_TEACHER]: 'Старши учител',
  [ActualPosition.OTHER]: 'Друга',
  [ActualPosition.RESOURCE_TEACHER]: 'Ресурсен учител',
  [ActualPosition.DIRECTOR_PERSONAL_DEVELOPMENT]: 'Директор на център за личностно развитие',
  [ActualPosition.DEPUTY_DIRECTOR_PERSONAL_DEVELOPMENT]: 'Зам. директор на център за личностно развитие',
  [ActualPosition.DIRECTOR_SPECIAL_EDUCATION]: 'Директор на център за специална образователна подкрепа',
  [ActualPosition.DEPUTY_DIRECTOR_SPECIAL_EDUCATION]: 'Зам. директор на център за специална образователна подкрепа',
  [ActualPosition.SOCIAL_PEDAGOGUE]: 'Социален педагог',
  [ActualPosition.SENIOR_TEACHER_DISABILITIES]: 'Старши учител на деца и ученици с УИ',
  [ActualPosition.SENIOR_EDUCATOR]: 'Старши възпитател',
  [ActualPosition.DIRECTOR_CPLR]: 'Директор на ЦПЛР',
  [ActualPosition.DIRECTOR_RCPPPO]: 'Директор на РЦПППО',
  [ActualPosition.HEAD_TEACHER]: 'Главен учител',
};

// Institution type labels
export const TYPE_LABELS: Record<number, string> = {
  [ActualType.SCHOOL]: 'Училище',
  [ActualType.KINDERGARTEN]: 'Детска градина',
  [ActualType.CSOP]: 'ЦСОП',
  [ActualType.CPLR]: 'ЦПЛР',
  [ActualType.RCPPPO]: 'РЦПППО',
};

// API Response types
export interface EpoApiSuccessResponse {
  Message: string;
}

export interface EpoApiErrorResponse {
  Error: string;
}

export type EpoApiResponse = EpoApiSuccessResponse | EpoApiErrorResponse;

// Base API Request (required fields for all requests)
export interface EpoApiBaseRequest {
  token: string;
  portfolio: string;  // Portfolio ID
  users: string;      // User ID
  cmd: string;        // Command/module
}

// Portfolio API Request (cmd = 'portfolio')
export interface EpoPortfolioRequest extends EpoApiBaseRequest {
  cmd: 'portfolio';
  
  // Personal data
  portfolio_name?: string;      // First name
  portfolio_surname?: string;   // Middle name
  portfolio_family?: string;    // Last name
  email?: string;
  phone?: string;
  nationality?: string;
  
  // Current position
  actual_position?: number;       // Position code (0-28)
  actual_position_other?: string; // If position is "Other"
  actual_type?: number;           // Institution type (0-4)
  actual_name?: string;           // Institution name
  
  // Experience
  internship_total?: string;      // Total pedagogical experience
  internship_teaching?: string;   // Experience in specialty
  
  // Reflection texts
  citat?: string;                 // Motto/quote
  teachingmethods?: string;       // Teaching methods
  teachingphilosophy?: string;    // Teaching philosophy
  selfmonitoring?: string;        // Self-monitoring/assessment
  futureplans?: string;           // Development plans
  
  // Specialties (up to 5)
  specialty?: string;
  teacher?: number;    // 0 = YES, 1 = NO
  specialty2?: string;
  teacher2?: number;
  specialty3?: string;
  teacher3?: number;
  specialty4?: string;
  teacher4?: number;
  specialty5?: string;
  teacher5?: number;
}
