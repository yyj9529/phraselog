import { useState, useRef } from "react";
import { Button } from "~/core/components/ui/button";
import { PhraseCard } from "../components/phrase-card";
import { ShareableCard } from "../components/shareable-card";
import { FloatingActionButton } from "../components/floating-action-button";
import { SceneBuilderModal } from "../components/scene-builder-modal";
import { usePhrases, type Phrase, type SceneData } from "../hooks/use-phrases";

// Initialize with some sample data
const samplePhrases = [
  {
    intention: "회의에서 동료의 아이디어에 대해 더 자세한 설명을 요청",
    context: "팀 회의에서 상사와 동료들 앞에서, 프로젝트 방향에 대한 논의 중에",
    nuances: ["#정중하게"]
  },
  {
    intention: "문제 해결 중 기다려준 것에 대한 감사 표현",
    context: "고객 서비스 상황에서 문제를 해결하는 동안 기다려준 고객에게",
    nuances: ["#감사하며", "#정중하게"]
  },
  {
    intention: "즉시 답변하기 어려운 질문에 대한 연기 요청",
    context: "회의에서 복잡한 질문을 받았을 때 정확한 답변을 위해 시간이 필요한 상황",
    nuances: ["#조심스럽게", "#정중하게"]
  }
];

export default function PhraseLogLearning() {
  const { phrases, addPhrase, isLoading } = usePhrases();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState<Phrase | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Initialize with sample data on first load
  useState(() => {
    if (phrases.length === 0) {
      samplePhrases.forEach(async (sample) => {
        try {
          await addPhrase(sample);
        } catch (error) {
          console.error("Failed to initialize sample phrase:", error);
        }
      });
    }
  });

  const handleAddPhrase = async (sceneData: SceneData) => {
    try {
      await addPhrase(sceneData);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to add phrase:", error);
    }
  };

  const handleShare = (phrase: Phrase) => {
    setSelectedPhrase(phrase);
    
    // Generate and download the shareable card
    setTimeout(() => {
      if (shareCardRef.current) {
        // In a real implementation, you would use html2canvas or similar
        // to convert the component to an image and download it
        console.log("Generating shareable image for:", phrase.phrase);
        
        // For demo purposes, just show an alert
        alert(`Shareable card generated for: "${phrase.phrase}"`);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - Responsive */}
      <header className="px-4 sm:px-6 md:px-12 lg:px-20 py-6 md:py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-800">PhraseLog</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {phrases.length}개의 표현을 학습 중입니다
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold w-full sm:w-auto"
          >
            <span className="hidden sm:inline">+ Add New Scene</span>
            <span className="sm:hidden">+ 새로운 상황 추가</span>
          </Button>
        </div>
      </header>

      {/* Main Content - Responsive Phrase Grid */}
      <main className="px-4 sm:px-6 md:px-12 lg:px-20 pb-20 sm:pb-24">
        {phrases.length === 0 ? (
          /* Empty State for Learning Screen */
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm max-w-md w-full">
              <div className="w-16 h-16 bg-slate-200 rounded-xl mx-auto mb-6"></div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">
                아직 저장된 표현이 없어요
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mb-6">
                첫 번째 상황을 기록해서 학습을 시작해보세요!
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 py-3 text-sm font-semibold w-full"
              >
                첫 상황 기록하기
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {phrases.map((phrase) => (
              <PhraseCard
                key={phrase.id}
                phrase={phrase.phrase}
                context={phrase.context}
                onShare={() => handleShare(phrase)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button - Mobile Optimized */}
      <FloatingActionButton onClick={() => setIsModalOpen(true)} />

      {/* Scene Builder Modal */}
      <SceneBuilderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddPhrase}
      />

      {/* Hidden Shareable Card for Image Generation */}
      {selectedPhrase && (
        <div className="fixed -top-[9999px] -left-[9999px] pointer-events-none">
          <ShareableCard
            ref={shareCardRef}
            phrase={selectedPhrase.phrase}
            context={selectedPhrase.context}
          />
        </div>
      )}
    </div>
  );
}
