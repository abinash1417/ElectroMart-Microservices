import { useCompare } from "../../context/CompareContext";
import { useNavigate } from "react-router-dom";

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <span className="text-gray-400 text-sm font-medium whitespace-nowrap">
          Compare ({compareList.length}/4):
        </span>

        <div className="flex items-center gap-3 flex-1 overflow-x-auto">
          {compareList.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 whitespace-nowrap"
            >
              <img
                src={`http://localhost:8080/images/products/${product.frontImage}`}
                alt={product.name}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.target.src =
                    "https://placehold.co/32x32/1f2937/6b7280?text=?";
                }}
              />
              <span className="text-white text-xs font-medium max-w-24 truncate">
                {product.name}
              </span>
              <button
                onClick={() => removeFromCompare(product.id)}
                className="text-gray-500 hover:text-red-400 text-sm ml-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={clearCompare}
            className="px-3 py-2 text-gray-400 hover:text-white text-sm border border-gray-700 rounded-lg transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => navigate("/compare")}
            disabled={compareList.length < 2}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            ⚡ AI Compare
          </button>
        </div>
      </div>
    </div>
  );
}