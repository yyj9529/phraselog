import type { Route } from ".react-router/types/app/features/phraselog/screens/+types/home.ts";
import { z } from "zod";    
import { data  } from "react-router";
import { callGemini } from "../hooks/use-phrases";
import { generatePrompt4_0 } from "./prompt";
import makeServerClient from "~/core/lib/supa-client.server";

const schema = z.object({
  intention: z.string().min(1),
  context: z.string().min(1),
  to_who: z.string().min(1),
  nuances: z.array(z.string()).optional(),
  ai_request_prompt: z.string().optional(),
});

export async function action({ request }: Route.ActionArgs) {
  if(request.method !== "POST") return data(null, { status: 405 });
  
  const [client , headers] = makeServerClient(request);
  const {data : {user}} = await client.auth.getUser();
  
  if(!user) return data(null , {status : 401 , headers});

  const formData = await request.formData();
 
  const getStr = (k : string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v.trim() : "";
  }
  const nuancesField = formData.getAll("nuances").flatMap(v => 
    typeof v === "string" ? v.split(",")
    .map(s=>s.trim()): []);

  const nuances = nuancesField.filter(Boolean);

  const toValidate = {
    intention : getStr("intention"),
    context : getStr("context"),
    to_who : getStr("to_who"),
    nuances : nuances.length ? nuances : undefined,
    ai_request_prompt : getStr("ai_request_prompt") || undefined,
  }
  const parsed = schema.safeParse(toValidate);
  
  if(!parsed.success){
    return data({fieldErrors : parsed.error.flatten().fieldErrors} 
    , {status : 400 , headers});
  }

  const v = parsed.data;
  const prompt = generatePrompt4_0(v.to_who, v.intention, v.context, v.nuances);
  // if(!apiKey) return data({error : "GEMINI_API_KEY is not set"},{status : 500 , headers});

  try{
    console.log('🚀 AI 호출 시작...');
    const geminiResponse = await callGemini(prompt);
    console.log('✅ Gemini 응답 받음:', geminiResponse);
    
    const aiResponse = geminiResponse.candidates[0].content.parts[0].text;
    console.log('📄 AI 텍스트 응답:', aiResponse);
    
    const aiResponseJson = JSON.parse(aiResponse);
    console.log('🎉 JSON 파싱 완료:', aiResponseJson);
    console.log('📊 생성된 표현 개수:', aiResponseJson.length);
   
    // [핵심] 성공적으로 받아온 AI 결과(aiResponseJson)를
    // `data()` 함수로 감싸서 반환합니다.
    // 이렇게 반환된 값은 이 action을 호출했던 `home.tsx`의 `fetcher.data`로 전달됩니다.
    return data(aiResponseJson);


  } catch (error) {
    return data({error : "Failed to generate phrase"},{status : 500 });
    // return data({error : "Failed to generate phrase"},{status : 500 , headers});
  }
  
}



