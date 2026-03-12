import { pool } from "../../db/pool.js";

/* ================================
   SUBJECTS
================================ */

export async function addTeacherSubject(teacherId, data) {
  const { rows } = await pool.query(
    `
    INSERT INTO teacher_subjects
      (teacher_id, subject, grade_levels, board, medium)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [
      teacherId,
      data.subject,
      data.grade_levels,
      data.board || null,
      data.medium || null
    ]
  );

  return rows[0];
}

export async function listTeacherSubjects(teacherId) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM teacher_subjects
    WHERE teacher_id = $1
    ORDER BY created_at DESC
    `,
    [teacherId]
  );

  return rows;
}

export async function deleteTeacherSubject(subjectId, teacherId) {
  const { rowCount } = await pool.query(
    `
    DELETE FROM teacher_subjects
    WHERE id = $1 AND teacher_id = $2
    `,
    [subjectId, teacherId]
  );

  return rowCount > 0;
}

/* ================================
   ACADEMICS
================================ */

export async function addTeacherAcademic(teacherId, data) {
  const { rows } = await pool.query(
    `
    INSERT INTO teacher_academics
      (teacher_id, degree, specialization, institution, year_of_completion, certificate_url)
    VALUES
      ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      teacherId,
      data.degree,
      data.specialization || null,
      data.institution,
      data.year_of_completion || null,
      data.certificate_url || null
    ]
  );

  return rows[0];
}

export async function listTeacherAcademics(teacherId) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM teacher_academics
    WHERE teacher_id = $1
    ORDER BY year_of_completion DESC NULLS LAST, created_at DESC
    `,
    [teacherId]
  );

  return rows;
}

export async function deleteTeacherAcademic(academicId, teacherId) {
  const { rowCount } = await pool.query(
    `
    DELETE FROM teacher_academics
    WHERE id = $1 AND teacher_id = $2
    `,
    [academicId, teacherId]
  );

  return rowCount > 0;
}


/* ================================
   EXPERIENCE
================================ */

export async function addTeacherExperience(teacherId, data) {
  const { rows } = await pool.query(
    `
    INSERT INTO teacher_experience
      (teacher_id, institution_name, designation, start_date, end_date,
       achievements_summary, student_outcomes)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `,
    [
      teacherId,
      data.institution_name,
      data.designation || null,
      data.start_date,
      data.end_date || null,
      data.achievements_summary || null,
      data.student_outcomes || null
    ]
  );

  return rows[0];
}

export async function listTeacherExperience(teacherId) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM teacher_experience
    WHERE teacher_id = $1
    ORDER BY start_date DESC
    `,
    [teacherId]
  );

  return rows;
}

export async function deleteTeacherExperience(experienceId, teacherId) {
  const { rowCount } = await pool.query(
    `
    DELETE FROM teacher_experience
    WHERE id = $1 AND teacher_id = $2
    `,
    [experienceId, teacherId]
  );

  return rowCount > 0;
}

/* ================================ 
    TEACHING VALUES
================================ */

export async function upsertTeacherValues(teacherId, data) {
  const keys = Object.keys(data);
  if (!keys.length) return;

  const updates = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");

  await pool.query(
    `
    INSERT INTO teacher_values (teacher_id, ${keys.join(", ")})
    VALUES ($1, ${keys.map((_, i) => `$${i + 2}`).join(", ")})
    ON CONFLICT (teacher_id)
    DO UPDATE SET ${updates}, updated_at = now()
    `,
    [teacherId, ...Object.values(data)]
  );
}

export async function getTeacherValues(teacherId) {
  const { rows } = await pool.query(
    `SELECT *
     FROM teacher_values
     WHERE teacher_id = $1`,
    [teacherId]
  );

  return rows[0] || null;
}


/* ================================
   TEACHER EXPERTISE
================================ */

export async function addTeacherExpertise(teacherId, data) {
  const { rows } = await pool.query(
    `
    INSERT INTO teacher_expertise
      (teacher_id, expertise_area, teaching_mode, experience_years, skill_tags)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [
      teacherId,
      data.expertise_area,
      data.teaching_mode || null,
      data.experience_years ?? null,
      data.skill_tags ?? null
    ]
  );

  return rows[0];
}

export async function listTeacherExpertise(teacherId) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM teacher_expertise
    WHERE teacher_id = $1
    ORDER BY created_at DESC
    `,
    [teacherId]
  );

  return rows;
}

export async function deleteTeacherExpertise(expertiseId, teacherId) {
  const { rowCount } = await pool.query(
    `
    DELETE FROM teacher_expertise
    WHERE id = $1 AND teacher_id = $2
    `,
    [expertiseId, teacherId]
  );

  return rowCount > 0;
}


/**
 * Fetch resume metadata for teacher
 */
export async function getTeacherResume(teacherId) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM teacher_resumes
    WHERE teacher_id = $1
    LIMIT 1
    `,
    [teacherId]
  );

  return rows[0] || null;
}

/**
 * Create or update resume metadata (UPSERT)
 */
export async function upsertTeacherResume(
  teacherId,
  { resume_title, visibility }
) {
  const { rows } = await pool.query(
    `
    INSERT INTO teacher_resumes (teacher_id, resume_title, visibility)
    VALUES ($1, $2, $3)
    ON CONFLICT (teacher_id)
    DO UPDATE SET
      resume_title = COALESCE(EXCLUDED.resume_title, teacher_resumes.resume_title),
      visibility = COALESCE(EXCLUDED.visibility, teacher_resumes.visibility),
      version = teacher_resumes.version + 1,
      updated_at = now()
    RETURNING *
    `,
    [teacherId, resume_title ?? null, visibility ?? null]
  );

  return rows[0];
}

/* ================================
   AGGREGATED RESUME
================================ */

export async function getFullTeacherResume(teacherId) {
  const client = await pool.connect();

  try {
    const [
      resumeMeta,
      values,
      subjects,
      academics,
      experience,
      expertise
    ] = await Promise.all([
      client.query(
        `SELECT *
         FROM teacher_resumes
         WHERE teacher_id = $1
         LIMIT 1`,
        [teacherId]
      ),
      client.query(
        `SELECT *
         FROM teacher_values
         WHERE teacher_id = $1`,
        [teacherId]
      ),
      client.query(
        `SELECT *
         FROM teacher_subjects
         WHERE teacher_id = $1
         ORDER BY created_at DESC`,
        [teacherId]
      ),
      client.query(
        `SELECT *
         FROM teacher_academics
         WHERE teacher_id = $1
         ORDER BY year_of_completion DESC NULLS LAST, created_at DESC`,
        [teacherId]
      ),
      client.query(
        `SELECT *
         FROM teacher_experience
         WHERE teacher_id = $1
         ORDER BY start_date DESC`,
        [teacherId]
      ),
      client.query(
        `SELECT *
         FROM teacher_expertise
         WHERE teacher_id = $1
         ORDER BY created_at DESC`,
        [teacherId]
      )
    ]);

    return {
      meta: resumeMeta.rows[0] || null,
      values: values.rows[0] || null,
      subjects: subjects.rows,
      academics: academics.rows,
      experience: experience.rows,
      expertise: expertise.rows
    };
  } finally {
    client.release();
  }
}

/* ================================
   RESUME SNAPSHOTS
================================ */

export async function createResumeSnapshot(
  teacherId,
  version,
  snapshot
) {
  try {
    const { rows } = await pool.query(
      `
      INSERT INTO teacher_resume_snapshots
        (teacher_id, version, snapshot)
      VALUES
        ($1, $2, $3)
      RETURNING *
      `,
      [teacherId, version, snapshot]
    );

    return rows[0];
  } catch (err) {
    // 🛑 Handle duplicate snapshot generation gracefully
    if (err.code === "23505") {
      throw {
        status: 409,
        message: "Resume snapshot for this version already exists"
      };
    }

    throw err;
  }
}


// teacher.repository.js
export async function listResumeSnapshots(teacherId) {
  const { rows } = await pool.query(
    `
    SELECT id, version, created_at
    FROM teacher_resume_snapshots
    WHERE teacher_id = $1
    ORDER BY version DESC
    `,
    [teacherId]
  );

  return rows;
}



export async function getResumeSnapshotByVersion(teacherId, version) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM teacher_resume_snapshots
    WHERE teacher_id = $1 AND version = $2
    LIMIT 1
    `,
    [teacherId, version]
  );

  return rows[0] || null;
}

/* ================================
   RESUME UI CONFIG
================================ */

export async function upsertResumeUIConfig(teacherId, config) {
  const { rows } = await pool.query(
    `
    INSERT INTO resume_ui_config (teacher_id, config)
    VALUES ($1, $2)
    ON CONFLICT (teacher_id)
    DO UPDATE SET
      config = EXCLUDED.config,
      updated_at = now()
    RETURNING *
    `,
    [teacherId, config]
  );

  return rows[0];
}

export async function getResumeUIConfig(teacherId) {
  const { rows } = await pool.query(
    `
    SELECT config, updated_at
    FROM resume_ui_config
    WHERE teacher_id = $1
    `,
    [teacherId]
  );

  return rows[0] || null;
}

/* ================================
   UI ALLOWED TOKENS
================================ */

export async function getAllowedUITokens() {
  const { rows } = await pool.query(
    `
    SELECT token_group, token_key, allowed_values
    FROM ui_allowed_tokens
    `
  );

  return rows;
}

/* ================================
   TEACHER PROFILE (PERSONAL INFO)
================================ */

export async function getTeacherProfile(userId) {
  const { rows } = await pool.query(
    `
    SELECT
      user_id,
      years_of_experience,
      availability,
      current_institution,
      is_open_to_opportunities,

      guardian_name,
      nationality,
      date_of_birth,
      marital_status,
      languages,

      created_at,
      updated_at
    FROM teacher_profiles
    WHERE user_id = $1
    `,
    [userId]
  );

  return rows[0] || null;
}

export async function upsertTeacherProfile(userId, data) {
  const {
    years_of_experience,
    availability,
    current_institution,
    is_open_to_opportunities,

    guardian_name,
    nationality,
    date_of_birth,
    marital_status,
    languages
  } = data;

  const { rows } = await pool.query(
    `
    INSERT INTO teacher_profiles (
      user_id,
      years_of_experience,
      availability,
      current_institution,
      is_open_to_opportunities,

      guardian_name,
      nationality,
      date_of_birth,
      marital_status,
      languages
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      years_of_experience = COALESCE(EXCLUDED.years_of_experience, teacher_profiles.years_of_experience),
      availability = COALESCE(EXCLUDED.availability, teacher_profiles.availability),
      current_institution = COALESCE(EXCLUDED.current_institution, teacher_profiles.current_institution),
      is_open_to_opportunities = COALESCE(EXCLUDED.is_open_to_opportunities, teacher_profiles.is_open_to_opportunities),

      guardian_name = COALESCE(EXCLUDED.guardian_name, teacher_profiles.guardian_name),
      nationality = COALESCE(EXCLUDED.nationality, teacher_profiles.nationality),
      date_of_birth = COALESCE(EXCLUDED.date_of_birth, teacher_profiles.date_of_birth),
      marital_status = COALESCE(EXCLUDED.marital_status, teacher_profiles.marital_status),
      languages = COALESCE(EXCLUDED.languages, teacher_profiles.languages),

      updated_at = now()
    RETURNING *
    `,
    [
      userId,
      years_of_experience ?? null,
      availability ?? null,
      current_institution ?? null,
      is_open_to_opportunities ?? true,

      guardian_name ?? null,
      nationality ?? "Indian",
      date_of_birth ?? null,
      marital_status ?? null,
      languages ?? null
    ]
  );

  return rows[0];
}
