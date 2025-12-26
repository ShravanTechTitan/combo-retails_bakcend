// controllers/advancedSearchController.js
import Product from "../models/Product.js";
import Brand from "../models/Brand.js";
import Model from "../models/Model.js";
import PartCategory from "../models/partCategory.js";
import SearchHistory from "../models/searchHistory.js";

// Advanced search with filters and ranking
export const advancedSearch = async (req, res) => {
  try {
    const {
      q,
      brandId,
      categoryId,
      modelId,
      sortBy = "relevance", // relevance, name
      page = 1,
      limit = 20,
    } = req.query;

    const userId = req.user?._id || null;
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "unknown";

    // Build search query
    const query = {};
    const searchTerms = q ? q.trim().split(/\s+/).filter(t => t.length > 0) : [];

    if (searchTerms.length > 0) {
      // Multi-field search with fuzzy matching - search for all terms
      const searchRegex = searchTerms.map(term => 
        new RegExp(escapeRegex(term), "i")
      );
      const combinedRegex = new RegExp(searchTerms.map(t => escapeRegex(t)).join("|"), "i");

      // Use $and to ensure all terms are found somewhere in the product
      query.$and = searchTerms.map(term => {
        const termRegex = new RegExp(escapeRegex(term), "i");
        return {
          $or: [
            { name: termRegex },
            { tags: termRegex },
            { description: termRegex },
          ]
        };
      });

      // Also allow products where combined search matches
      query.$or = [
        { name: combinedRegex },
        { tags: { $in: searchRegex } },
        { description: combinedRegex },
      ];
    }

    // Apply filters
    if (brandId) query.brandIds = brandId;
    if (categoryId) query.partCategoryId = categoryId;
    if (modelId) query.modelIds = modelId;

    // Fetch products with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let products = await Product.find(query)
      .populate("brandIds", "name")
      .populate("modelIds", "name")
      .populate("partCategoryId", "name icon")
      .lean();

    // Calculate relevance score and rank
    if (q && searchTerms.length > 0) {
      products = products.map(product => {
        let score = 0;
        const searchLower = q.toLowerCase();
        const nameLower = (product.name || "").toLowerCase();
        const tagsLower = (product.tags || []).join(" ").toLowerCase();

        // Exact match in name (highest priority)
        if (nameLower === searchLower) score += 100;
        else if (nameLower.startsWith(searchLower)) score += 50;
        else if (nameLower.includes(searchLower)) score += 30;

        // Tag matches
        if (product.tags) {
          product.tags.forEach(tag => {
            if (tag.toLowerCase() === searchLower) score += 40;
            else if (tag.toLowerCase().includes(searchLower)) score += 20;
          });
        }

        // Brand/Model matches
        if (product.brandIds) {
          product.brandIds.forEach(brand => {
            if (brand.name?.toLowerCase().includes(searchLower)) score += 15;
          });
        }
        if (product.modelIds) {
          product.modelIds.forEach(model => {
            if (model.name?.toLowerCase().includes(searchLower)) score += 15;
          });
        }

        // Description match (lower priority)
        if (product.description?.toLowerCase().includes(searchLower)) score += 10;

        return { ...product, relevanceScore: score };
      });

      // Sort by relevance
      products.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // Apply other sorting
    if (sortBy === "name") {
      products.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    // Paginate
    const total = products.length;
    const paginatedProducts = products.slice(skip, skip + parseInt(limit));

    // Log search history
    if (q) {
      try {
        await SearchHistory.create({
          user: userId,
          query: q,
          resultsCount: total,
          ipAddress,
        });

        // Log activity if user is logged in
        if (userId) {
          try {
            const { logActivity } = await import("./activityController.js");
            logActivity(userId, "search", `Searched: ${q}`, req);
          } catch (activityErr) {
            console.error("Activity logging error:", activityErr);
          }
        }
      } catch (historyErr) {
        console.error("Error logging search history:", historyErr);
      }
    }

    res.json({
      products: paginatedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      filters: {
        brandId,
        categoryId,
        modelId,
      },
    });
  } catch (error) {
    console.error("Advanced search error:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

// Enhanced autocomplete with suggestions
export const enhancedAutocomplete = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ suggestions: [], popular: [] });

    const searchTerm = escapeRegex(q);
    const regex = new RegExp(searchTerm, "i");

    // Get popular searches
    const popularSearches = await SearchHistory.aggregate([
      { $match: { query: { $regex: regex } } },
      { $group: { _id: "$query", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Search products with better ranking
    const products = await Product.find({
      $or: [
        { name: { $regex: regex } },
        { tags: { $in: [regex] } },
      ],
    })
      .populate("brandIds", "name")
      .populate("modelIds", "name")
      .populate("partCategoryId", "name")
      .limit(10)
      .lean();

    const suggestions = [];
    const seen = new Set();

    products.forEach((product) => {
      // Name matches
      if (regex.test(product.name || "")) {
        product.modelIds?.forEach((model) => {
          const key = `${product._id}-${model._id}`;
          if (!seen.has(key)) {
            seen.add(key);
            suggestions.push({
              label: `${product.name} ${model.name} - Universal ${product.partCategoryId?.name || ""}`,
              productId: product._id,
              modelId: model._id,
              category: product.partCategoryId?.name || "",
              matchType: "name",
              relevance: 10,
            });
          }
        });
      }

      // Tag matches
      if (product.tags) {
        product.tags.forEach((tag) => {
          if (regex.test(tag)) {
            const key = `tag-${tag}-${product._id}`;
            if (!seen.has(key)) {
              seen.add(key);
              suggestions.push({
                label: `${tag} - Universal ${product.partCategoryId?.name || ""}`,
                productId: product._id,
                category: product.partCategoryId?.name || "",
                matchType: "tag",
                relevance: 8,
              });
            }
          }
        });
      }
    });

    // Sort by relevance
    suggestions.sort((a, b) => b.relevance - a.relevance);

    res.json({
      suggestions: suggestions.slice(0, 10),
      popular: popularSearches.map((s) => s._id),
    });
  } catch (error) {
    console.error("Autocomplete error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get search suggestions (popular searches, recent searches)
export const getSearchSuggestions = async (req, res) => {
  try {
    const userId = req.user?._id || null;

    // Popular searches (all users)
    const popularSearches = await SearchHistory.aggregate([
      { $group: { _id: "$query", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Recent searches (for logged in users)
    let recentSearches = [];
    if (userId) {
      recentSearches = await SearchHistory.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("query createdAt")
        .lean();
    }

    res.json({
      popular: popularSearches.map((s) => ({ query: s._id, count: s.count })),
      recent: recentSearches.map((s) => s.query),
    });
  } catch (error) {
    console.error("Get suggestions error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get search filters (brands, categories, models)
export const getSearchFilters = async (req, res) => {
  try {
    const Model = (await import("../models/Model.js")).default;
    const [brands, categories, models] = await Promise.all([
      Brand.find().select("name").sort({ name: 1 }),
      PartCategory.find().select("name icon").sort({ name: 1 }),
      Model.find().populate("brandId", "name").select("name brandId").sort({ name: 1 }),
    ]);

    res.json({
      brands,
      categories,
      models,
    });
  } catch (error) {
    console.error("Get filters error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Utility: escape regex
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

