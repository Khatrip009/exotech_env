import express from "express";
import {
  updateTeachingValuesHandler,
  getTeachingValuesHandler,
  addSubjectHandler,
  listSubjectsHandler,
  deleteSubjectHandler,
  addAcademicHandler,
  listAcademicsHandler,
  deleteAcademicHandler,
  addExperienceHandler,
  listExperienceHandler,
  deleteExperienceHandler,
    addExpertiseHandler,
    listExpertiseHandler,
    deleteExpertiseHandler,
    getResumeMetaHandler,
    patchResumeMetaHandler,
    getFullResumeHandler,
    generateResumeSnapshotHandler,
  listResumeSnapshotsHandler,
  getResumeSnapshotHandler,
  updateResumeUIConfigHandler,
  getResumeUIConfigHandler,
    getTeacherProfileHandler,
    updateTeacherProfileHandler
} from "./teacher.controller.js";

import { authRequired } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = express.Router();

/* ================================
   SUBJECTS
================================ */

router.post(
  "/subjects",
  authRequired,
  authorize(["TEACHER"]),
  addSubjectHandler
);

router.get(
  "/subjects",
  authRequired,
  authorize(["TEACHER"]),
  listSubjectsHandler
);

router.delete(
  "/subjects/:id",
  authRequired,
  authorize(["TEACHER"]),
  deleteSubjectHandler
);

/* ================================
   ACADEMICS
================================ */

router.post(
  "/academics",
  authRequired,
  authorize(["TEACHER"]),
  addAcademicHandler
);

router.get(
  "/academics",
  authRequired,
  authorize(["TEACHER"]),
  listAcademicsHandler
);

router.delete(
  "/academics/:id",
  authRequired,
  authorize(["TEACHER"]),
  deleteAcademicHandler
);

/* ================================
   EXPERIENCE
================================ */

router.post(
  "/experience",
  authRequired,
  authorize(["TEACHER"]),
  addExperienceHandler
);

router.get(
  "/experience",
  authRequired,
  authorize(["TEACHER"]),
  listExperienceHandler
);

router.delete(
  "/experience/:id",
  authRequired,
  authorize(["TEACHER"]),
  deleteExperienceHandler
);

/* ================================
   TEACHING VALUES
================================ */
router.put(
  "/values",
  authRequired,
  authorize(["TEACHER"]),
  updateTeachingValuesHandler
);

router.get(
  "/values",
  authRequired,
  authorize(["TEACHER"]),
  getTeachingValuesHandler
);


/* ================================
   TEACHER EXPERTISE
================================ */

router.post(
  "/expertise",
  authRequired,
  authorize(["TEACHER"]),
  addExpertiseHandler
);

router.get(
  "/expertise",
  authRequired,
  authorize(["TEACHER"]),
  listExpertiseHandler
);

router.delete(
  "/expertise/:id",
  authRequired,
  authorize(["TEACHER"]),
  deleteExpertiseHandler
);

/* ================================
   TEACHER PROFILE
================================ */

router.get(
  "/profile",
  authRequired,
  authorize(["TEACHER"]),
  getTeacherProfileHandler
);

router.put(
  "/profile",
  authRequired,
  authorize(["TEACHER"]),
  updateTeacherProfileHandler
);

/* ================================
    TEACHER RESUME META 
================================ */
router.get(
  "/resume/meta",
  authRequired,
  authorize("TEACHER"),
  getResumeMetaHandler
);

router.patch(
  "/resume",
  authRequired,
  authorize("TEACHER"),
  patchResumeMetaHandler
);

router.get(
  "/resume/full",
  authRequired,
  authorize("TEACHER"),
  getFullResumeHandler
);

/* ================================
    RESUME SNAPSHOTS
================================ */
router.post(
  "/resume/generate",
  authRequired,
  authorize("TEACHER"),
  generateResumeSnapshotHandler
);

router.get(
  "/resume/versions",
  authRequired,
  authorize("TEACHER"),
  listResumeSnapshotsHandler
);

router.get(
  "/resume/versions/:version",
  authRequired,
  authorize("TEACHER"),
  getResumeSnapshotHandler
);

router.put(
  "/resume/ui",
  authRequired,
  authorize("TEACHER"),
  updateResumeUIConfigHandler
);

router.get(
  "/resume/ui",
  authRequired,
  authorize("TEACHER"),
  getResumeUIConfigHandler
);

export default router;
