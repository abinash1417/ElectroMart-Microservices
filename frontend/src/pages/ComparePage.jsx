import { useEffect, useState } from "react";
import { useCompare } from "../context/CompareContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";


export default function ComparePage() {
  const { compareList, clearCompare } = useCompare();
  const navigate = useNavigate();
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  useEffect(() => {
    if (compareList.length < 2) {
      navigate("/products");
    }
  }, []);

  const handleAiCompare = async () => {
    setLoading(true);
    try {
      const res = await API.post("/api/ai/compare", compareList);
      setAiAnalysis(res.data.response);
      setAnalyzed(true);
    } catch (err) {
      console.error("AI Compare error:", err);
      const statusInfo = err.response?.status ? `HTTP ${err.response.status}` : (err.code || err.message);
      setAiAnalysis(`⚠️ AI Compare error (${statusInfo}). Please ensure ai-service is running.`);
      setAnalyzed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (compareList.length >= 2) {
      handleAiCompare();
    }
  }, []);

  const fields = [
    { label: "Category", key: (p) => p.category?.name || "N/A" },
    { label: "Price", key: (p) => `LKR ${p.price?.toLocaleString()}` },
    { label: "Stock", key: (p) => p.stock > 0 ? `✓ In Stock (${p.stock})` : "✗ Out of Stock" },
    { label: "Description", key: (p) => p.description || "N/A" },
  ];

  return (
    <div className="bg-gray-950 min-h-screen py-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">⚡ AI Product Compare</h1>
            <p className="text-gray-400 mt-1">ElectroBot is analyzing your selected products</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/products")}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-xl transition-colors text-sm"
            >
              ← Back to Products
            </button>
            <button
              onClick={() => { clearCompare(); navigate("/products"); }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-sm"
            >
              Clear & Start Over
            </button>
          </div>
        </div>

        {/* Product Images Row */}
        <div className={`grid gap-6 mb-8`} style={{ gridTemplateColumns: `repeat(${compareList.length}, 1fr)` }}>
          {compareList.map((product) => (
            <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
              <div className="aspect-square bg-gray-800 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                <img
                  src={`http://localhost:8080/images/products/${product.frontImage}`}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                  onError={(e) => { e.target.src = "https://placehold.co/300x300/1f2937/6b7280?text=No+Image"; }}
                />
              </div>
              <h3 className="text-white font-bold text-sm leading-tight mb-2">{product.name}</h3>
              <p className="text-red-500 font-bold text-lg">LKR {product.price?.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-8">
          <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
            <h2 className="text-white font-bold text-lg">Side-by-Side Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-6 py-4 text-gray-400 font-medium text-sm w-32">Feature</th>
                  {compareList.map((p) => (
                    <th key={p.id} className="text-left px-6 py-4 text-white font-semibold text-sm">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((field, i) => (
                  <tr key={i} className={`border-b border-gray-800 ${i % 2 === 0 ? "bg-gray-900" : "bg-gray-800/30"}`}>
                    <td className="px-6 py-4 text-gray-400 text-sm font-medium">{field.label}</td>
                    {compareList.map((p) => (
                      <td key={p.id} className="px-6 py-4 text-gray-300 text-sm">
                        <span className={
                          field.label === "Stock"
                            ? p.stock > 0 ? "text-green-400" : "text-red-400"
                            : field.label === "Price"
                            ? "text-red-400 font-bold"
                            : ""
                        }>
                          {field.key(p)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-900/50 to-gray-800 px-6 py-4 border-b border-gray-700 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h2 className="text-white font-bold text-lg">ElectroBot AI Analysis</h2>
              <p className="text-gray-400 text-sm">Smart recommendation powered by AI</p>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                <div>
                  <p className="text-white font-medium">ElectroBot is analyzing your products...</p>
                  <p className="text-gray-400 text-sm">Comparing features, prices, and value for money</p>
                </div>
              </div>
            ) : analyzed ? (
              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {aiAnalysis}
              </div>
            ) : (
              <button
                onClick={handleAiCompare}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                ⚡ Get AI Analysis
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}