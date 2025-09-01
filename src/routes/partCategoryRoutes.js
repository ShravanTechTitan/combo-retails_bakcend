import express from "express";
import { createCategory, getCategories, updateCategory, deleteCategory,getCategoryById} from "../controllers/partCategoryController.js";

const router = express.Router();

router.post("/", createCategory);
router.get("/", getCategories);
router.get("/:id",getCategoryById)
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);


export default router;
