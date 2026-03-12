import { asyncHandler } from "../../utils/asyncHandler.js";
import { success } from "../../utils/apiResponse.js";
import {
  updateTeachingValues,
  fetchTeachingValues,
  createSubject,
  getSubjects,
  removeSubject,
  createAcademic,
  getAcademics,
  removeAcademic,
  createExperience,
    getExperience,
    removeExperience,
    createExpertise,
    getExpertise,
    removeExpertise,
    fetchResumeMeta,
  updateResumeMeta,
  fetchFullResume,
   generateResumeSnapshot,
  fetchResumeSnapshots,
  fetchResumeSnapshotByVersion,
  updateResumeUIConfig,
  fetchResumeUIConfig,
  fetchTeacherProfile,
  updateTeacherProfile
} from "./teacher.service.js";
import { teacherValuesSchema } from "./teacher.schema.js";
import { teacherSubjectSchema } from "./teacher.schema.js";
import { teacherAcademicSchema } from "./teacher.schema.js";
import { teacherExperienceSchema } from "./teacher.schema.js";
import { teacherExpertiseSchema } from "./teacher.schema.js";
import { teacherResumeSchema } from "./teacher.schema.js";
import { teacherProfileSchema } from "./teacher.schema.js";


/* ================================
   SUBJECTS
================================ */

export const addSubjectHandler = asyncHandler(async (req, res) => {
  const payload = teacherSubjectSchema.parse(req.body);

  const meta = {
    ip: req.ip,
    browser: req.headers["user-agent"]
  };

  const subject = await createSubject(req.user, payload, meta);
  success(res, subject, "Subject added successfully");
});

export const listSubjectsHandler = asyncHandler(async (req, res) => {
  const subjects = await getSubjects(req.user.id);
  success(res, subjects, "Subjects fetched");
});

export const deleteSubjectHandler = asyncHandler(async (req, res) => {
  const meta = {
    ip: req.ip,
    browser: req.headers["user-agent"]
  };

  await removeSubject(req.user, req.params.id, meta);
  success(res, null, "Subject removed successfully");
});

/* ================================
   ACADEMICS
================================ */

export const addAcademicHandler = asyncHandler(async (req, res) => {
  const payload = teacherAcademicSchema.parse(req.body);

  const meta = {
    ip: req.ip,
    browser: req.headers["user-agent"]
  };

  const academic = await createAcademic(req.user, payload, meta);
  success(res, academic, "Academic record added successfully");
});

export const listAcademicsHandler = asyncHandler(async (req, res) => {
  const academics = await getAcademics(req.user.id);
  success(res, academics, "Academic records fetched");
});

export const deleteAcademicHandler = asyncHandler(async (req, res) => {
  const meta = {
    ip: req.ip,
    browser: req.headers["user-agent"]
  };

  await removeAcademic(req.user, req.params.id, meta);
  success(res, null, "Academic record removed successfully");
});

/* ================================
   EXPERIENCE
================================ */

export const addExperienceHandler = asyncHandler(async (req, res) => {
  const payload = teacherExperienceSchema.parse(req.body);

  const meta = {
    ip: req.ip,
    browser: req.headers["user-agent"]
  };

  const exp = await createExperience(req.user, payload, meta);
  success(res, exp, "Experience added successfully");
});

export const listExperienceHandler = asyncHandler(async (req, res) => {
  const exp = await getExperience(req.user.id);
  success(res, exp, "Experience fetched");
});

export const deleteExperienceHandler = asyncHandler(async (req, res) => {
  const meta = {
    ip: req.ip,
    browser: req.headers["user-agent"]
  };

  await removeExperience(req.user, req.params.id, meta);
  success(res, null, "Experience removed successfully");
});

/* ================================
   TEACHING VALUES
================================ */

export const updateTeachingValuesHandler = asyncHandler(async (req, res) => {
  const payload = teacherValuesSchema.parse(req.body);

  const meta = {
    ip: req.ip,
    browser: req.headers["user-agent"]
  };

  await updateTeachingValues(req.user, payload, meta);
  success(res, null, "Teaching values updated successfully");
});

export const getTeachingValuesHandler = asyncHandler(async (req, res) => {
  const values = await fetchTeachingValues(req.user.id);
  success(res, values, "Teaching values fetched");
});

/* ================================
   TEACHER EXPERTISE
================================ */

export const addExpertiseHandler = asyncHandler(async (req, res) => {
  const payload = teacherExpertiseSchema.parse(req.body);

  const meta = {
    ip: req.ip,
    browser: req.headers["user-agent"]
  };

  const data = await createExpertise(req.user, payload, meta);
  success(res, data, "Expertise added successfully");
});

export const listExpertiseHandler = asyncHandler(async (req, res) => {
  const data = await getExpertise(req.user.id);
  success(res, data, "Expertise fetched");
});

export const deleteExpertiseHandler = asyncHandler(async (req, res) => {
  const meta = {
    ip: req.ip,
    browser: req.headers["user-agent"]
  };

  await removeExpertise(req.user, req.params.id, meta);
  success(res, null, "Expertise removed successfully");
});

/* ================================
   TEACHER PROFILE (PERSONAL INFO)
================================ */

/**
 * GET teacher profile
 */
export const getTeacherProfileHandler = asyncHandler(async (req, res) => {
  const profile = await fetchTeacherProfile(req.user.id);

  success(res, profile, "Teacher profile fetched");
});

/**
 * CREATE / UPDATE teacher profile
 */
export const updateTeacherProfileHandler = asyncHandler(async (req, res) => {
  const payload = teacherProfileSchema.parse(req.body);

  const meta = {
    ip: req.ip,
    browser: req.headers["user-agent"]
  };

  const profile = await updateTeacherProfile(req.user, payload, meta);

  success(res, profile, "Teacher profile updated");
});

/* ================================
   TEACHER RESUME
================================ */
export async function getResumeMetaHandler(req, res) {
  const resume = await fetchResumeMeta(req.user);

  return res.json({
    success: true,
    message: "Resume metadata fetched",
    data: resume
  });
}

export async function patchResumeMetaHandler(req, res) {
  const payload = teacherResumeSchema.parse(req.body);

  const resume = await updateResumeMeta(req.user, payload);

  return res.json({
    success: true,
    message: "Resume metadata updated successfully",
    data: resume
  });
}

/* ================================
   AGGREGATED RESUME
================================ */

export const getFullResumeHandler = asyncHandler(async (req, res) => {
  const resume = await fetchFullResume(req.user);

  success(res, resume, "Full resume fetched");
});

/* ================================
   RESUME SNAPSHOTS
================================ */

export const generateResumeSnapshotHandler = asyncHandler(async (req, res) => {
  const snapshot = await generateResumeSnapshot(req.user);
  success(res, snapshot, "Resume snapshot generated");
});

export async function listResumeSnapshotsHandler(req, res) {
  const snapshots = await fetchResumeSnapshots(req.user.id);

  res.json({
    success: true,
    data: snapshots
  });
}




export const getResumeSnapshotHandler = asyncHandler(async (req, res) => {
  const version = Number(req.params.version);
  const snap = await fetchResumeSnapshotByVersion(req.user.id, version);
  success(res, snap, "Resume version fetched");
});

/* ================================
   RESUME UI CONFIG
================================ */

export const updateResumeUIConfigHandler = asyncHandler(async (req, res) => {
  const meta = {
    ip: req.ip,
    browser: req.headers["user-agent"]
  };

  const data = await updateResumeUIConfig(req.user, req.body, meta);
  success(res, data, "Resume UI configuration updated");
});

export const getResumeUIConfigHandler = asyncHandler(async (req, res) => {
  const data = await fetchResumeUIConfig(req.user.id);
  success(res, data, "Resume UI configuration fetched");
});
