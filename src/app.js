import path from "path";
import express from "express"; 
import cors from "cors"; 
import pinoHttp from "pino-http"; 
import multer from "multer"; 
import { fileURLToPath } from "url";
import { logger } from "./config/logger.js";
import { errorHandler } from "./middlewares/error.middleware.js"; 
import routes from "./routes.js"; 

/* PATH FIX FOR ES MODULES  */
 const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 
const app = express(); 
/* --------------------------------------------- CORE MIDDLEWARES --------------------------------------------- */ app.use(cors()); 
app.use(express.json({ limit: "2mb" })); 
app.use(pinoHttp({ logger })); 
/* --------------------------------------------- STATIC FILES (FIXED) -----------------------------------------*/ 
app.use( "/uploads", express.static(path.join(__dirname, "../uploads")) ); 
/* --------------------------------------------- API ROUTES --------------------------------------------- */ 
app.use("/api", routes); 
/* --------------------------------------------- MULTER ERROR HANDLER --------------------------------------------- */ 
app.use((err, req, res, next) => { if (err instanceof multer.MulterError) { return res.status(400).json({ success: false, message: err.message }); } if (err?.message === "Only image files allowed") { return res.status(400).json({ success: false, message: err.message }); } next(err); });
/* --------------------------------------------- GLOBAL ERROR HANDLER ------------------------------------------ */ app.use(errorHandler); 
export default app;