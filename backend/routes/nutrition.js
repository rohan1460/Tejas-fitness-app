const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const Nutrition = require("../models/Nutrition");
const authMiddleware = require("../middleware/authMiddleware");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Get today's nutrition
router.get("/today", authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let nutrition = await Nutrition.findOne({
      userId: req.user.id,
      date: { $gte: today }
    });
    if (!nutrition) {
      nutrition = await Nutrition.create({ userId: req.user.id, meals: [] });
    }
    res.json(nutrition);
  } catch (err) {
    res.status(500).json({ error: "Server error!" });
  }
});

// Add meal
router.post("/add-meal", authMiddleware, async (req, res) => {
  const { name, calories, protein, carbs, fats, time } = req.body;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let nutrition = await Nutrition.findOne({
      userId: req.user.id,
      date: { $gte: today }
    });
    if (!nutrition) {
      nutrition = await Nutrition.create({ userId: req.user.id, meals: [] });
    }
    nutrition.meals.push({ name, calories, protein, carbs, fats, time });
    nutrition.totalCalories += calories;
    nutrition.totalProtein += protein;
    nutrition.totalCarbs += carbs;
    nutrition.totalFats += fats;
    await nutrition.save();
    res.json(nutrition);
  } catch (err) {
    res.status(500).json({ error: "Server error!" });
  }
});

// Add water intake
router.put("/water", authMiddleware, async (req, res) => {
  const { glasses } = req.body;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let nutrition = await Nutrition.findOne({
      userId: req.user.id,
      date: { $gte: today }
    });
    if (!nutrition) {
      nutrition = await Nutrition.create({ userId: req.user.id, meals: [] });
    }
    nutrition.waterIntake = glasses;
    await nutrition.save();
    res.json(nutrition);
  } catch (err) {
    res.status(500).json({ error: "Server error!" });
  }
});

// Scan food from image using Groq Vision (with model fallback)
router.post("/scan-food", authMiddleware, async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: "No image provided" });

  const prompt = `You are an expert Indian food vision analyst. Analyze this food photo carefully.

CRITICAL RULES:
1. Use INDIAN HINDI names: "Chole" (NOT "Chickpea curry"), "Rajma", "Sambhar", "Chaas" (NOT "Buttermilk"), "Dahi" (NOT "Curd"), "Roti" (NOT "Chapati").
2. Distinguish CAREFULLY: Chickpeas/Chole (round white-yellow beans) ≠ Chicken (meat). Beans are vegetarian.
3. Be CONSERVATIVE with quantities — estimate from what you actually SEE in the image, not assumptions.
4. For thali/combo plates: typical portions are 1 katori per item, 1-2 roti pieces.
5. DO NOT hallucinate items — only list what is clearly visible.
6. If a curry has visible chickpeas/beans, it's Chole/Rajma — never call it "chicken".

Indian food reference (per serving):
- Roti/Chapati (1 piece, 40g): 80 kcal, P:3 C:15 F:1
- Dal (1 katori, 150g): 120 kcal, P:7 C:18 F:2
- Sambhar (1 katori): 90 kcal, P:5 C:14 F:1
- Rice/Chawal (1 katori, 150g): 180 kcal, P:4 C:40 F:0.5
- Chole/Chana Masala (1 katori): 200 kcal, P:9 C:28 F:6
- Rajma (1 katori): 210 kcal, P:10 C:30 F:5
- Sabzi/mixed veg (1 katori): 100 kcal, P:3 C:12 F:5
- Paneer curry (1 katori): 280 kcal, P:14 C:8 F:20
- Salad/onion-tomato (1 bowl): 30 kcal, P:1 C:6 F:0
- Onion slices (1 small portion): 15 kcal, P:0 C:3 F:0
- Lemon wedge: 2 kcal
- Paneer plain (100g): 265 kcal, P:18 C:1 F:20
- Curd/Dahi (1 katori): 90 kcal, P:5 C:7 F:5
- Chaas/Buttermilk (1 glass): 40 kcal, P:2 C:5 F:1
- Lassi (1 glass): 180 kcal, P:6 C:25 F:6
- Egg boiled (1 piece): 70 kcal, P:6 C:1 F:5
- Chicken curry (1 katori, ONLY if actual meat visible): 180 kcal, P:20 C:5 F:9
- Idli (1 piece): 35 kcal, P:1 C:7 F:0
- Dosa (1 piece): 130 kcal, P:3 C:25 F:2
- Samosa (1 piece): 250 kcal, P:4 C:30 F:13
- Biryani (1 plate): 450 kcal, P:15 C:65 F:14
- Poha (1 plate): 250 kcal, P:5 C:45 F:5
- Chai with sugar (1 cup): 60 kcal, P:2 C:9 F:2

Reply ONLY in valid JSON (no markdown, no explanation):
{"items":[{"name":"Roti","quantity":2,"unit":"piece","calories":160,"protein":6,"carbs":30,"fats":2}]}

Units allowed: piece, katori, glass, bowl, plate, cup, g, ml. Round all numbers to integers. If image is not food, return {"items":[]}.`;

  // Try multiple vision models in order — first one that works wins
  const VISION_MODELS = [
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
    "llama-3.2-90b-vision-preview",
    "llama-3.2-11b-vision-preview",
  ];

  let completion = null;
  let lastError = null;
  let modelUsed = null;

  for (const model of VISION_MODELS) {
    try {
      console.log(`[scan-food] Trying model: ${model}`);
      completion = await groq.chat.completions.create({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: image } }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.2,
      });
      modelUsed = model;
      console.log(`[scan-food] ✅ Success with: ${model}`);
      break;
    } catch (err) {
      console.log(`[scan-food] ❌ Failed with ${model}: ${err.message}`);
      lastError = err;
    }
  }

  if (!completion) {
    console.log("=== ALL MODELS FAILED ===");
    console.log("Last error:", lastError?.message);
    console.log("Status:", lastError?.status);
    console.log("Error obj:", JSON.stringify(lastError?.error || {}, null, 2));
    console.log("=========================");
    return res.status(500).json({
      error: "Vision AI unavailable",
      detail: lastError?.message || "All vision models failed",
      status: lastError?.status,
    });
  }

  try {
    const text = completion.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log("[scan-food] No JSON found in response:", text);
      return res.status(500).json({ error: "AI response unreadable", detail: text.slice(0, 200) });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const items = (parsed.items || []).map(i => ({
      name: i.name || "Unknown",
      quantity: Number(i.quantity) || 1,
      unit: i.unit || "piece",
      calories: Math.round(Number(i.calories) || 0),
      protein: Math.round(Number(i.protein) || 0),
      carbs: Math.round(Number(i.carbs) || 0),
      fats: Math.round(Number(i.fats) || 0),
    }));

    const total = items.reduce((acc, it) => ({
      calories: acc.calories + it.calories,
      protein: acc.protein + it.protein,
      carbs: acc.carbs + it.carbs,
      fats: acc.fats + it.fats,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    res.json({ items, total, modelUsed });
  } catch (err) {
    console.log("[scan-food] Parse error:", err.message);
    res.status(500).json({ error: "Failed to parse AI response", detail: err.message });
  }
});

// Get history
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const history = await Nutrition.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(7);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Server error!" });
  }
});

module.exports = router;