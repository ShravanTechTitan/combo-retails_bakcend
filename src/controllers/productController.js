import Product from "../models/Product.js";

//  Create Product
export const createProduct = async (req, res) => {
  try {
    const { name, brandIds,modelIds, partCategoryId, price, description } = req.body;

    if (!name || !brandIds || !partCategoryId || price == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await Product.create({
      name,
      brandIds,
      partCategoryId,
      price,
      modelIds,
      description,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("brandIds", "name")
      .populate("partCategoryId", "name")
      .populate("modelIds","name");

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get Product brandId
export const getProductById = async (req, res) => {
  const { id } = req.params; // ✅ fixed: use req.params
  try {
    const product = await Product.findById(id)
      .populate("brandIds", "name")        // ✅ match schema
      .populate("partCategoryId", "name")  // ✅ match schema
      .populate("modelIds", "name");       // ✅ optional, for models

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: error.message });
  }
};


// Get Product brandId
export const getProductByBrandId = async (req, res) => {
  try {
    const { brandId } = req.params;

    const products = await Product.find({ brandIds: brandId })
      .populate("brandIds", "name")          
      .populate("partCategoryId", "name")    
      .populate("modelIds", "name");       

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found for this brand" });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get Product brandId
export const getProductByPartCategoryId = async (req, res) => {
  try {
    const { brandId,partCategoryId } = req.params;

    const products = await Product.find({ brandIds: brandId,partCategoryId:partCategoryId })
      .populate("brandIds", "name")          
      .populate("partCategoryId", "name")    
      .populate("modelIds", "name");       

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found for this brand" });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//  Update Product
export const updateProduct = async (req, res) => {
  try {
    const { name, brandIds,modelIds, partCategoryId, price, stock, description } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, brandIds, partCategoryId,modelIds, price, stock, description },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
