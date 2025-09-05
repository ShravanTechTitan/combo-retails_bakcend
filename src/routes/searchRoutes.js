// routes/searchRoutes.js
import express from "express";
import { searchProducts } from "../controllers/searchPController.js";

const router = express.Router();

router.get("/search", searchProducts);

export default router;
