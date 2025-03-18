import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  generateGuidedQuestions,
  generateSchemaFromAnswers,
} from "../services/aiService";
import logger from "../utils/logger";

// Temporary in-memory storage
const projects: Record<string, any> = {};
const validTypes = ["SQL", "NoSQL"];

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;

    // Validate required fields
    if (!name || !type) {
      logger.warn("Missing required fields: name or type");
      return res
        .status(400)
        .json({ error: "Project name and type are required" });
    }

    // Validate `type` value
    if (!validTypes.includes(type)) {
      logger.warn(`Invalid project type received: ${type}`);
      return res
        .status(400)
        .json({ error: "Project type must be either 'SQL' or 'NoSQL'" });
    }

    // Create project
    const projectId = uuidv4();
    const newProject = { id: projectId, name, type, createdAt: new Date() };

    projects[projectId] = newProject;
    logger.info(`Project created: ${JSON.stringify(newProject)}`);

    return res
      .status(201)
      .json({ message: "Project created successfully", project: newProject });
  } catch (error) {
    logger.error("Error creating project", { error });
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getGuidedQuestions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = projects[id];

    if (!project) {
      logger.warn(`Project not found: ${id}`);
      return res.status(404).json({ error: "Project not found" });
    }

    // Generate guided questions
    const questions = await generateGuidedQuestions(project.type);

    // Store questions for reference
    project.questions = questions;
    project.answers = {}; // Placeholder for user responses

    logger.info(`Generated questions for project: ${id}`);
    res.status(200).json({ message: "Guided questions generated", questions });
  } catch (error) {
    logger.error("Error generating guided questions", { error });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const generateProjectSchemaFromAnswers = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const project = projects[id];

    if (!project) {
      logger.warn(`Project not found: ${id}`);
      return res.status(404).json({ error: "Project not found" });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ error: "Invalid or missing answers" });
    }

    // Store answers
    project.answers = answers;

    // Generate schema based on user answers
    const schema = await generateSchemaFromAnswers(
      project.name,
      project.type,
      answers
    );

    // Store schema in project
    project.schema = schema;

    logger.info(`Schema generated for project: ${id}`);
    res.status(200).json({ message: "Schema generated successfully", schema });
  } catch (error) {
    logger.error("Error generating project schema", { error });
    res.status(500).json({ error: "Internal Server Error" });
  }
};
