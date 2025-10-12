import { useState, useMemo } from "react";
import { Button } from "~/core/components/ui/button";

interface ExpressionCardProps {
  expression: string;
  coaching: string;
  isSelected: boolean;
  onToggle: () => void;
}

export function ExpressionCard({ expression, coaching, isSelected, onToggle }: ExpressionCardProps) {
  const coachingCategories = useMemo(() => ["설명", "문화적 맥락", "전략적 조언"], []);
  const [selectedCategory, setSelectedCategory] = useState(coachingCategories[0]);

  const parsedCoaching = useMemo(() => {
    const parts: { [key: string]: string } = {};
    
    // Normalize different bracket types
    const normalizedCoaching = coaching.replace(/【설명】/g, '[설명]')
      .replace(/【문화적 맥락】/g, '[문화적 맥락]')
      .replace(/【전략적 조언】/g, '[전략적 조언]');

    let lastCategory: string | null = null;
    let lastIndex = 0;

    const regex = /\[(.*?)\]/g;
    let match;

    while ((match = regex.exec(normalizedCoaching)) !== null) {
      if (lastCategory) {
        parts[lastCategory] = normalizedCoaching.substring(lastIndex, match.index).trim();
      }
      lastCategory = match[1];
      lastIndex = regex.lastIndex;
    }

    if (lastCategory) {
      parts[lastCategory] = normalizedCoaching.substring(lastIndex).trim();
    }
    
    // If no tags are found, assume the whole text is "설명"
    if (Object.keys(parts).length === 0 && coaching) {
      parts[coachingCategories[0]] = coaching;
    }

    return parts;
  }, [coaching, coachingCategories]);

  return (
    <div
      onClick={onToggle}
      className={`relative bg-slate-50 border rounded-xl p-5 space-y-4 cursor-pointer transition-all duration-200
        ${isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 hover:border-slate-300"}
      `}
    >
      {/* Checkbox visual indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Expression Text */}
      <h3 className="text-lg font-semibold text-slate-800 pr-8">
        "{expression}"
      </h3>

      {/* Segmented Control */}
      <div className="flex w-full bg-slate-200/60 rounded-lg p-1">
        {coachingCategories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors duration-200 ease-in-out
              ${
                selectedCategory === category
                  ? "bg-white text-slate-800 shadow-sm"
                  : "bg-transparent text-slate-500 hover:text-slate-700"
              }
            `}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Coaching Text */}
      <p className="text-sm text-slate-600 leading-relaxed min-h-[6em]">
        {parsedCoaching[selectedCategory] || "내용을 불러올 수 없습니다."}
      </p>
    </div>
  );
}
