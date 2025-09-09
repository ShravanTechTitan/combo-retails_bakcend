import Product from "../models/Product.js";

export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const escapedQuery = escapeRegex(q);
    const regex = new RegExp(escapedQuery, "i");

    // 1️⃣ Tag matched products
    let tagMatchedProducts = await Product.find({ tags: { $regex: regex } })
      .populate({ path: "partCategoryId", select: "name" })
      .limit(50);

    if (tagMatchedProducts.length > 0) {
      let tagSuggestions = [];
      tagMatchedProducts.forEach((p) => {
        // Sirf matched tag le lo
        const matchedTags = p.tags.filter((t) => regex.test(t));

        matchedTags.forEach((tag) => {
          tagSuggestions.push({
            label: `${tag} - Universal ${p.partCategoryId?.name || ""}`,
            productId: p._id,
            category: p.partCategoryId?.name || "",
            matchType: "tag",
          });
        });
      });

      return res.json(tagSuggestions);
    }

    // 2️⃣ Regular search for name, model, brand
    let products = await Product.find({})
      .populate({ path: "modelIds", select: "name" })
      .populate({ path: "brandIds", select: "name" })
      .populate({ path: "partCategoryId", select: "name" })
      .limit(50);

    let suggestions = [];

    products.forEach((p) => {
      const nameMatch = regex.test(p.name || "");
      const matchingModels = p.modelIds.filter((m) =>
        regex.test(m.name || "")
      );
      const matchingBrands = p.brandIds.filter((b) =>
        regex.test(b.name || "")
      );

      // Name match → sab models ke saath
      if (nameMatch) {
        p.modelIds.forEach((m) => {
          suggestions.push({
            label: `${p.name || ""} ${m.name || ""} - Universal ${p.partCategoryId?.name || ""}`.trim(),
            productId: p._id,
            modelId: m._id,
            category: p.partCategoryId?.name || "",
            matchType: "name",
          });
        });
      }

      // Brand match → sab models ke saath
      if (matchingBrands.length > 0) {
        p.modelIds.forEach((m) => {
          suggestions.push({
            label: `${matchingBrands[0].name || ""} ${m.name || ""} - Universal ${p.partCategoryId?.name || ""}`.trim(),
            productId: p._id,
            modelId: m._id,
            category: p.partCategoryId?.name || "",
            matchType: "brand",
          });
        });
      }

      // Model match → sirf matching models
      matchingModels.forEach((m) => {
        suggestions.push({
          label: `${p.name || ""} ${m.name || ""} - Universal ${p.partCategoryId?.name || ""}`.trim(),
          productId: p._id,
          modelId: m._id,
          category: p.partCategoryId?.name || "",
          matchType: "model",
        });
      });
    });

    res.json(suggestions);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Utility to escape regex special chars
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
