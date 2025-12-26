// controllers/invoiceController.js
import UserSubscription from "../models/userSubscriptionModel.js";
import User from "../models/user.js";

// Generate invoice PDF (simplified - returns HTML that can be converted to PDF)
export const generateInvoice = async (req, res) => {
  try {
    const { subscriptionId, paymentIndex = 0 } = req.params;
    
    const subscription = await UserSubscription.findById(subscriptionId)
      .populate("user", "name email number")
      .populate("plan", "name price duration");
    
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    
    const payment = subscription.payments[paymentIndex];
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${payment.orderId}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; }
    .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .section { margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #4F46E5; color: white; }
    .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Universal Combo</h1>
    <p>Invoice</p>
  </div>
  
  <div class="invoice-details">
    <div>
      <h3>Bill To:</h3>
      <p>${subscription.user?.name || "N/A"}</p>
      <p>${subscription.user?.email || "N/A"}</p>
      ${subscription.user?.number ? `<p>${subscription.user.number}</p>` : ""}
    </div>
    <div>
      <p><strong>Invoice #:</strong> ${payment.orderId}</p>
      <p><strong>Date:</strong> ${new Date(payment.date || subscription.createdAt).toLocaleDateString()}</p>
      <p><strong>Payment ID:</strong> ${payment.paymentId || "N/A"}</p>
    </div>
  </div>
  
  <div class="section">
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Duration</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${subscription.plan?.name || "Subscription"}</td>
          <td>${subscription.plan?.duration || "N/A"}</td>
          <td>₹${payment.amount || 0}</td>
        </tr>
      </tbody>
    </table>
    <div class="total">
      <p>Total: ₹${payment.amount || 0}</p>
    </div>
  </div>
  
  <div class="section">
    <p><strong>Thank you for your business!</strong></p>
  </div>
</body>
</html>`;
    
    res.setHeader("Content-Type", "text/html");
    res.send(invoiceHTML);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

