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
  to_who: string;
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
    
    console.log("1.sceneData...............",sceneData);
    try {
      // FormData 생성
      const formData = new FormData();
      formData.append("intention", sceneData.intention);
      formData.append("context", sceneData.context);
      formData.append("to_who", sceneData.to_who);
      
      console.log("2.formData...............",formData);
      // nuances 추가
      if (sceneData.nuances && sceneData.nuances.length > 0) {
        sceneData.nuances.forEach(nuance => {
          formData.append("nuances", nuance);
        });
      }

      console.log(".formData...............after append nuances",formData);
      // 백엔드 API 호출
      const response = await fetch("/phraselog/create-scene", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate phrase");
      }

      const newPhrase = await response.json();
      
      // 생성된 phrase를 로컬 state에 추가
      const phrase: Phrase = {
        id: newPhrase.id,
        phrase: newPhrase.phrase,
        context: newPhrase.context,
        intention: newPhrase.intention,
        nuances: newPhrase.nuances,
        createdAt: new Date(newPhrase.createdAt),
      };
      
      setPhrases(prev => [phrase, ...prev]);
      return phrase;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate phrase. Please try again.";
      setError(errorMessage);
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

export async function callGemini(prompt : string){
  const apiKey = process.env.GEMINI_API_KEY;
  if(!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const resp = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + apiKey,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: { response_mime_type: "application/json" }
      })
    }
  );
  
  if(!resp.ok) {
    const errorBody = await resp.json();
    console.log("Error response body : ",errorBody);
    throw new Error(`Gemini API error : ${resp.status} ${resp.statusText}`);
  
  }
  return resp.json();
}