import { Button } from "~/core/components/ui/button";
import { useState, useMemo } from "react";
import type { SceneData } from "../hooks/use-phrases";


export interface AIExpression {
  expression: string;
  coaching: string;
}

interface AIResponseScreenProps {
  expressions: AIExpression[];
  scene: SceneData | null;
  onSave: (expression: AIExpression) => void;
  onRegenerate: () => void;
  isLoading?: boolean;
}

export function AIResponseScreen({ 
  expressions, 
  scene,
  onSave, 
  onRegenerate,
  isLoading = false 
}: AIResponseScreenProps) {
  console.log('AIResponseScreen 렌더링 - expressions:', expressions);
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          AI 분석 결과
        </h1>
        <p className="text-base text-slate-500">
         마음에 드는 표현을 저장하고 학습 해 보세요.
        </p>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-24 space-y-6">
        {scene && (
            <div className="bg-slate-100 rounded-xl p-5">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                MY SCENE
              </h2>
              <p className="text-slate-700 text-base">
                <span className="font-semibold">To:</span> {scene.to_who}, <span className="font-semibold">Intention:</span> {scene.intention}, <span className="font-semibold">Context:</span> {scene.context}
                {scene.nuances && scene.nuances.length > 0 && (
                  <span className="italic text-slate-600"> ({scene.nuances.join(', ')})</span>
                )}
              </p>
            </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-500">AI가 표현을 생성하고 있습니다...</p>
          </div>
        ) : expressions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-slate-500 mb-4">생성된 표현이 없습니다.</p>
            <Button
              onClick={onRegenerate}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-3"
            >
              다시 생성하기
            </Button>
          </div>
        ) : (
          <>
            {expressions.map((expr, index) => (
              <ExpressionCard
                key={index}
                expression={expr.expression}
                coaching={expr.coaching}
                onSave={() => onSave(expr)}
              />
            ))}

            {/* Regenerate Button */}
            <div className="pt-4">
              <Button
                onClick={onRegenerate}
                variant="outline"
                className="w-full border-slate-300 text-slate-700 rounded-lg py-4 hover:bg-slate-50"
              >
                처음으로 돌아가기
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

interface ExpressionCardProps {
  expression: string;
  coaching: string;
  onSave: () => void;
}

function ExpressionCard({ expression, coaching, onSave }: ExpressionCardProps) {
  const coachingCategories = useMemo(() => ["설명", "문화적 맥락", "전략적 조언"], []);
  const [selectedCategory, setSelectedCategory] = useState(coachingCategories[0]);

  const parsedCoaching = useMemo(() => {
    const parts: { [key: string]: string } = {};
    
    // Normalize different bracket types
    const normalizedCoaching = coaching
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
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
      {/* Expression Text */}
      <h3 className="text-lg font-semibold text-slate-800">
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

      {/* Save Button */}
      <div className="pt-2">
        <Button
          onClick={onSave}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-2 text-sm font-semibold"
        >
          Save
        </Button>
      </div>
    </div>
  );
}

