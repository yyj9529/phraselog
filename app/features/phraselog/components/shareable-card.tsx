import { forwardRef } from "react";

interface ShareableCardProps {
  phrase: string;
  context: string;
  className?: string;
}

export const ShareableCard = forwardRef<HTMLDivElement, ShareableCardProps>(
  ({ phrase, context, className = "" }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative w-[540px] h-[960px] sm:w-[640px] sm:h-[1138px] bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col justify-center items-center text-white p-12 sm:p-16 ${className}`}
        style={{
          backgroundImage: "linear-gradient(135deg, #3B82F6 0%, #5856D6 100%)",
        }}
      >
        {/* Main Content */}
        <div className="text-center space-y-8 sm:space-y-12 max-w-md">
          {/* Main Phrase - Responsive Text */}
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight break-words">
            "{phrase}"
          </h1>
          
          {/* Context - Responsive Text */}
          <p className="text-xl sm:text-2xl opacity-80 leading-relaxed break-words">
            {context}
          </p>
        </div>
        
        {/* Watermark - Responsive Position */}
        <div className="absolute bottom-12 sm:bottom-16 left-1/2 transform -translate-x-1/2">
          <p className="text-lg sm:text-xl font-medium opacity-60">
            Learned with PhraseLog
          </p>
        </div>
      </div>
    );
  }
);
