import { Button } from "~/core/components/ui/button";
import { useState, useMemo } from "react";
import type { SceneData } from "../hooks/use-phrases";
import { ExpressionCard } from "../components/expressionCard";


export interface AIExpression {
  expression: string;
  coaching: string;
  example: {
    en: string;
    ko: string;
  };
}



interface AIResponseScreenProps {
  airesults: AIExpression[];
  sceneId: string;
  scene: SceneData | null;
  onSave: (expressions: AIExpression[], sceneId: string) => void;
  onRegenerate: () => void;
  isLoading?: boolean;
}

export function AIResponseScreen({ 
  airesults,  
  sceneId,
  scene,
  onSave, 
  onRegenerate,
  isLoading = false 
}: AIResponseScreenProps) {

  const [selectedExpressions, setSelectedExpressions] = useState<AIExpression[]>([]);

  const handleToggleExpression = (expression: AIExpression) => {
    setSelectedExpressions(prev => 
      prev.some(item => item.expression === expression.expression)
        ? prev.filter(item => item.expression !== expression.expression)
        : [...prev, expression]
    );
  };

  const handleSaveSelected = () => {
    if (selectedExpressions.length > 0) {
      onSave(selectedExpressions, sceneId);
    }
  };

  console.log('AIResponseScreen 렌더링 - expressions:', airesults);
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
        ) : airesults.length === 0 ? (
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
            {airesults.map((result,index) => (
              <ExpressionCard
                key={index}
                expression={result.expression}
                coaching={result.coaching}
                isSelected={selectedExpressions.some(item => item.expression === result.expression)}
                onToggle={() => handleToggleExpression(result)}
              />
            ))}

            {/* Save & Regenerate Buttons */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 flex items-center justify-center gap-4">
              <Button
                onClick={handleSaveSelected}
                disabled={selectedExpressions.length === 0 || isLoading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-4 text-base font-semibold disabled:bg-slate-300"
              >
                {selectedExpressions.length > 0 ? `${selectedExpressions.length}개 표현 저장하기` : '표현을 선택해주세요'}
              </Button>
              <Button
                onClick={onRegenerate}
                variant="outline"
                className="flex-1 border-slate-300 text-slate-700 rounded-lg py-4 text-base hover:bg-slate-50"
              >
                다시 만들기
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

