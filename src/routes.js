import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import authSessionRoutes from "./modules/auth/auth.session.routes.js";
import teacherRoutes from "./modules/teachers/teacher.routes.js";
import postRoutes from "./modules/posts/posts.routes.js";
import notificationRoutes from "./modules/notifications/notifications.routes.js";






const router = express.Router();
router.use("/auth", authRoutes);


router.use("/users", usersRoutes);
router.use("/auth", authSessionRoutes);
router.use("/teachers", teacherRoutes);
router.use("/posts", postRoutes)
router.use("/api/notifications", notificationRoutes);

export default router;
