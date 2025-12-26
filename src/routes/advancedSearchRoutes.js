// routes/advancedSearchRoutes.js
import express from "express";
import { verifyAuth, verifyRole } from "../middleware/auth.js";
import {
  advancedSearch,
  enhancedAutocomplete,
  getSearchSuggestions,
  getSearchFilters,
} from "../controllers/advancedSearchController.js";
import { getSearchAnalytics } from "../controllers/searchAnalyticsController.js";

const router = express.Router();

// Advanced search (optional auth - works for both logged in and anonymous users)
router.get("/advanced", advancedSearch);

// Enhanced autocomplete
router.get("/autocomplete", enhancedAutocomplete);

// Get search suggestions
router.get("/suggestions", getSearchSuggestions);

// Get search filters
router.get("/filters", getSearchFilters);

// Admin: Search analytics
router.get("/analytics", verifyAuth, verifyRole(["admin", "superadmin"]), getSearchAnalytics);

export default router;

