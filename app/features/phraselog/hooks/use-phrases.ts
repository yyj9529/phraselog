import { useState, useCallback } from "react";

export interface Phrase {
  id: string;
  phrase: string;
  context: string;
  intention?: string;
  nuances?: string[];
  createdAt: Date;
}

export interface SceneData {
  intention: string;
  context: string;
  nuances?: string[];
}

// Mock AI service for demo purposes
const mockAIService = {
  async generatePhrase(sceneData: SceneData): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const phrases = [
      "Could you please elaborate on that point?",
      "I appreciate your patience with this matter.",
      "Let me circle back on that after I review the details.",
      "I'd like to get your thoughts on this approach.",
      "Would it be possible to extend the deadline?",
      "I wanted to follow up on our previous conversation.",
      "Thank you for bringing this to my attention.",
      "I'll make sure to address this right away.",
      "Could we schedule a time to discuss this further?",
      "I understand your concern and I'll look into it."
    ];
    
    // Simple phrase selection based on keywords in intention
    const intention = sceneData.intention.toLowerCase();
    if (intention.includes("question") || intention.includes("ask")) {
      return phrases[0];
    } else if (intention.includes("thank") || intention.includes("appreciate")) {
      return phrases[1];
    } else if (intention.includes("delay") || intention.includes("later")) {
      return phrases[2];
    } else if (intention.includes("opinion") || intention.includes("thought")) {
      return phrases[3];
    } else if (intention.includes("time") || intention.includes("deadline")) {
      return phrases[4];
    }
    
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
};

export function usePhrases() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPhrase = useCallback(async (sceneData: SceneData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const generatedPhrase = await mockAIService.generatePhrase(sceneData);
      
      const newPhrase: Phrase = {
        id: Date.now().toString(),
        phrase: generatedPhrase,
        context: sceneData.context,
        intention: sceneData.intention,
        nuances: sceneData.nuances,
        createdAt: new Date(),
      };
      
      setPhrases(prev => [newPhrase, ...prev]);
      return newPhrase;
    } catch (err) {
      setError("Failed to generate phrase. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removePhrase = useCallback((id: string) => {
    setPhrases(prev => prev.filter(phrase => phrase.id !== id));
  }, []);

  const updatePhrase = useCallback((id: string, updates: Partial<Phrase>) => {
    setPhrases(prev => prev.map(phrase => 
      phrase.id === id ? { ...phrase, ...updates } : phrase
    ));
  }, []);

  return {
    phrases,
    isLoading,
    error,
    addPhrase,
    removePhrase,
    updatePhrase,
  };
}


async function callGemini(prompt : string){
  const apiKey = process.env.GEMINI_API_KEY;
  if(!apiKey) throw new Error("GEMINI_API_KEY is not set");
}