import { z } from "zod";

export const maritalStatusEnum = z.enum([
  "Single",
  "Married",
  "Divorced",
  "Widowed"
]);

export const teacherSubjectSchema = z.object({
  subject: z.string().min(2, "Subject is required"),
  grade_levels: z.array(z.string().min(1)).min(1, "At least one grade required"),
  board: z.string().optional(),
  medium: z.string().optional()
});

export const teacherAcademicSchema = z.object({
  degree: z.string().min(2, "Degree is required"),
  specialization: z.string().optional(),
  institution: z.string().min(2, "Institution is required"),
  year_of_completion: z
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear())
    .optional(),
  certificate_url: z.string().url().optional()
});
export const teacherExperienceSchema = z.object({
  institution_name: z.string().min(2, "Institution name is required"),
  designation: z.string().optional(),

  start_date: z.coerce.date({
    required_error: "Start date is required",
    invalid_type_error: "Invalid start date"
  }),

  end_date: z.coerce
    .date({ invalid_type_error: "Invalid end date" })
    .optional(),

  achievements_summary: z.string().optional(),
  student_outcomes: z.string().optional()
});


export const teacherValuesSchema = z.object({
  teaching_philosophy: z.string().optional(),
  student_engagement_style: z.string().optional(),
  assessment_approach: z.string().optional(),
  classroom_management_style: z.string().optional(),
  inclusivity_statement: z.string().optional()
});

export const teacherExpertiseSchema = z.object({
  expertise_area: z.string().min(2, "Expertise area is required"),
  teaching_mode: z.string().optional(),
  experience_years: z.number().int().min(0).optional(),
  skill_tags: z.array(z.string().min(1)).optional()
});

export const resumeVisibilityEnum = z.enum([
  "PUBLIC",
  "RESTRICTED",
  "PRIVATE"
]);



/**
 * Writable fields ONLY
 * - version, timestamps, last_generated_at are system-managed
 */
export const teacherResumeSchema = z.object({
  resume_title: z
    .string()
    .min(2, "Resume title must be at least 2 characters")
    .max(150)
    .optional(),

  visibility: resumeVisibilityEnum.optional()
}).strict();

export const languageProficiencySchema = z.object({
  read: z.array(z.string().min(1)).optional(),
  write: z.array(z.string().min(1)).optional(),
  speak: z.array(z.string().min(1)).optional()
});

export const teacherProfileSchema = z.object({
  years_of_experience: z
    .number()
    .int()
    .min(0)
    .optional(),

  availability: z.string().optional(),

  current_institution: z.string().optional(),

  is_open_to_opportunities: z.boolean().optional(),

  /* ======================
     PERSONAL INFORMATION
  ====================== */

  guardian_name: z
    .string()
    .min(2, "Guardian name must be at least 2 characters")
    .optional(),

  nationality: z
    .string()
    .min(2)
    .default("Indian")
    .optional(),

  date_of_birth: z.coerce
    .date({
      invalid_type_error: "Invalid date of birth"
    })
    .optional(),

  marital_status: maritalStatusEnum.optional(),

  languages: languageProficiencySchema.optional()
}).strict();
