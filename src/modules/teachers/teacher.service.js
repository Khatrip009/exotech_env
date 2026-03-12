import {
  upsertTeacherValues,
  getTeacherValues,
  addTeacherSubject,
  listTeacherSubjects,
  deleteTeacherSubject,
  addTeacherAcademic,
  listTeacherAcademics,
  deleteTeacherAcademic,
    addTeacherExperience,
    listTeacherExperience,
    deleteTeacherExperience,
   addTeacherExpertise,
   listTeacherExpertise,
   deleteTeacherExpertise,
    getTeacherResume,
  upsertTeacherResume,
  getFullTeacherResume,
  createResumeSnapshot,
  listResumeSnapshots,
  getResumeSnapshotByVersion,
  upsertResumeUIConfig,
  getResumeUIConfig,
   getAllowedUITokens,
   getTeacherProfile,
  upsertTeacherProfile
} from "./teacher.repository.js";

import { auditAsync } from "../../middlewares/audit.helper.js";
import e from "cors";

console.log("DEBUG IMPORTS", {
  auditAsync,
  addTeacherExpertise,
  listTeacherExpertise,
  deleteTeacherExpertise
});

function buildTokenMap(rows) {
  const map = {};

  for (const row of rows) {
    if (!map[row.token_group]) {
      map[row.token_group] = {};
    }
    map[row.token_group][row.token_key] = row.allowed_values;
  }

  return map;
}

function validateResumeUIConfig(config, tokenMap) {
  // Fonts
  if (config.fonts) {
    const { title, header, body } = config.fonts;

    if (
      title &&
      !tokenMap.font.title_font.includes(title)
    ) {
      throw {
        status: 400,
        message: `Invalid title font: ${title}`
      };
    }

    if (
      header &&
      !tokenMap.font.header_font.includes(header)
    ) {
      throw {
        status: 400,
        message: `Invalid header font: ${header}`
      };
    }

    if (
      body &&
      !tokenMap.font.body_font.includes(body)
    ) {
      throw {
        status: 400,
        message: `Invalid body font: ${body}`
      };
    }
  }

  // Layout
  if (
    config.layout &&
    !tokenMap.layout.layout_type.includes(config.layout)
  ) {
    throw {
      status: 400,
      message: `Invalid layout type: ${config.layout}`
    };
  }

  // Section style
  if (
    config.section?.style &&
    !tokenMap.section.section_style.includes(config.section.style)
  ) {
    throw {
      status: 400,
      message: `Invalid section style: ${config.section.style}`
    };
  }

  // Table style
  if (
    config.table?.style &&
    !tokenMap.table.table_style.includes(config.table.style)
  ) {
    throw {
      status: 400,
      message: `Invalid table style: ${config.table.style}`
    };
  }

  // Image frame
  if (
    config.image?.frame &&
    !tokenMap.image.image_frame.includes(config.image.frame)
  ) {
    throw {
      status: 400,
      message: `Invalid image frame: ${config.image.frame}`
    };
  }
}

/* ================================ 
   SUBJECTS
================================ */

export async function createSubject(user, payload, meta) {
  const subject = await addTeacherSubject(user.id, payload);

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "ADD_TEACHER_SUBJECT",
    entityType: "TEACHER_SUBJECT",
    entityId: subject.id,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });

  return subject;
}

export async function getSubjects(userId) {
  return await listTeacherSubjects(userId);
}

export async function removeSubject(user, subjectId, meta) {
  const deleted = await deleteTeacherSubject(subjectId, user.id);

  if (!deleted) {
    throw { status: 404, message: "Subject not found" };
  }

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "DELETE_TEACHER_SUBJECT",
    entityType: "TEACHER_SUBJECT",
    entityId: subjectId,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });
}

/* ================================
   ACADEMICS
================================ */

export async function createAcademic(user, payload, meta) {
  const academic = await addTeacherAcademic(user.id, payload);

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "ADD_TEACHER_ACADEMIC",
    entityType: "TEACHER_ACADEMIC",
    entityId: academic.id,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });

  return academic;
}

export async function getAcademics(userId) {
  return await listTeacherAcademics(userId);
}

export async function removeAcademic(user, academicId, meta) {
  const deleted = await deleteTeacherAcademic(academicId, user.id);

  if (!deleted) {
    throw { status: 404, message: "Academic record not found" };
  }

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "DELETE_TEACHER_ACADEMIC",
    entityType: "TEACHER_ACADEMIC",
    entityId: academicId,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });
}

/* ================================
   EXPERIENCE
================================ */

export async function createExperience(user, payload, meta) {
  const exp = await addTeacherExperience(user.id, payload);

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "ADD_TEACHER_EXPERIENCE",
    entityType: "TEACHER_EXPERIENCE",
    entityId: exp.id,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });

  return exp;
}

export async function getExperience(userId) {
  return await listTeacherExperience(userId);
}

export async function removeExperience(user, experienceId, meta) {
  const deleted = await deleteTeacherExperience(experienceId, user.id);

  if (!deleted) {
    throw { status: 404, message: "Experience record not found" };
  }

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "DELETE_TEACHER_EXPERIENCE",
    entityType: "TEACHER_EXPERIENCE",
    entityId: experienceId,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });
}


/* ================================
   TEACHING VALUES
================================ */
export async function updateTeachingValues(user, payload, meta) {
  await upsertTeacherValues(user.id, payload);

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "UPDATE_TEACHING_VALUES",
    entityType: "TEACHER_VALUES",
    entityId: user.id,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });
}

export async function fetchTeachingValues(userId) {
  return await getTeacherValues(userId);
}

/* ================================
   TEACHER EXPERTISE
================================ */

export async function createExpertise(user, payload, meta) {
  const exp = await addTeacherExpertise(user.id, payload);

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "ADD_TEACHER_EXPERTISE",
    entityType: "TEACHER_EXPERTISE",
    entityId: exp.id,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });

  return exp;
}

export async function getExpertise(userId) {
  return await listTeacherExpertise(userId);
}

export async function removeExpertise(user, expertiseId, meta) {
  const deleted = await deleteTeacherExpertise(expertiseId, user.id);

  if (!deleted) {
    throw { status: 404, message: "Expertise record not found" };
  }

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "DELETE_TEACHER_EXPERTISE",
    entityType: "TEACHER_EXPERTISE",
    entityId: expertiseId,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });
}

/* ================================
   TEACHER PROFILE (PERSONAL INFO)
================================ */

/**
 * Fetch teacher profile (personal & professional info)
 */
export async function fetchTeacherProfile(userId) {
  return await getTeacherProfile(userId);
}

/**
 * Create / Update teacher profile
 * - Auto-creates on first save
 */
export async function updateTeacherProfile(user, payload, meta) {
  const profile = await upsertTeacherProfile(user.id, payload);

  await auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "UPSERT_TEACHER_PROFILE",
    entityType: "TEACHER_PROFILE",
    entityId: user.id,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });

  return profile;
}


/* ================================
   TEACHER RESUME
================================ */
export async function updateResumeMeta(user, payload, meta) {
  const resume = await upsertTeacherResume(user.id, payload); 
  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "UPSERT_TEACHER_RESUME",
    entityType: "TEACHER_RESUME",
    entityId: resume.id,
    
  });
  return resume;
}

export async function fetchResumeMeta(user) {
  return await getTeacherResume(user.id);
} 

/* ================================
   AGGREGATED RESUME
================================ */
export async function fetchFullResume(user) {
  let resume = await getFullTeacherResume(user.id);

  // 🔹 AUTO-CREATE RESUME ON FIRST VISIT
  if (!resume.meta) {
    await upsertTeacherResume(user.id, {
      resume_title: "My Professional Resume",
      visibility: "PRIVATE"
    });

    resume = await getFullTeacherResume(user.id);
  }

  // Visibility enforcement (future-ready)
  if (resume.meta.visibility === "PRIVATE") {
    throw { status: 403, message: "Resume is private" };
  }

  return resume;
}


/* ================================
   RESUME SNAPSHOTS
================================ */

export async function generateResumeSnapshot(user) {
  // 1️⃣ Get current resume
  const resume = await getTeacherResume(user.id);
  if (!resume) {
    throw { status: 404, message: "Resume metadata not found" };
  }

  // 2️⃣ Increment version FIRST (atomic)
  const updatedResume = await upsertTeacherResume(user.id, {
    resume_title: resume.resume_title,
    visibility: resume.visibility
  });

  // 3️⃣ Get fresh full resume AFTER version increment
  const fullResume = await fetchFullResume(user);

  // 4️⃣ Create snapshot using NEW version
  const snapshot = await createResumeSnapshot(
    user.id,
    updatedResume.version,
    fullResume
  );

  await auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "GENERATE_RESUME_SNAPSHOT",
    entityType: "TEACHER_RESUME",
    entityId: updatedResume.id
  });

  return snapshot;
}


// teacher.service.js
export async function fetchResumeSnapshots(teacherId) {
  return await listResumeSnapshots(teacherId);
}



export async function fetchResumeSnapshotByVersion(userId, version) {
  const snap = await getResumeSnapshotByVersion(userId, version);

  if (!snap) {
    throw { status: 404, message: "Resume version not found" };
  }

  return snap;
}

/* ================================
   RESUME UI CONFIG
================================ */
export async function updateResumeUIConfig(user, config, meta) {
  const tokens = await getAllowedUITokens();
  const tokenMap = buildTokenMap(tokens);

  validateResumeUIConfig(config, tokenMap);

  const data = await upsertResumeUIConfig(user.id, config);

  auditAsync({
    actorId: user.id,
    actorRole: user.role,
    action: "UPDATE_RESUME_UI_CONFIG",
    entityType: "RESUME_UI_CONFIG",
    entityId: user.id,
    ipAddress: meta.ip,
    userAgent: meta.browser
  });

  return data;
}

export async function fetchResumeUIConfig(userId) {
  return await getResumeUIConfig(userId);
}