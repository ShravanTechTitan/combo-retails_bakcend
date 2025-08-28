import express from "express";
import {
  createModel,
  getModels,
  getModelById,
  updateModel,
  deleteModel,
} from "../controllers/modelController.js";

const router = express.Router();

router.post("/", createModel);      // Create
router.get("/", getModels);         // Get All
router.get("/:id", getModelById);   // Get One
router.put("/:id", updateModel);    // Update
router.delete("/:id", deleteModel); // Delete

export default router;
