import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: Number,
    image: String,

    partCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "PartCategory" },
    brandIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
    modelIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Model" }],

    isTrending: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }], // ✅ just an array of strings
  },
  { timestamps: true }
);

// Add indexes for better search performance
productSchema.index({ name: "text", tags: "text", description: "text" });
productSchema.index({ brandIds: 1 });
productSchema.index({ partCategoryId: 1 });
productSchema.index({ modelIds: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isTrending: 1 });

// 🔥 Pre-save hook to auto-generate tags
productSchema.pre("save", async function (next) {
  if (!this.isModified("name") && !this.isModified("modelIds")) return next();

  let tags = [];

  if (this.name) tags.push(this.name.toLowerCase());

  if (this.modelIds && this.modelIds.length > 0) {
    for (let modelId of this.modelIds) {
      const model = await mongoose.model("Model").findById(modelId).select("name");
      if (model?.name) {
        tags.push(`${this.name.toLowerCase()} ${model.name.toLowerCase()}`);
        tags.push(model.name.toLowerCase());
      }
    }
  }

  this.tags = [...new Set(tags)]; // remove duplicates
  next();
});
productSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (!update) return next();

  const product = await this.model.findOne(this.getQuery()).populate("modelIds", "name");

  let tags = [];

  const newName = update.name || product.name;
  const newModelIds = update.modelIds || product.modelIds;

  if (newName) tags.push(newName.toLowerCase());

  if (newModelIds && newModelIds.length > 0) {
    for (let modelId of newModelIds) {
      const model = await mongoose.model("Model").findById(modelId).select("name");
      if (model?.name) {
        tags.push(`${newName.toLowerCase()} ${model.name.toLowerCase()}`);
        tags.push(model.name.toLowerCase());
      }
    }
  }

  update.tags = [...new Set(tags)];
  this.setUpdate(update);
  next();
});


// Check if model already exists to prevent overwrite errors during hot reload
export default mongoose.models.Product || mongoose.model("Product", productSchema);
