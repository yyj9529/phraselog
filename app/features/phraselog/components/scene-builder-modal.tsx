import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "~/core/components/ui/dialog";
import { Button } from "~/core/components/ui/button";
import { Textarea } from "~/core/components/ui/textarea";
import { Badge } from "~/core/components/ui/badge";

import { type SceneData } from "../hooks/use-phrases";

interface SceneBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SceneData) => void;
}

const nuanceTags = [
  "#친절하게", "#정중하게", "#격식있게", "#캐주얼하게", 
  "#확신있게", "#조심스럽게", "#감사하며", "#사과하며"
];

export function SceneBuilderModal({ isOpen, onClose, onSubmit }: SceneBuilderModalProps) {
  const [intention, setIntention] = useState("");
  const [context, setContext] = useState("");
  const [selectedNuances, setSelectedNuances] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleNuanceToggle = (nuance: string) => {
    setSelectedNuances(prev => 
      prev.includes(nuance) 
        ? prev.filter(n => n !== nuance)
        : [...prev, nuance]
    );
  };

  const handleSubmit = async () => {
    if (!intention.trim() || !context.trim()) return;
    
    setIsLoading(true);
    
    try {
      await onSubmit({
        intention: intention.trim(),
        context: context.trim(),
        nuances: selectedNuances.length > 0 ? selectedNuances : undefined,
      });
      
      // Reset form
      setIntention("");
      setContext("");
      setSelectedNuances([]);
    } catch (error) {
      console.error("Failed to submit scene:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full bg-white rounded-2xl border-0 shadow-xl p-0 max-h-[90vh] overflow-y-auto">
        {/* Header - Mobile Optimized */}
        <DialogHeader className="p-4 sm:p-10 pb-4 sm:pb-6 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                어떤 장면이었나요?
              </h2>
              <p className="text-sm sm:text-base text-slate-500">
                상황을 재구성해주세요
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 p-2 h-auto touch-manipulation flex-shrink-0"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </DialogHeader>

        {/* Content - Mobile Optimized */}
        <div className="px-4 sm:px-10 pb-4 sm:pb-10 space-y-6 sm:space-y-8">
          {/* Intention Input */}
          <div className="space-y-3">
            <label className="text-sm sm:text-base font-semibold text-slate-800 block">
              내가 하고 싶었던 말의 핵심은...
            </label>
            <Textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="예: 회의에서 동료의 아이디어에 대해 더 자세한 설명을 요청하고 싶었다"
              className="min-h-[80px] sm:min-h-[80px] bg-slate-50 border-slate-200 rounded-lg text-sm sm:text-base resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Context Input */}
          <div className="space-y-3">
            <label className="text-sm sm:text-base font-semibold text-slate-800 block">
              그 말은 누구에게, 어떤 상황에서 필요했나요?
            </label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="예: 팀 회의에서 상사와 동료들 앞에서, 프로젝트 방향에 대한 논의 중에"
              className="min-h-[80px] sm:min-h-[80px] bg-slate-50 border-slate-200 rounded-lg text-sm sm:text-base resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Nuance Selection - Mobile Optimized */}
          <div className="space-y-3">
            <label className="text-sm sm:text-base font-semibold text-slate-800 block">
              어떤 느낌으로 전달하고 싶었나요? (선택사항)
            </label>
            <div className="flex flex-wrap gap-2">
              {nuanceTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedNuances.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors duration-200 text-xs sm:text-sm px-3 py-1 touch-manipulation ${
                    selectedNuances.includes(tag)
                      ? "bg-purple-500 text-white hover:bg-purple-600"
                      : "bg-white text-blue-500 border-blue-500 hover:bg-blue-50"
                  }`}
                  onClick={() => handleNuanceToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Submit Button - Mobile Optimized */}
          <div className="pt-4 sm:pt-0">
            <Button
              onClick={handleSubmit}
              disabled={!intention.trim() || !context.trim() || isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 sm:py-4 text-sm sm:text-base font-semibold h-auto disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">AI가 분석 중입니다...</span>
                </div>
              ) : (
                "AI에게 물어보기"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
