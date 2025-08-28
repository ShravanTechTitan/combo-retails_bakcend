import Brand from "../models/Brand.js";

// Create a new brand
export const createBrand = async (req, res) => {
  try {
    const { name,country, deviceCategoryId } = req.body;

    if (!name || !deviceCategoryId) {
      return res.status(400).json({ message: "Name and Category are required" });
    }

    const brand = await Brand.create({ name, country, deviceCategoryId});
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all brands
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().populate("deviceCategoryId", "name");
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Get single brand
export const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id).populate("deviceCategoryId", "name");

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Update brand
export const updateBrand = async (req, res) => {
  try {
    const { name,country, deviceCategoryId } = req.body;
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { name,country, deviceCategoryId},
      { new: true }
    );

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Delete brand
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
