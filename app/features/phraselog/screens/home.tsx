import { useState } from "react";
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

export default function PhraseLogHome() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { phrases, addPhrase, isLoading } = usePhrases();

  const handleAddPhrase = async (sceneData: SceneData) => {
    try {
      await addPhrase(sceneData);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to add phrase:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - Responsive */}
      <header className="px-4 sm:px-6 md:px-12 lg:px-20 py-6 md:py-10">
        <div className="flex justify-between items-center">
          {phrases.length > 0 && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold"
            >
              <span className="hidden sm:inline">+ Add New Scene</span>
              <span className="sm:hidden">+ 추가</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content - Responsive */}
      <main className="px-4 sm:px-6 md:px-12 lg:px-20 my-16">
        {phrases.length === 0 ? (
          /* Empty State - Mobile Optimized */
          <div className="flex flex-col items-center justify-center min-h-[500px] sm:min-h-[600px] max-w-4xl mx-auto">
            {/* Central Content */}
            <div className="text-center space-y-6 sm:space-y-8 bg-white rounded-2xl p-6 sm:p-12 lg:p-16 shadow-sm w-full">
              {/* Icon Background */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/50 rounded-xl mx-auto mb-4 sm:mb-8"></div>
              
              {/* Headline - Responsive Text */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 leading-tight px-2">
                답답했던 그 순간, 영어로는 뭐였을까?
              </h1>
              
              {/* Description - Responsive Text */}
              <p className="text-base sm:text-lg text-slate-500 max-w-lg mx-auto px-2">
                상황을 재구성해주시면, AI가 그 장면에 딱 맞는 영어 표현을 찾아드려요
              </p>
              
              {/* Value Propositions - Mobile Stack */}
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
            
            {/* CTA Button - Mobile Optimized */}
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold mt-8 sm:mt-12 h-auto w-full sm:w-auto max-w-xs"
            >
              나의 상황 기록하기
            </Button>
          </div>
        ) : (
          /* Active State - Responsive Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-20 sm:pb-24">
            {phrases.map((phrase) => (
              <PhraseCard
                key={phrase.id}
                phrase={phrase.phrase}
                context={phrase.context}
                onShare={() => {
                  // TODO: Implement share functionality
                  console.log("Share phrase:", phrase.phrase);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button - Mobile Optimized */}
      {phrases.length > 0 && (
        <FloatingActionButton onClick={() => setIsModalOpen(true)} />
      )}

      {/* Scene Builder Modal */}
      <SceneBuilderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddPhrase}
      />
    </div>
  );
}
