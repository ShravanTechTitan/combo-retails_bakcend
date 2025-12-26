// controllers/exportController.js
import User from "../models/user.js";
import UserSubscription from "../models/userSubscriptionModel.js";
import Product from "../models/Product.js";
import Subscription from "../models/Subscription.js";

// Helper function to convert data to CSV
const convertToCSV = (data, headers) => {
  const csvHeaders = headers.join(",");
  const csvRows = data.map((row) => 
    headers.map((header) => {
      const value = row[header] || "";
      // Escape commas and quotes in CSV
      if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(",")
  );
  return [csvHeaders, ...csvRows].join("\n");
};

// Export users to CSV
export const exportUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    
    const csvData = users.map((user) => ({
      name: user.name || "",
      email: user.email || "",
      number: user.number || "",
      role: user.role || "",
      createdAt: new Date(user.createdAt).toLocaleDateString(),
    }));
    
    const csv = convertToCSV(csvData, ["name", "email", "number", "role", "createdAt"]);
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export subscriptions to CSV
export const exportSubscriptions = async (req, res) => {
  try {
    const subscriptions = await UserSubscription.find()
      .populate("user", "name email")
      .populate("plan", "name price duration");
    
    const csvData = subscriptions.map((sub) => ({
      userName: sub.user?.name || "",
      userEmail: sub.user?.email || "",
      planName: sub.plan?.name || "",
      planPrice: sub.plan?.price || 0,
      startDate: new Date(sub.startDate).toLocaleDateString(),
      endDate: new Date(sub.endDate).toLocaleDateString(),
      status: sub.status || "",
      totalPayments: sub.payments?.length || 0,
      totalAmount: sub.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    }));
    
    const csv = convertToCSV(csvData, [
      "userName", "userEmail", "planName", "planPrice", 
      "startDate", "endDate", "status", "totalPayments", "totalAmount"
    ]);
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=subscriptions.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export products to CSV
export const exportProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("brandId", "name")
      .populate("modelId", "name")
      .populate("partCategoryId", "name");
    
    const csvData = products.map((product) => ({
      name: product.name || "",
      brand: product.brandId?.name || "",
      model: product.modelId?.name || "",
      category: product.partCategoryId?.name || "",
      price: product.price || 0,
      stock: product.stock || 0,
      sku: product.sku || "",
      createdAt: new Date(product.createdAt).toLocaleDateString(),
    }));
    
    const csv = convertToCSV(csvData, [
      "name", "brand", "model", "category", "price", "stock", "sku", "createdAt"
    ]);
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=products.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export revenue report
export const exportRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const subscriptions = await UserSubscription.find(query)
      .populate("user", "name email")
      .populate("plan", "name price");
    
    const csvData = [];
    subscriptions.forEach((sub) => {
      if (sub.payments && sub.payments.length > 0) {
        sub.payments.forEach((payment) => {
          if (payment.amount > 0) {
            csvData.push({
              date: new Date(payment.date || sub.createdAt).toLocaleDateString(),
              userName: sub.user?.name || "",
              userEmail: sub.user?.email || "",
              planName: sub.plan?.name || "",
              amount: payment.amount || 0,
              orderId: payment.orderId || "",
              paymentId: payment.paymentId || "",
            });
          }
        });
      }
    });
    
    const csv = convertToCSV(csvData, [
      "date", "userName", "userEmail", "planName", "amount", "orderId", "paymentId"
    ]);
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=revenue-report-${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

