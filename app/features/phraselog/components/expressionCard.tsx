// 이 파일의 전체적인 구조는 추정하여 작성되었습니다.
// 실제 코드에 맞게 key 부분이나 구조를 조절해주세요.

import { jsxDEV } from "react/jsx-dev-runtime";
import { useState, useMemo } from "react";
import { Button } from "~/core/components/ui/button";
import { Card } from "~/core/components/ui/card";

// [추가] Coaching 데이터와 관련된 타입 및 상수 정의
// (이 부분은 learning.tsx와 중복되므로, 추후 별도의 types.ts 파일로 분리하면 더 좋습니다.)
const coachingCategories = ["설명", "문화적 맥락", "전략적 조언"] as const;
type Category = typeof coachingCategories[number];

type CoachingObject = {
  explanation: string;
  cultural_context: string;
  strategic_advice: string;
};

const categoryMap: Record<Category, keyof CoachingObject> = {
  "설명": "explanation",
  "문화적 맥락": "cultural_context",
  "전략적 조언": "strategic_advice",
};

// [수정] coaching prop의 타입을 명확하게 정의합니다.
interface ExpressionCardProps {
  expression: string;
  coaching: CoachingObject; // 이 컴포넌트는 객체를 직접 받습니다.
  isSelected: boolean;
  onToggle: () => void;
}

export function ExpressionCard({ expression, coaching, isSelected, onToggle }: ExpressionCardProps) {
  const [openAnalysis, setOpenAnalysis] = useState(false);
  // [수정] useState의 타입을 Category로 명시적으로 지정합니다.
  const [selectedCategory, setSelectedCategory] = useState<Category>(coachingCategories[0]);

  // 이 컴포넌트에서는 coaching prop이 이미 객체이므로 JSON.parse가 필요 없습니다.

  const handleCardClick = () => {
    onToggle(); // isSelected 상태를 직접 토글
  };

  return (
    <Card 
      className={`p-4 rounded-xl border-2 transition-colors duration-200 cursor-pointer ${
        isSelected 
          ? 'border-primary bg-primary/5' 
          : 'border-border bg-card hover:bg-muted/50'
      }`}
      onClick={handleCardClick}
    >
      <div>
        <p className="font-semibold text-primary text-base mb-2">{expression}</p>
        {/* کوچ칭 및 예시 UI */}
      </div>
      
      <div className="mt-4">
        <button 
          onClick={() => setOpenAnalysis(!openAnalysis)}
          className="w-full bg-muted hover:bg-muted/80 text-foreground font-semibold py-2 px-4 rounded-lg flex justify-between items-center transition-colors"
        >
          <span>AI 분석 결과 보기</span>
          <span className={`transform transition-transform duration-200 ${openAnalysis ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {openAnalysis && (
          <div className="mt-2 p-4 bg-background rounded-lg border animate-in fade-in-50 space-y-3">
            <div className="flex w-full bg-muted rounded-lg p-1">
              {coachingCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors duration-200 ease-in-out ${
                    selectedCategory === category
                      ? "bg-card text-foreground shadow-sm"
                      : "bg-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed min-h-[5em]">
              {/* [수정] 타입이 지정된 맵을 사용하여 안전하게 데이터에 접근합니다. */}
              {coaching[categoryMap[selectedCategory]] || "내용이 없습니다."}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
