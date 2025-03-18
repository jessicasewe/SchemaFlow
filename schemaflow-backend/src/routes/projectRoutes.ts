import express from "express";
import {
  createProject,
  getGuidedQuestions,
  generateProjectSchemaFromAnswers,
} from "../controllers/projectController";

const router = express.Router();
router.post("/projects", createProject as any);
router.post("/projects/:id/questions", getGuidedQuestions as any);
router.post("/projects/:id/schema", generateProjectSchemaFromAnswers as any);

export default router;
