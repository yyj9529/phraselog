import type { Route } from ".react-router/types/app/features/phraselog/screens/+types/learning.ts";
import { useLoaderData, Link, data } from "react-router";
import makeServerClient from "~/core/lib/supa-client.server";
import { getScenesWithPhrases } from "../queries";
import { Button } from "~/core/components/ui/button";
import { useState, useMemo } from "react"; // useMemo 추가
import { Modal } from "~/core/components/ui/modal";

// [추가] Coaching 데이터와 관련된 타입 및 상수 정의 (컴포넌트 외부)
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

// 데이터 타입을 정의합니다.
type Phrase = {
  id: string;
  english_phrase: string;
  explanation: string; // 이 필드는 DB에서 온 JSON 문자열입니다.
  example: { en: string; ko: string } | null;
};

type SceneWithPhrases = {
  id: string;
  my_intention: string;
  to_who: string;
  the_context: string;
  desired_nuance: string | null;
  phrases: Phrase[];
};

// --- AI 분석 결과를 보여주는 별도의 컴포넌트 ---
// [수정] coaching prop은 DB에서 온 문자열이므로 string 타입을 받습니다.
function AnalysisResult({ coaching }: { coaching: string }) {
  // [수정] useState의 타입을 Category로 명시적으로 지정합니다.
  const [selectedCategory, setSelectedCategory] = useState<Category>(coachingCategories[0]);

  // [수정] DB에서 받은 JSON 문자열을 파싱합니다.
  const parsedCoaching: CoachingObject = useMemo(() => {
    try {
      if (coaching && typeof coaching === 'string') {
        return JSON.parse(coaching);
      }
    } catch (e) {
      console.error("Coaching JSON 파싱 실패:", e);
    }
    // 파싱 실패 시 UI 깨짐을 방지하기 위해 기본값을 반환합니다.
    return { explanation: "분석 결과를 불러올 수 없습니다.", cultural_context: "", strategic_advice: "" };
  }, [coaching]);

  return (
    <div className="mt-2 p-4 bg-white rounded-lg border border-slate-200 animate-in fade-in-50 space-y-3">
      {/* Segmented Control */}
      <div className="flex w-full bg-slate-200/60 rounded-lg p-1">
        {coachingCategories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors duration-200 ease-in-out ${
              selectedCategory === category
                ? "bg-white text-slate-800 shadow-sm"
                : "bg-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Coaching Text */}
      <p className="text-sm text-slate-600 leading-relaxed min-h-[5em]">
        {/* [수정] 파싱된 객체와 타입이 지정된 맵을 사용하여 안전하게 데이터에 접근합니다. */}
        {parsedCoaching[categoryMap[selectedCategory]] || "내용이 없습니다."}
      </p>
    </div>
  );
}


// 서버 사이드에서 데이터를 로드하는 loader 함수입니다.
export async function loader({ request }: Route.LoaderArgs) {
  const [client, headers] = makeServerClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if(user) {
    const scenesData = await getScenesWithPhrases(client, user.id);
    const scenes = scenesData || [];
    return data({ scenes }, { headers });
  }
  return data({ scenes: [] }, { headers });
}

export default function LearningScreen(loaderData: Route.ComponentProps) {
  const scenes = loaderData.loaderData?.scenes || [];
  const [openAnalysisId, setOpenAnalysisId] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<SceneWithPhrases | null>(null);

  const toggleAnalysis = (phraseId: string) => {
    setOpenAnalysisId(openAnalysisId === phraseId ? null : phraseId);
  };

  const handleSceneClick = (scene: SceneWithPhrases) => {
    setSelectedScene(scene);
  };

  const closeModal = () => {
    setSelectedScene(null);
  };

  if (scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold text-slate-700 mb-4">
          아직 저장된 표현이 없어요
        </h2>
        <p className="text-slate-500 mb-6">
          나만의 장면을 기록하고 AI 추천 표현을 저장해보세요.
        </p>
        <Button asChild className="bg-blue-500 hover:bg-blue-600">
          <Link to="/">상황 기록하러 가기</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="px-4 sm:px-6 md:px-12 py-10">
        <h1 className="text-3xl font-bold text-slate-800">My Learning</h1>
        <p className="text-base text-slate-500 mt-2">
          저장한 표현들을 복습하고 내 것으로 만들어보세요.
        </p>
      </header>
      
      <main className="px-4 sm:px-6 md:px-12 pb-24">
        <div className="space-y-8">
          {scenes.map((scene) => (
            <div key={scene.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div 
                className="p-5 bg-slate-100/80 border-b border-slate-200 cursor-pointer hover:bg-slate-200/60"
                onClick={() => handleSceneClick(scene)}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    MY SCENE
                  </h2>
                  <span className="text-xs text-slate-400">자세히 보기 &rarr;</span>
                </div>
                <p className="text-slate-700 text-base">
                  <span className="font-semibold">To:</span> {scene.to_who}, <span className="font-semibold">Intention:</span> {scene.my_intention}, <span className="font-semibold">Context:</span> {scene.the_context}
                  {scene.desired_nuance && (
                    <span className="italic text-slate-600"> ({scene.desired_nuance})</span>
                  )}
                </p>
              </div>

              <div className="p-5 space-y-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  MY EXPRESSIONS
                </h3>
                {scene.phrases.map((phrase) => (
                  <div key={phrase.id} className="border border-slate-200 rounded-xl p-4 transition-shadow hover:shadow-md">
                    <p className="font-semibold text-blue-600 text-base mb-2">{phrase.english_phrase}</p>
                    <div className="mt-2">
                      <button 
                        onClick={() => toggleAnalysis(phrase.id)}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg flex justify-between items-center transition-colors"
                      >
                        <span>AI 분석 결과 보기</span>
                        <span className={`transform transition-transform duration-200 ${openAnalysisId === phrase.id ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                      {openAnalysisId === phrase.id && (
                        // 별도로 만든 AnalysisResult 컴포넌트를 사용
                        <AnalysisResult coaching={phrase.explanation} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Modal isOpen={!!selectedScene} onClose={closeModal} title="Scene Details">
        {selectedScene && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                MY SCENE
              </h3>
              <p className="text-slate-700 text-base">
                <span className="font-semibold">To:</span> {selectedScene.to_who}, <span className="font-semibold">Intention:</span> {selectedScene.my_intention}, <span className="font-semibold">Context:</span> {selectedScene.the_context}
                {selectedScene.desired_nuance && (
                  <span className="italic text-slate-600"> ({selectedScene.desired_nuance})</span>
                )}
              </p>
            </div>
            
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                EXPRESSION EXAMPLES
              </h3>
              <div className="space-y-3">
                {selectedScene.phrases.map((phrase) => (
                  <div key={phrase.id} className="bg-slate-50 p-4 rounded-lg border space-y-2">
                    <p className="font-semibold text-blue-600 text-base">{phrase.english_phrase}</p>
                    
                    {phrase.example && (
                      <>
                        <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider pt-2">대화 예시</h4>
                        <div className="text-sm text-slate-700 space-y-1 bg-white p-3 rounded-md border">
                            <p className="font-semibold">{phrase.example.en}</p>
                            <p className="text-slate-500 pt-1">{phrase.example.ko}</p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
