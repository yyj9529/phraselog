import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/core/components/ui/dialog";
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
  "#확신있게", "#조심스럽게", "#감사하며", "#사과하며",
  "#회를내면서","#장난스럽게","#감동적이게","#부끄럽게",
  "#속닥거리면서","#침착하게","#신중하게","#부드럽게",
  "#명확하게","#직설적이게","#당당하게","#자신있게",
];

export function SceneBuilderModal({ isOpen, onClose, onSubmit }: SceneBuilderModalProps) {
  const [intention, setIntention] = useState("");
  const [to_who, setToWho] = useState("");
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
    if (!intention.trim() || !context.trim() || !to_who.trim()) return;
    
    setIsLoading(true);
    
    try {
      await onSubmit({
        intention: intention.trim(),
        context: context.trim(),
        to_who: to_who.trim(),
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
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full bg-card text-foreground rounded-2xl border-0 shadow-xl p-0 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-4 sm:p-10 pb-4 sm:pb-6 sticky top-0 bg-card z-10 border-b">
            <DialogTitle className="text-2xl sm:text-3xl font-bold">
              장면 기록하기
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-muted-foreground">
              어떤 상황이었나요? AI가 최고의 영어 표현을 찾도록 장면을 자세히 설명해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 sm:p-10 space-y-6 sm:space-y-8">
            {/* Intention Input */}
            <div className="space-y-3">
              <label className="text-sm sm:text-base font-semibold text-foreground block">
                내가 하고 싶었던 말의 핵심은...
              </label>
              <Textarea
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="예: 회의에서 동료의 아이디어에 대해 더 자세한 설명을 요청하고 싶었다"
                className="min-h-[80px] sm:min-h-[80px] bg-muted border-border rounded-lg text-sm sm:text-base resize-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground text-foreground"
              />
            </div>
            {/* Context Input */}
            <div className="space-y-3">
              <label className="text-sm sm:text-base font-semibold text-foreground block">
                그 말은 누구에게 하려고 했나요?
              </label>
              <Textarea
                value={to_who}
                onChange={(e) => setToWho(e.target.value)}
                placeholder="예: 직장동료에게"
                className="min-h-[80px] sm:min-h-[80px] bg-muted border-border rounded-lg text-sm sm:text-base resize-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground text-foreground"
              />
            </div>
            {/* Context Input */}
            <div className="space-y-3">
              <label className="text-sm sm:text-base font-semibold text-foreground block">
                어떤 상황에서 그말이 하고 싶었나요 ?
              </label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="예: 팀 회의에서 상사와 동료들 앞에서, 프로젝트 방향에 대한 논의 중에"
                className="min-h-[80px] sm:min-h-[80px] bg-muted border-border rounded-lg text-sm sm:text-base resize-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground text-foreground"
              />
            </div>

            {/* Nuance Selection - Mobile Optimized */}
            <div className="space-y-3">
              <label className="text-sm sm:text-base font-semibold text-foreground block">
                어떤 느낌으로 전달하고 싶었나요? (선택사항)
              </label>
              <div className="flex flex-wrap gap-2">
                {nuanceTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedNuances.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer transition-colors duration-200 text-xs sm:text-sm px-3 py-1 touch-manipulation"
                    onClick={() => handleNuanceToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="p-4 sm:p-10 pt-4 sm:pt-6 sticky bottom-0 bg-card z-10 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              취소
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              표현 생성하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
