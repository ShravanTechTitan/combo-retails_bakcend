import express from "express";
import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";

const router = express.Router();

router.post("/", createBlog);      // Create
router.get("/", getBlogs);         // Get All
router.get("/:id", getBlogById);   // Get One
router.put("/:id", updateBlog);    // Update
router.delete("/:id", deleteBlog); // Delete

export default router;

