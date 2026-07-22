/**
 * EPO API Transform Service
 * Transforms Supabase portfolio data to EPO API format
 */

import { EpoPortfolioRequest, ActualPosition, ActualType, TeacherFlag } from './epo-api-types';

/**
 * Transform portfolio data from Supabase to EPO API format
 */
export function transformPortfolioToEpoApi(
  portfolioId: string,
  userId: string,
  subsectionData: Record<string, Record<string, unknown>>
): Partial<EpoPortfolioRequest> {
  // Get Section 1 subsection data
  const personalData = subsectionData['section_1_subsection_1_1'] || {};
  const currentPosition = subsectionData['section_1_subsection_1_2'] || {};
  const reflection = subsectionData['section_1_subsection_1_6'] || {};
  
  // Extract work history for current position
  const workHistory = (currentPosition as any).workHistory as Array<any> || [];
  const currentJob = workHistory.find((job: any) => job.nowTo === true);
  
  const payload: Partial<EpoPortfolioRequest> = {
    // Personal data
    portfolio_name: personalData.firstName as string,
    portfolio_surname: personalData.middleName as string,
    portfolio_family: personalData.lastName as string,
    email: personalData.email as string,
    phone: personalData.phone as string,
    nationality: personalData.nationality as string,
    
    // Current position (from work history)
    actual_position: parsePosition(currentJob?.position as string),
    actual_position_other: currentJob?.positionOther as string,
    actual_type: parseInstitutionType(currentJob?.institutionType as string),
    actual_name: currentJob?.institution as string,
    
    // Experience
    internship_total: personalData.totalExperience as string,
    internship_teaching: personalData.specialtyExperience as string,
    
    // Reflection texts
    citat: reflection.motto as string,
    teachingmethods: reflection.teachingMethods as string,
    teachingphilosophy: reflection.teachingPhilosophy as string,
    selfmonitoring: reflection.selfAssessment as string,
    futureplans: reflection.developmentPlans as string,
  };
  
  // Specialties - extract from education or qualifications
  // TODO: Map specialties when education section is implemented
  
  return payload;
}

/**
 * Parse position text to ActualPosition enum value
 */
function parsePosition(positionText?: string): number | undefined {
  if (!positionText) return undefined;
  
  const normalized = positionText.toLowerCase().trim();
  
  // Map common position names to enum values
  const positionMap: Record<string, ActualPosition> = {
    'директор - училище': ActualPosition.DIRECTOR_SCHOOL,
    'директор': ActualPosition.DIRECTOR_SCHOOL,
    'заместник-директор - училище': ActualPosition.DEPUTY_DIRECTOR_SCHOOL,
    'заместник директор': ActualPosition.DEPUTY_DIRECTOR_SCHOOL,
    'психолог': ActualPosition.PSYCHOLOGIST,
    'учител': ActualPosition.TEACHER,
    'възпитател': ActualPosition.EDUCATOR,
    'треньор': ActualPosition.TRAINER,
    'директор - детска градина': ActualPosition.DIRECTOR_KINDERGARTEN,
    'заместник-директор - детска градина': ActualPosition.DEPUTY_DIRECTOR_KINDERGARTEN,
    'педагогически съветник': ActualPosition.PEDAGOGICAL_ADVISOR,
    'логопед': ActualPosition.SPEECH_THERAPIST,
    'рехабилитатор': ActualPosition.REHABILITATOR,
    'ръководител икт': ActualPosition.ICT_DIRECTOR,
    'корепетитор': ActualPosition.TUTOR,
    'хореограф': ActualPosition.CHOREOGRAPHER,
    'ресурсен учител': ActualPosition.RESOURCE_TEACHER,
    'социален педагог': ActualPosition.SOCIAL_PEDAGOGUE,
    'старши учител': ActualPosition.SENIOR_TEACHER,
    'старши възпитател': ActualPosition.SENIOR_EDUCATOR,
    'главен учител': ActualPosition.HEAD_TEACHER,
  };
  
  // Try exact match first
  if (positionMap[normalized]) {
    return positionMap[normalized];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(positionMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  // Default to "Other"
  return ActualPosition.OTHER;
}

/**
 * Parse institution type text to ActualType enum value
 */
function parseInstitutionType(typeText?: string): number | undefined {
  if (!typeText) return undefined;
  
  const normalized = typeText.toLowerCase().trim();
  
  const typeMap: Record<string, ActualType> = {
    'училище': ActualType.SCHOOL,
    'детска градина': ActualType.KINDERGARTEN,
    'градина': ActualType.KINDERGARTEN,
    'цсоп': ActualType.CSOP,
    'център за специална образователна подкрепа': ActualType.CSOP,
    'цплр': ActualType.CPLR,
    'център за личностно развитие': ActualType.CPLR,
    'рцпппо': ActualType.RCPPPO,
  };
  
  // Try exact match
  if (typeMap[normalized]) {
    return typeMap[normalized];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(typeMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  // Default to School
  return ActualType.SCHOOL;
}

/**
 * Helper: Check if specialty is teaching-related
 * Returns TeacherFlag (0 = YES teacher, 1 = NO not teacher)
 */
export function isTeachingSpecialty(specialty: string): TeacherFlag {
  const teachingKeywords = [
    'учител',
    'преподавател',
    'педагог',
    'обучител',
  ];
  
  const normalized = specialty.toLowerCase();
  const isTeacher = teachingKeywords.some(keyword => normalized.includes(keyword));
  
  return isTeacher ? TeacherFlag.YES : TeacherFlag.NO;
}
