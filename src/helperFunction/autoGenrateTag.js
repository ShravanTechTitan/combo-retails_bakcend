import mongoose from "mongoose";
import Product from "./src/models/Product.js";
import Model from "./src/models/Model.js";
import 'dotenv/config';

// 1️⃣ Connect to MongoDB
const mongoURI = process.env.MONGO_URI; // replace with your DB name
mongoose.set("strictQuery", false); // optional, suppress warnings
await mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log("MongoDB connected!");

// 2️⃣ Generate product tags
const generateProductTags = async () => {
  try {
    const products = await Product.find({}).populate("modelIds", "name");

    for (let p of products) {
      let tags = [];

      if (p.name) tags.push(p.name.toLowerCase());

      p.modelIds.forEach((m) => {
        if (p.name && m.name) tags.push(`${p.name.toLowerCase()} ${m.name.toLowerCase()}`);
        if (m.name) tags.push(m.name.toLowerCase());
      });

      tags = [...new Set(tags)];
      p.tags = tags;
      await p.save();
    }

    console.log("All product tags generated successfully!");
    process.exit(0); // exit after completion
  } catch (err) {
    console.error("Error generating tags:", err);
    process.exit(1);
  }
};

// 3️⃣ Run the tag generation
await generateProductTags();
