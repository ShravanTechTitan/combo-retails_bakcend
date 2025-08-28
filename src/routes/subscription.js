// routes/subscription.js
router.post("/activate", verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id);
  user.subscriptionActive = true;
  user.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await user.save();

  res.json({ message: "Subscription activated for 30 days" });
});
