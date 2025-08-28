import Model from "../models/Model.js";

// Create a new brand
export const createModel = async (req, res) => {
  try {
    const { name,series, brandId } = req.body;
    console.log(req.body)
    if (!name || !brandId) {
      return res.status(400).json({ message: "Name and Brand are required" });
    }

    const model = await Model.create({ name, series, brandId});
    res.status(201).json(model);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getModels = async (req, res) => {
  try {
    const models = await Model.find().populate("brandId", "name");
    res.status(200).json(models);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getModelById = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id).populate("brandId", "name");

    if (!model) {
      return res.status(404).json({ message: "Model not found" });
    }

    res.status(200).json(model);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateModel = async (req, res) => {
  try {
    const { name,series, brandId } = req.body;
    const model = await Model.findByIdAndUpdate(
      req.params.id,
      { name,series, brandId},
      { new: true }
    );

    if (!model) {
      return res.status(404).json({ message: "Model not found" });
    }

    res.status(200).json(model);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Delete brand
export const deleteModel = async (req, res) => {
  try {
    const model= await Model.findByIdAndDelete(req.params.id);

    if (!model) {
      return res.status(404).json({ message: "Model not found" });
    }

    res.status(200).json({ message: "Model deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
