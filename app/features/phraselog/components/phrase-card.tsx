import { Card } from "~/core/components/ui/card";
import { Button } from "~/core/components/ui/button";

interface PhraseCardProps {
  phrase: string;
  context: string;
  onShare: () => void;
}

export function PhraseCard({ phrase, context, onShare }: PhraseCardProps) {
  return (
    <Card className="bg-white border-0 rounded-2xl p-4 sm:p-6 shadow-none hover:shadow-sm transition-shadow duration-200 h-full">
      <div className="space-y-3 sm:space-y-4 h-full flex flex-col">
        {/* Main Phrase - Responsive Text */}
        <h3 className="text-lg sm:text-xl font-semibold text-slate-800 leading-tight flex-1">
          {phrase}
        </h3>
        
        {/* Context - Responsive Text */}
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          <span className="hidden sm:inline">Context: </span>{context}
        </p>
        
        {/* Share Button - Mobile Optimized */}
        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-50 p-2 h-auto touch-manipulation"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </Button>
        </div>
      </div>
    </Card>
  );
}
