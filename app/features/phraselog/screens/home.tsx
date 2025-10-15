import { useEffect, useState } from "react";
import { Button } from "~/core/components/ui/button";
import { SceneBuilderModal } from "../components/scene-builder-modal";
import {
  ContextUnderstandingIcon,
  PersonalizationIcon,
  InstantLearningIcon,
} from "../components/icons";
import { PhraseCard } from "../components/phrase-card";
import { FloatingActionButton } from "../components/floating-action-button";
import { usePhrases, type SceneData } from "../hooks/use-phrases";
import { useFetcher, useLoaderData, useNavigate } from "react-router";
import makeServerClient from "~/core/lib/supa-client.server";
import type { Route } from ".react-router/types/app/features/phraselog/screens/+types/home.ts";
import { AIResponseScreen, type AIExpression } from "./ai-response";
import { CustomAlertDialog } from "../components/alertdislog";


export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const { data: { user } } = await client.auth.getUser();
  return { user };
}

export default function PhraseLogHome() {

  const { user } = useLoaderData<typeof loader>();

  const fetcher = useFetcher<{aiResponse: AIExpression[], sceneId: string}>();
  
  const [aiExpressions, setAiExpressions] = useState<AIExpression[] | null>(null);
  const [lastSceneData, setLastSceneData] = useState<SceneData | null>(null);
  const [sceneId , setSceneId] = useState<string | null>(null);
  const isGenerating = fetcher.state === 'submitting';
  const [isLoginAlertOpen, setIsLoginAlertOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { phrases } = usePhrases();


  const navigate = useNavigate();

  const handleGenerateExpressions = (sceneData: SceneData) => {
    setLastSceneData(sceneData);
    const formData = new FormData();
    formData.append("intention", sceneData.intention);
    formData.append("context", sceneData.context);
    formData.append("to_who", sceneData.to_who);
    if (sceneData.nuances) {
      formData.append("nuances", sceneData.nuances.join(","));
    }
    
    fetcher.submit(formData, {
      method: "post",
      action: "/phraselog/create-scene",
    });

    setIsModalOpen(false);
  };

  const handleSaveExpression = async (expressions: AIExpression[], sceneId: string) => {
    
    console.log("Saving expressions:", expressions);
    
    const savePromises = expressions.map(expression => {
      const formData = new FormData();
      formData.append("sceneId", sceneId);
      formData.append("expression", expression.expression);
      formData.append("coaching", JSON.stringify(expression.coaching));
      if (expression.example) {
        formData.append("example", JSON.stringify(expression.example));
      }
      return fetch("/phraselog/save-phrase", {
        method: "POST",
        body: formData,
      });
    });

    try {
      const responses = await Promise.all(savePromises);
      
      const allSucceeded = responses.every(res => res.ok);

      setAiExpressions(null); 
      
      if (allSucceeded) {
        alert(`${expressions.length}개의 표현이 저장되었습니다.`);
        navigate("/phraselog/learning");
      } else {
        const failedCount = responses.filter(res => !res.ok).length;
        alert(`저장에 일부 실패했습니다. (${failedCount}개 실패)`);
        navigate("/");
      }
    } catch (error) {
      console.error("Error saving expressions:", error);
      alert("표현 저장 중 오류가 발생했습니다.");
      setAiExpressions(null);
      navigate("/");
    }
  };

  const handleRegenerate = () => {
    console.log("Regenerating...");
    setAiExpressions(null);
  };



  const handleRecordButtonClick =()=>{
    if(user){
      setIsModalOpen(true);
    }else{
      setIsLoginAlertOpen(true);
    }
  }


  useEffect(() => {
    console.log("fetcher.data...............",fetcher.data);
    
    setSceneId(fetcher.data?.sceneId ?? null);
    setAiExpressions(fetcher.data?.aiResponse ?? null);
   
  }, [fetcher.data]);

  if (aiExpressions || isGenerating) {
     return (
       <AIResponseScreen
         airesults={aiExpressions || []}
         sceneId={sceneId || ''}
         scene={lastSceneData}
         onSave={handleSaveExpression}
         onRegenerate={handleRegenerate}
         isLoading={isGenerating}
       />
     );
   }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="px-4 sm:px-6 md:px-12 lg:px-20 py-6 md:py-10">
        <div className="flex justify-between items-center">
          {phrases.length > 0 && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="rounded-lg px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold"
            >
              <span className="hidden sm:inline">+ Add New Scene</span>
              <span className="sm:hidden">+ 추가</span>
            </Button>
          )}
        </div>
      </header>

      <main className="px-4 sm:px-6 md:px-12 lg:px-20 my-16">
        {phrases.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] sm:min-h-[600px] max-w-4xl mx-auto">
            <div className="text-center space-y-6 sm:space-y-8 bg-white rounded-2xl p-6 sm:p-12 lg:p-16 shadow-sm w-full">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/50 rounded-xl mx-auto mb-4 sm:mb-8"></div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 leading-tight px-2">
                답답했던 그 순간, 영어로는 뭐였을까?
              </h1>
              
              <p className="text-base sm:text-lg text-slate-500 max-w-lg mx-auto px-2">
                상황을 재구성해주시면, AI가 그 장면에 딱 맞는 영어 표현을 찾아드려요
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
                <div className="text-center sm:text-left space-y-3">
                  <div className="w-12 h-12 rounded-lg mx-auto sm:mx-0 bg-[#f7fafa]/80 flex items-center justify-center">
                    <ContextUnderstandingIcon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-slate-800">맥락 이해</h3>
                  <p className="text-sm text-slate-500">상황을 정확히 파악하여 자연스러운 표현 제안</p>
                </div>
                <div className="text-center sm:text-left space-y-3">
                  <div className="w-12 h-12 rounded-lg mx-auto sm:mx-0 bg-[#f7fafa]/80 flex items-center justify-center">
                    <PersonalizationIcon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-slate-800">개인 맞춤</h3>
                  <p className="text-sm text-slate-500">뉘앙스까지 고려한 나만의 표현 모집</p>
                </div>
                <div className="text-center sm:text-left space-y-3">
                  <div className="w-12 h-12 rounded-lg mx-auto sm:mx-0 bg-[#f7fafa]/80 flex items-center justify-center">
                    <InstantLearningIcon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-slate-800">즉시 학습</h3>
                  <p className="text-sm text-slate-500">바로 쓸 수 있는 실용적인 영어 표현 학습</p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleRecordButtonClick}
              className="rounded-xl px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold mt-8 sm:mt-12 h-auto w-full sm:w-auto max-w-xs"
            >
              나의 상황 기록하기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-20 sm:pb-24">
            {phrases.map((phrase) => (
              <PhraseCard
                key={phrase.id}
                phrase={phrase.phrase}
                context={phrase.context}
                onShare={() => {
                  console.log("Share phrase:", phrase.phrase);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {phrases.length > 0 && (
        <FloatingActionButton onClick={() => setIsModalOpen(true)} />
      )}

      <SceneBuilderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleGenerateExpressions}
      />

      <CustomAlertDialog
        open={isLoginAlertOpen}
        onOpenChange={setIsLoginAlertOpen}
        title="로그인이 필요합니다"
        description="이 기능을 사용하려면 먼저 로그인해야 합니다. 로그인 페이지로 이동하시겠습니까?"
        cancelText="취소"
        actionText="로그인"
        onActionClick={() => navigate("/login")}
      />

      
    </div>
  );
}
