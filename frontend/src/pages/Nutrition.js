import { useState, useEffect } from "react";
import axios from "axios";

function Nutrition({ darkMode }) {
  const [nutrition, setNutrition] = useState(null);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [mealType, setMealType] = useState("Lunch");
  const [water, setWater] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(null);
  const token = localStorage.getItem("token");

  const emptyItem = { name: "", quantity: 1, unit: "katori", calories: 0, protein: 0, carbs: 0, fats: 0 };
  const [foodItems, setFoodItems] = useState([{ ...emptyItem }]);

  const bg = darkMode ? "#1a1a1a" : "#f5f5f5";
  const cardBg = darkMode ? "#2a2a2a" : "white";
  const textColor = darkMode ? "#ffffff" : "#333";
  const mutedColor = darkMode ? "#aaaaaa" : "#888";
  const borderColor = darkMode ? "#3a3a3a" : "#f0f0f0";
  const inputBg = darkMode ? "#1a1a1a" : "white";
  const subBg = darkMode ? "#333" : "#f5f5f5";

  const GOALS = { calories: 2000, protein: 150, carbs: 250, fats: 65, water: 8 };
  const mealIcons = { Breakfast: "🌅", Lunch: "☀️", Dinner: "🌙", Snack: "🍎" };

  const quickFoods = [
    { name: "Dal", unit: "katori", qty: 1 },
    { name: "Roti", unit: "roti", qty: 2 },
    { name: "Chaas", unit: "glass", qty: 1 },
    { name: "Rice", unit: "katori", qty: 1 },
    { name: "Sabzi", unit: "katori", qty: 1 },
    { name: "Salad", unit: "bowl", qty: 1 },
    { name: "Egg", unit: "piece", qty: 2 },
    { name: "Milk", unit: "glass", qty: 1 },
    { name: "Paneer", unit: "g", qty: 100 },
    { name: "Dahi", unit: "katori", qty: 1 },
  ];

  useEffect(() => { fetchToday(); }, []);

  const fetchToday = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/nutrition/today", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNutrition(res.data);
      setWater(res.data.waterIntake || 0);
    } catch (err) { console.log(err); }
  };

  const fetchNutritionForItem = async (index, foodName, quantity, unit) => {
    if (!foodName.trim()) return;
    setLoadingIndex(index);
    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        messages: [{
          role: "user",
          content: `Calculate nutrition for "${foodName}" — ${quantity} ${unit} (Indian homemade style).
Standard references:
- Dal = cooked lentil curry, 1 katori = 150g ≈ 120 kcal
- Roti = whole wheat chapati, 1 piece = 40g ≈ 80 kcal  
- Chaas = buttermilk, 1 glass = 250ml ≈ 40 kcal
- Rice = cooked, 1 katori = 150g ≈ 180 kcal
- Sabzi = cooked curry, 1 katori = 150g ≈ 100 kcal
- Salad = raw veggies, 1 bowl = 100g ≈ 30 kcal
- Egg = boiled, 1 piece = 50g ≈ 70 kcal
- Dahi = curd, 1 katori = 150g ≈ 90 kcal

Reply ONLY in JSON:
{"calories": 0, "protein": 0, "carbs": 0, "fats": 0}`
        }]
      }, { headers: { Authorization: `Bearer ${token}` } });

      const text = res.data.reply;
      const json = JSON.parse(text.match(/\{.*\}/s)[0]);
      setFoodItems(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          calories: Math.round(json.calories),
          protein: Math.round(json.protein),
          carbs: Math.round(json.carbs),
          fats: Math.round(json.fats),
        };
        return updated;
      });
    } catch (err) { console.log(err); }
    setLoadingIndex(null);
  };

  const addFoodRow = () => {
    setFoodItems(prev => [...prev, { ...emptyItem }]);
  };

  const removeFoodRow = (index) => {
    setFoodItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateFoodItem = (index, field, value) => {
    setFoodItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const quickAddFood = (index, food) => {
    setFoodItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], name: food.name, quantity: food.qty, unit: food.unit };
      return updated;
    });
    setTimeout(() => fetchNutritionForItem(index, food.name, food.qty, food.unit), 100);
  };

  const totalMacros = foodItems.reduce((acc, item) => ({
    calories: acc.calories + (item.calories || 0),
    protein: acc.protein + (item.protein || 0),
    carbs: acc.carbs + (item.carbs || 0),
    fats: acc.fats + (item.fats || 0),
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const saveMeal = async () => {
    const validItems = foodItems.filter(item => item.name && item.calories > 0);
    if (validItems.length === 0) return;
    setSaving(true);
    try {
      for (const item of validItems) {
        await axios.post("http://localhost:5000/api/nutrition/add-meal", {
          name: `${item.name} (${item.quantity} ${item.unit})`,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats,
          time: mealType
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      await fetchToday();
      setFoodItems([{ ...emptyItem }]);
      setShowAddMeal(false);
    } catch (err) { console.log(err); }
    setSaving(false);
  };

  const updateWater = async (glasses) => {
    setWater(glasses);
    try {
      await axios.put("http://localhost:5000/api/nutrition/water",
        { glasses },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) { console.log(err); }
  };

  const caloriesPct = Math.min(Math.round(((nutrition?.totalCalories || 0) / GOALS.calories) * 100), 100);
  const circumference = 2 * Math.PI * 50;
  const strokeOffset = circumference * (1 - caloriesPct / 100);
  const remaining = GOALS.calories - (nutrition?.totalCalories || 0);

  const macroBar = (label, value, goal, color) => {
    const pct = Math.min(Math.round((value / goal) * 100), 100);
    return (
      <div style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "13px", color: textColor, fontWeight: "500" }}>{label}</span>
          <span style={{ fontSize: "13px", color: mutedColor }}>{value}g / {goal}g</span>
        </div>
        <div style={{ background: darkMode ? "#3a3a3a" : "#f0f0f0", borderRadius: "20px", height: "8px" }}>
          <div style={{ background: color, borderRadius: "20px", height: "8px", width: `${pct}%`, transition: "width 0.4s ease" }}></div>
        </div>
      </div>
    );
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    border: `1.5px solid ${borderColor}`,
    borderRadius: "8px",
    fontSize: "13px",
    background: inputBg,
    color: textColor,
    outline: "none",
    boxSizing: "border-box"
  };

  return (
    <div style={{ padding: "28px 32px", background: bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", color: textColor }}>🥗 Calorie & Macro Tracker</h2>
            <p style={{ margin: "4px 0 0", color: mutedColor }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <button onClick={() => setShowAddMeal(true)}
            style={{ padding: "12px 24px", background: "#D85A30", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>
            + Add Meal
          </button>
        </div>

        {/* Calories + Macros */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: "16px", color: textColor }}>🔥 Calories Today</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div style={{ position: "relative", width: "120px", height: "120px", flexShrink: 0 }}>
                <svg viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)", width: "120px", height: "120px" }}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke={darkMode ? "#3a3a3a" : "#f0f0f0"} strokeWidth="12" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#D85A30" strokeWidth="12"
                    strokeDasharray={circumference} strokeDashoffset={strokeOffset}
                    strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#D85A30" }}>{nutrition?.totalCalories || 0}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: mutedColor }}>kcal</p>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 4px", color: mutedColor, fontSize: "13px" }}>Daily Goal</p>
                <p style={{ margin: "0 0 16px", fontSize: "22px", fontWeight: "600", color: textColor }}>{GOALS.calories} kcal</p>
                <p style={{ margin: "0 0 4px", color: mutedColor, fontSize: "13px" }}>Remaining</p>
                <p style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: remaining < 0 ? "#E24B4A" : "#3B6D11" }}>
                  {remaining < 0 ? `+${Math.abs(remaining)}` : remaining} kcal
                </p>
              </div>
            </div>
          </div>
          <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: "16px", color: textColor }}>💊 Macronutrients</h3>
            {macroBar("Protein", nutrition?.totalProtein || 0, GOALS.protein, "#378ADD")}
            {macroBar("Carbs", nutrition?.totalCarbs || 0, GOALS.carbs, "#EF9F27")}
            {macroBar("Fats", nutrition?.totalFats || 0, GOALS.fats, "#E24B4A")}
          </div>
        </div>

        {/* Water */}
        <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", color: textColor }}>💧 Water Intake</h3>
            <span style={{ fontSize: "14px", color: mutedColor }}>{water} / {GOALS.water} glasses</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {Array.from({ length: GOALS.water }).map((_, i) => (
              <div key={i} onClick={() => updateWater(i < water ? i : i + 1)}
                style={{ width: "44px", height: "56px", borderRadius: "10px", background: i < water ? "#378ADD" : (darkMode ? "#3a3a3a" : "#f0f0f0"), cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", transition: "all 0.2s" }}>
                {i < water ? "💧" : "🫙"}
              </div>
            ))}
          </div>
        </div>

        {/* Meals List */}
        <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: textColor }}>🍽️ Today's Meals</h3>
          {!nutrition?.meals?.length ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ fontSize: "40px", margin: "0 0 8px" }}>🥗</p>
              <p style={{ color: mutedColor }}>No meals logged yet — click "+ Add Meal" to get started!</p>
            </div>
          ) : (
            nutrition.meals.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < nutrition.meals.length - 1 ? `1px solid ${borderColor}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#FAECE7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                    {mealIcons[m.time] || "🍽️"}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: "500", color: textColor, fontSize: "14px" }}>{m.name}</p>
                    <p style={{ margin: "2px 0 0", color: mutedColor, fontSize: "12px" }}>
                      {m.time} · P: {m.protein}g · C: {m.carbs}g · F: {m.fats}g
                    </p>
                  </div>
                </div>
                <p style={{ margin: 0, fontWeight: "600", color: "#D85A30", fontSize: "15px" }}>{m.calories} kcal</p>
              </div>
            ))
          )}
        </div>

        {/* Add Meal Modal */}
        {showAddMeal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: cardBg, borderRadius: "20px", padding: "28px", width: "560px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", maxHeight: "92vh", overflowY: "auto" }}>

              <h3 style={{ margin: "0 0 16px", color: textColor }}>🍽️ Add Meal</h3>

              {/* Meal Type */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {["Breakfast", "Lunch", "Dinner", "Snack"].map(t => (
                  <button key={t} onClick={() => setMealType(t)}
                    style={{ flex: 1, padding: "8px 4px", background: mealType === t ? "#D85A30" : subBg, color: mealType === t ? "white" : mutedColor, border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>
                    {mealIcons[t]} {t}
                  </button>
                ))}
              </div>

              {/* Quick Food Chips */}
              <div style={{ marginBottom: "16px" }}>
                <p style={{ margin: "0 0 8px", fontSize: "12px", color: mutedColor }}>Quick Add (click to add a row):</p>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {quickFoods.map((f, i) => (
                    <button key={i} onClick={() => {
                      const emptyIndex = foodItems.findIndex(item => !item.name);
                      if (emptyIndex >= 0) {
                        quickAddFood(emptyIndex, f);
                      } else {
                        setFoodItems(prev => [...prev, { ...emptyItem, name: f.name, quantity: f.qty, unit: f.unit }]);
                        setTimeout(() => fetchNutritionForItem(foodItems.length, f.name, f.qty, f.unit), 100);
                      }
                    }}
                      style={{ padding: "5px 12px", background: subBg, color: mutedColor, border: `1px solid ${borderColor}`, borderRadius: "20px", cursor: "pointer", fontSize: "12px" }}>
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food Items Table */}
              <div style={{ marginBottom: "16px" }}>

                {/* ✅ Highlighted Header */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 0.7fr 1fr 0.5fr auto", gap: "6px", marginBottom: "8px", padding: "10px 12px", background: darkMode ? "#3a1a0a" : "#FAECE7", borderRadius: "10px", border: `1px solid ${darkMode ? "#D85A30" : "#F5C4B3"}` }}>
                  <span style={{ fontSize: "11px", color: "#993C1D", fontWeight: "700", letterSpacing: "0.5px" }}>FOOD ITEM</span>
                  <span style={{ fontSize: "11px", color: "#993C1D", fontWeight: "700", letterSpacing: "0.5px" }}>QTY</span>
                  <span style={{ fontSize: "11px", color: "#993C1D", fontWeight: "700", letterSpacing: "0.5px" }}>UNIT</span>
                  <span style={{ fontSize: "11px", color: "#993C1D", fontWeight: "700", letterSpacing: "0.5px" }}>KCAL</span>
                  <span style={{ fontSize: "11px", color: "#993C1D", fontWeight: "700" }}></span>
                </div>

                {foodItems.map((item, index) => (
                  <div key={index} style={{ marginBottom: "8px", background: item.calories > 0 ? (darkMode ? "#1e1e1e" : "#FFFAF8") : "transparent", borderRadius: "10px", padding: item.calories > 0 ? "10px" : "4px 0", border: item.calories > 0 ? `1.5px solid ${darkMode ? "#D85A30" : "#FAECE7"}` : "none", transition: "all 0.3s" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 0.7fr 1fr 0.5fr auto", gap: "6px", alignItems: "center" }}>
                      <input
                        placeholder="e.g. Dal, Roti"
                        value={item.name}
                        onChange={e => updateFoodItem(index, "name", e.target.value)}
                        onBlur={e => {
                          if (e.target.value) fetchNutritionForItem(index, e.target.value, item.quantity, item.unit);
                        }}
                        style={inputStyle}
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        min="0.5"
                        step="0.5"
                        onChange={e => updateFoodItem(index, "quantity", Number(e.target.value))}
                        onBlur={() => {
                          if (item.name) fetchNutritionForItem(index, item.name, item.quantity, item.unit);
                        }}
                        style={inputStyle}
                      />
                      <select
                        value={item.unit}
                        onChange={e => {
                          updateFoodItem(index, "unit", e.target.value);
                          if (item.name) setTimeout(() => fetchNutritionForItem(index, item.name, item.quantity, e.target.value), 100);
                        }}
                        style={inputStyle}>
                        <option value="katori">katori</option>
                        <option value="roti">roti</option>
                        <option value="piece">piece</option>
                        <option value="glass">glass</option>
                        <option value="bowl">bowl</option>
                        <option value="plate">plate</option>
                        <option value="g">grams</option>
                        <option value="ml">ml</option>
                        <option value="cup">cup</option>
                        <option value="tbsp">tbsp</option>
                      </select>
                      <div style={{ textAlign: "center" }}>
                        {loadingIndex === index ? (
                          <span style={{ fontSize: "11px", color: "#D85A30" }}>⏳</span>
                        ) : (
                          <span style={{ fontSize: "13px", fontWeight: "600", color: item.calories > 0 ? "#D85A30" : mutedColor }}>
                            {item.calories > 0 ? item.calories : "—"}
                          </span>
                        )}
                      </div>
                      <button onClick={() => removeFoodRow(index)}
                        style={{ background: "none", border: "none", color: "#E24B4A", cursor: "pointer", fontSize: "16px", padding: "0 4px" }}>
                        ✕
                      </button>
                    </div>

                    {/* Macro preview per item */}
                    {item.calories > 0 && (
                      <div style={{ display: "flex", gap: "10px", marginTop: "6px", paddingLeft: "4px" }}>
                        <span style={{ fontSize: "11px", color: "#378ADD", fontWeight: "500" }}>P: {item.protein}g</span>
                        <span style={{ fontSize: "11px", color: "#EF9F27", fontWeight: "500" }}>C: {item.carbs}g</span>
                        <span style={{ fontSize: "11px", color: "#E24B4A", fontWeight: "500" }}>F: {item.fats}g</span>
                      </div>
                    )}
                  </div>
                ))}

                <button onClick={addFoodRow}
                  style={{ width: "100%", padding: "8px", background: "transparent", color: "#D85A30", border: `1.5px dashed #D85A30`, borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "500", marginTop: "8px" }}>
                  + Add Another Food Item
                </button>
              </div>

              {/* Total Summary */}
              {totalMacros.calories > 0 && (
                <div style={{ background: subBg, borderRadius: "12px", padding: "16px", marginBottom: "16px", border: `1.5px solid #D85A30` }}>
                  <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "500", color: "#D85A30" }}>
                    🍽️ Total for this {mealType}:
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", textAlign: "center" }}>
                    {[
                      { label: "Calories", value: totalMacros.calories, unit: "kcal", color: "#D85A30" },
                      { label: "Protein", value: totalMacros.protein, unit: "g", color: "#378ADD" },
                      { label: "Carbs", value: totalMacros.carbs, unit: "g", color: "#EF9F27" },
                      { label: "Fats", value: totalMacros.fats, unit: "g", color: "#E24B4A" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: cardBg, borderRadius: "8px", padding: "10px 4px" }}>
                        <p style={{ margin: "0 0 2px", fontSize: "20px", fontWeight: "600", color: s.color }}>{s.value}</p>
                        <p style={{ margin: 0, fontSize: "10px", color: mutedColor }}>{s.unit} {s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={saveMeal} disabled={saving || totalMacros.calories === 0}
                  style={{ flex: 1, padding: "13px", background: saving || totalMacros.calories === 0 ? "#aaa" : "#D85A30", color: "white", border: "none", borderRadius: "10px", cursor: saving ? "not-allowed" : "pointer", fontWeight: "500", fontSize: "15px" }}>
                  {saving ? "Saving..." : `Save ${mealType} ✅`}
                </button>
                <button onClick={() => { setShowAddMeal(false); setFoodItems([{ ...emptyItem }]); }}
                  style={{ padding: "13px 20px", background: "transparent", color: mutedColor, border: `1.5px solid ${borderColor}`, borderRadius: "10px", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Nutrition;