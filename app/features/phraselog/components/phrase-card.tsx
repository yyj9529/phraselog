import { Card } from "~/core/components/ui/card";
import { Button } from "~/core/components/ui/button";

interface PhraseCardProps {
  phrase: string;
  context: string;
  onShare: () => void;
}

export function PhraseCard({ phrase, context, onShare }: PhraseCardProps) {
    return (
        <Card className="bg-card border-0 rounded-2xl p-4 sm:p-6 shadow-none hover:shadow-sm transition-shadow duration-200 h-full flex flex-col justify-between">
            <div>
                <p className="text-lg font-semibold text-foreground mb-3 leading-snug">{phrase}</p>
                <p className="text-sm text-muted-foreground">{context}</p>
            </div>
            <div className="flex justify-end mt-4">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onShare}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 h-auto touch-manipulation"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                </Button>
            </div>
        </Card>
    );
}
