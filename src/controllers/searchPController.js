import Product from "../models/Product.js";

export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    // Split query into individual words for multi-word search
    const searchTerms = q.trim().split(/\s+/).filter(t => t.length > 0);
    const escapedTerms = searchTerms.map(term => escapeRegex(term));
    
    // Create regex patterns for each term
    const regexPatterns = escapedTerms.map(term => new RegExp(term, "i"));
    const combinedRegex = new RegExp(escapedTerms.join("|"), "i");

    // 1️⃣ Tag matched products - check if all terms match in tags
    let tagMatchedProducts = await Product.find({
      $or: [
        { tags: { $in: regexPatterns } },
        { tags: { $regex: combinedRegex } }
      ]
    })
      .populate({ path: "partCategoryId", select: "name" })
      .populate({ path: "modelIds", select: "name" })
      .populate({ path: "brandIds", select: "name" })
      .limit(100);

    if (tagMatchedProducts.length > 0) {
      let tagSuggestions = [];
      tagMatchedProducts.forEach((p) => {
        // Check if all search terms are found in tags, brand, or model
        const allTermsMatch = searchTerms.every(term => {
          const termLower = term.toLowerCase();
          const tagsLower = (p.tags || []).join(" ").toLowerCase();
          const brandNames = (p.brandIds || []).map(b => b.name?.toLowerCase() || "").join(" ");
          const modelNames = (p.modelIds || []).map(m => m.name?.toLowerCase() || "").join(" ");
          const nameLower = (p.name || "").toLowerCase();
          
          return tagsLower.includes(termLower) || 
                 brandNames.includes(termLower) || 
                 modelNames.includes(termLower) ||
                 nameLower.includes(termLower);
        });

        if (allTermsMatch && p.modelIds && p.modelIds.length > 0) {
          p.modelIds.forEach((m) => {
            const firstModel = p.modelIds[0];
            tagSuggestions.push({
              label: `${p.name || ""} ${firstModel.name || ""} - Universal ${p.partCategoryId?.name || ""}`,
              productId: p._id,
              modelId: m._id,
              category: p.partCategoryId?.name || "",
              matchType: "tag",
            });
          });
        }
      });

      if (tagSuggestions.length > 0) {
        return res.json(dedupeSuggestions(tagSuggestions));
      }
    }

    // 2️⃣ Regular search for name, model, brand - handle multi-word queries
    let products = await Product.find({})
      .populate({ path: "modelIds", select: "name" })
      .populate({ path: "brandIds", select: "name" })
      .populate({ path: "partCategoryId", select: "name" })
      .limit(100);

    let suggestions = [];

    products.forEach((p) => {
      const nameLower = (p.name || "").toLowerCase();
      const brandNames = (p.brandIds || []).map(b => b.name?.toLowerCase() || "").join(" ");
      const modelNames = (p.modelIds || []).map(m => m.name?.toLowerCase() || "").join(" ");
      const tagsLower = (p.tags || []).join(" ").toLowerCase();
      const allText = `${nameLower} ${brandNames} ${modelNames} ${tagsLower}`.toLowerCase();

      // Check if all search terms are found in the product
      const allTermsMatch = searchTerms.every(term => 
        allText.includes(term.toLowerCase())
      );

      if (!allTermsMatch) return;

      // Name match → sab models ke saath
      const nameMatch = searchTerms.some(term => nameLower.includes(term.toLowerCase()));
      if (nameMatch && p.modelIds && p.modelIds.length > 0) {
        p.modelIds.forEach((m) => {
          suggestions.push({
            label: `${p.name || ""} ${m.name || ""} - Universal ${
              p.partCategoryId?.name || ""
            }`.trim(),
            productId: p._id,
            modelId: m._id,
            category: p.partCategoryId?.name || "",
            matchType: "name",
          });
        });
      }

      // Brand match → sab models ke saath
      const matchingBrands = p.brandIds.filter((b) =>
        searchTerms.some(term => b.name?.toLowerCase().includes(term.toLowerCase()))
      );
      if (matchingBrands.length > 0 && p.modelIds && p.modelIds.length > 0) {
        p.modelIds.forEach((m) => {
          suggestions.push({
            label: `${matchingBrands[0].name || ""} ${m.name || ""} - Universal ${
              p.partCategoryId?.name || ""
            }`.trim(),
            productId: p._id,
            modelId: m._id,
            category: p.partCategoryId?.name || "",
            matchType: "brand",
          });
        });
      }

      // Model match → sirf matching models
      const matchingModels = p.modelIds.filter((m) =>
        searchTerms.some(term => m.name?.toLowerCase().includes(term.toLowerCase()))
      );
      matchingModels.forEach((m) => {
        suggestions.push({
          label: `${p.name || ""} ${m.name || ""} - Universal ${
            p.partCategoryId?.name || ""
          }`.trim(),
          productId: p._id,
          modelId: m._id,
          category: p.partCategoryId?.name || "",
          matchType: "model",
        });
      });
    });

    res.json(dedupeSuggestions(suggestions));
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Utility: escape regex special chars
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ✅ Utility: remove duplicates (unique by productId + modelId + label)
function dedupeSuggestions(list) {
  const seen = new Map();
  list.forEach((item) => {
    const key = `${item.modelId || ""}-${item.label}`;
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  });
  return Array.from(seen.values());
}
