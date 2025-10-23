import type { Route } from ".react-router/types/app/features/phraselog/screens/+types/learning.ts";
import { useLoaderData, Link, data, useFetcher } from "react-router";
import makeServerClient from "~/core/lib/supa-client.server";
import { Button } from "~/core/components/ui/button";
import { useState, useMemo, useRef } from "react";
import { Modal } from "~/core/components/ui/modal";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/core/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/core/components/ui/pagination";
import { deleteScene } from "../queries";
import { Share2Icon } from "lucide-react";
import { toBlob, toPng } from 'html-to-image';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/core/components/ui/dialog";

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

type Phrase = {
  id: string;
  english_phrase: string;
  explanation: string;
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

type ShareableCardData = {
  phrase: Phrase;
  scene: SceneWithPhrases;
} | null;

// Shareable Card Component
const ShareableCard = React.forwardRef<
  HTMLDivElement,
  { data: ShareableCardData }
>(({ data }, ref) => {
  if (!data) return null;
  const { phrase, scene } = data;

  const coaching: CoachingObject = useMemo(() => {
    try {
      return JSON.parse(phrase.explanation);
    } catch {
      return { explanation: "코칭 내용을 불러올 수 없습니다.", cultural_context: "", strategic_advice: "" };
    }
  }, [phrase.explanation]);

  const keyCoachingPoint = coaching.strategic_advice || coaching.cultural_context || coaching.explanation;

  return (
    <div ref={ref} className="bg-white text-slate-800 p-6 rounded-lg shadow-xl w-[350px] font-sans border">
      <div className="text-center mb-4">
        <p className="text-sm text-slate-500 font-semibold">"{scene.my_intention}"</p>
        <h2 className="text-base font-bold text-blue-600 mt-1">상황에 딱 맞는 AI 코칭 🚀</h2>
      </div>
      
      <div className="bg-slate-50 p-4 rounded-md mb-4 border border-slate-200">
        <p className="text-lg font-bold text-slate-900">
          {phrase.english_phrase}
        </p>
      </div>

      <div className="mb-2">
        <h3 className="font-bold text-sm text-slate-600 mb-1">💡 AI's Coaching</h3>
        <p className="text-sm text-slate-700 bg-blue-50/50 p-3 rounded-md border border-blue-100">
          {keyCoachingPoint}
        </p>
      </div>

      <p className="text-xs text-center font-semibold text-slate-400 mt-4">
        Powered by PhraseLog
      </p>
    </div>
  );
});
ShareableCard.displayName = "ShareableCard";

function AnalysisResult({ coaching }: { coaching: string }) {
  const [selectedCategory, setSelectedCategory] = useState<Category>(coachingCategories[0]);

  const parsedCoaching: CoachingObject = useMemo(() => {
    try {
      if (coaching && typeof coaching === 'string') {
        return JSON.parse(coaching);
      }
    } catch (e) {
      console.error("Coaching JSON 파싱 실패:", e);
    }
    return { explanation: "분석 결과를 불러올 수 없습니다.", cultural_context: "", strategic_advice: "" };
  }, [coaching]);

  return (
    <div className="mt-2 p-4 bg-white rounded-lg border border-slate-200 animate-in fade-in-50 space-y-3">
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
      <p className="text-sm text-slate-600 leading-relaxed min-h-[5em]">
        {parsedCoaching[categoryMap[selectedCategory]] || "내용이 없습니다."}
      </p>
    </div>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const [client, headers] = makeServerClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (user) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const itemsPerPage = 5;
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { count, error: countError } = await client
      .from('scenes')
      .select('id, phrases!inner(id)', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('Error fetching scenes count:', countError);
    }

    const { data: scenesData, error } = await client
      .from('scenes')
      .select(`
        id,
        my_intention,
        to_who,
        the_context,
        desired_nuance,
        phrases!inner(
          id,
          english_phrase,
          explanation,
          example
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching scenes with phrases:", error);
      return data({ scenes: [], totalPages: 0, currentPage: 1 }, { headers });
    }
    
    const scenes: SceneWithPhrases[] = (scenesData as any) || [];
    const totalPages = Math.ceil((count || 0) / itemsPerPage);

    return data({ scenes, totalPages, currentPage: page }, { headers });
  }

  return data({ scenes: [], totalPages: 0, currentPage: 1 }, { headers });
}

export async function action({ request }: Route.ActionArgs) {
  const [client, headers] = makeServerClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return data({ success: false, error: "Unauthorized" }, { status: 401, headers });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "deleteScene") {
    const sceneId = formData.get("sceneId") as string;
    if (!sceneId) {
      return data({ success: false, error: "Scene ID is missing" }, { status: 400, headers });
    }
    try {
      await deleteScene(client, sceneId, user.id);
      return data({ success: true }, { headers });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Deletion failed:", errorMessage);
      return data({ success: false, error: errorMessage }, { status: 500, headers });
    }
  }

  return data({ success: false, error: "Invalid intent" }, { status: 400, headers });
}

export default function LearningScreen(loaderData: Route.ComponentProps) {
  const { scenes = [], totalPages = 0, currentPage = 1 } = loaderData.loaderData || {};
  const [openAnalysisId, setOpenAnalysisId] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<SceneWithPhrases | null>(null);
  const [sceneToDelete, setSceneToDelete] = useState<SceneWithPhrases | null>(null);
  const [dataToShare, setDataToShare] = useState<ShareableCardData>(null);
  const fetcher = useFetcher();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const blob = await toBlob(cardRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      if (blob && navigator.share) {
        await navigator.share({
          files: [new File([blob], 'phraselog-card.png', { type: blob.type })],
          title: 'PhraseLog Expression',
          text: 'Check out this expression I learned from PhraseLog!',
        });
      } else if (blob) {
        const dataUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'phraselog-card.png';
        link.href = dataUrl;
        link.click();
        URL.revokeObjectURL(dataUrl);
      }
    } catch (err) {
      console.error('Sharing failed:', err);
      alert('이미지를 생성하거나 공유하는 데 실패했습니다.');
    }
  };

  const toggleAnalysis = (phraseId: string) => {
    setOpenAnalysisId(openAnalysisId === phraseId ? null : phraseId);
  };

  const handleSceneClick = (scene: SceneWithPhrases) => {
    setSelectedScene(scene);
  };

  const openDeleteModal = (scene: SceneWithPhrases, e: React.MouseEvent) => {
    e.stopPropagation();
    setSceneToDelete(scene);
  };
  
  const openShareModal = (phrase: Phrase, scene: SceneWithPhrases, e: React.MouseEvent) => {
    e.stopPropagation();
    setDataToShare({ phrase, scene });
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
        <h1 className="text-3xl font-bold text-slate-800">나의 표현 목록</h1>
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
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    MY SCENE
                  </h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-slate-400 cursor-pointer hover:underline" onClick={() => handleSceneClick(scene)}>자세히 보기 &rarr;</span>
                    <button 
                      onClick={(e) => openDeleteModal(scene, e)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full"
                      aria-label="Delete scene"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                </div>
                <p className="text-slate-700 text-base" onClick={() => handleSceneClick(scene)}>
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
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-blue-600 text-base mb-2 pr-4">{phrase.english_phrase}</p>
                      <button 
                        onClick={(e) => openShareModal(phrase, scene, e)}
                        className="text-slate-400 hover:text-blue-500 transition-colors p-1 rounded-full"
                        aria-label="Share phrase"
                      >
                        <Share2Icon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <button 
                        onClick={() => toggleAnalysis(phrase.id)}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg flex justify-between items-center transition-colors"
                      >
                        <span>AI 분석 결과 보기</span>
                        <span className={`transform transition-transform duration-200 ${openAnalysisId === phrase.id ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                      {openAnalysisId === phrase.id && (
                        <AnalysisResult coaching={phrase.explanation} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious href={`?page=${currentPage - 1}`} />
                  </PaginationItem>
                )}
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href={`?page=${page}`}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext href={`?page=${currentPage + 1}`} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>

      <Modal isOpen={!!dataToShare} onClose={() => setDataToShare(null)} title="표현 공유하기">
        <div className="p-4 bg-slate-100 rounded-lg flex justify-center">
          <ShareableCard ref={cardRef} data={dataToShare} />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setDataToShare(null)}>Close</Button>
          <Button onClick={handleShare}>Share</Button>
        </div>
      </Modal>

      <Dialog
        open={!!selectedScene}
        onOpenChange={(isOpen) => !isOpen && setSelectedScene(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>대화 시뮬레이션</DialogTitle>
            <DialogDescription>
              '{selectedScene?.my_intention}' 의도를 전달하기 위한 대화 예시입니다.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto pr-4">
            <div className="space-y-6 py-4">
              {/* Scene Context Box */}
              <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-700 dark:text-slate-300">My Scene</h3>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p><span className="font-semibold text-slate-600 dark:text-slate-400">To:</span> {selectedScene?.to_who}</p>
                  <p><span className="font-semibold text-slate-600 dark:text-slate-400">Context:</span> {selectedScene?.the_context}</p>
                  {selectedScene?.desired_nuance && <p><span className="font-semibold text-slate-600 dark:text-slate-400">Nuance:</span> {selectedScene?.desired_nuance}</p>}
                </div>
              </div>

              {/* Conversation Examples */}
              <div className="space-y-6">
                {selectedScene?.phrases.map((phrase, index) => (
                  <div key={phrase.id} className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI 추천 표현 #{index + 1}</h4>
                    <div className="flex items-start gap-3">
                      {/* Speaker Avatar (e.g., '나') */}
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                        나
                      </div>
                      {/* Chat Bubble */}
                      <div className="relative flex-1 rounded-lg rounded-bl-none bg-blue-100 p-3 dark:bg-blue-900/50">
                        <p className="text-base text-slate-800 dark:text-slate-200">{phrase.english_phrase}</p>
                      </div>
                    </div>
                    {/* Example sentences if they exist */}
                    {(phrase.example?.en || phrase.example?.ko) && (
                      <div className="flex items-start gap-3 pl-11">
                          <div className="relative flex-1 rounded-lg border bg-slate-100 p-3 dark:bg-slate-800">
                              <p className="text-xs font-semibold text-slate-500">대화 예시:</p>
                              <p className="mt-1 text-sm italic text-slate-600 dark:text-slate-400">
                                {phrase.example.en}
                              </p>
                              <p className="mt-1 text-sm italic text-slate-500 dark:text-slate-500">
                                ({phrase.example.ko})
                              </p>
                          </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setSelectedScene(null)}>닫기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!sceneToDelete} onOpenChange={(open) => !open && setSceneToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 장면과 관련된 모든 표현들이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>취소</AlertDialogCancel>
            <fetcher.Form method="post" onSubmit={() => setSceneToDelete(null)} className="inline-flex">
              <input type="hidden" name="intent" value="deleteScene" />
              <input type="hidden" name="sceneId" value={sceneToDelete?.id} />
              <Button type="submit" variant="destructive" asChild>
                 <AlertDialogAction>삭제</AlertDialogAction>
              </Button>
            </fetcher.Form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
