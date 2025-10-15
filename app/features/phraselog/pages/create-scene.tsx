import type { Route } from ".react-router/types/app/features/phraselog/screens/+types/home.ts";
import { z } from "zod";
import { data } from "react-router";
import { callGemini } from "../hooks/use-phrases";
import { generatePrompt4_3 } from "./prompt";
import makeServerClient from "~/core/lib/supa-client.server";
import { insertScene } from "../queries";
import { prompt_version } from "./prompt";

// Zod 스키마는 폼에서 직접 받는 값들만 검증하도록 수정합니다.
// AI 프롬프트는 서버에서 생성되므로 여기서 제외합니다.
const schema = z.object({
  intention: z.string().min(1),
  context: z.string().min(1),
  to_who: z.string().min(1),
  nuances: z.array(z.string()).optional(),
});

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return data(null, { status: 405 });

  const [client, headers] = makeServerClient(request);
  const { data: { user } } = await client.auth.getUser();

  if (!user) return data(null, { status: 401, headers });

  const formData = await request.formData();

  const getStr = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v.trim() : "";
  };
  const nuancesField = formData
    .getAll("nuances")
    .flatMap((v) =>
      typeof v === "string" ? v.split(",").map((s) => s.trim()) : [],
    );
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
  const prompt = generatePrompt4_3(v.to_who, v.intention, v.context, v.nuances);

  try{
    console.log('🚀 AI 호출 시작...');
    const geminiResponse = await callGemini(prompt);
    console.log('✅ Gemini 응답 받음:', geminiResponse);
    
    const aiResponse = geminiResponse.candidates[0].content.parts[0].text;
    
    // --- 여기부터 추가 ---
    console.log('---------- [AI 원본 응답] ----------');
    console.log(aiResponse);
    console.log('------------------------------------');
    // --- 여기까지 추가 ---

    // AI가 보낸 원본 데이터를 먼저 확인하기 위한 로그입니다.
    console.log("Raw content from AI:", aiResponse);

    // content가 문자열이 아닐 경우를 대비해 안전하게 문자열로 변환합니다.
    const stringContent =
      typeof aiResponse === "string" ? aiResponse : JSON.stringify(aiResponse);

    // 문자열에서 ```json 과 ``` 부분을 제거하여 순수한 JSON 데이터만 남깁니다.
    const cleanedContent = stringContent
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();

    // 정리된 데이터를 다시 한번 확인하기 위한 로그입니다.
    console.log("Cleaned content:", cleanedContent);

    let phrases;
    try {
      // 정리된 순수 JSON 문자열을 파싱합니다.
      phrases = JSON.parse(cleanedContent);
    } catch (error) {
      // 만약 파싱 중 에러가 발생하면, 에러를 기록하고 앱이 멈추지 않도록 합니다.
      console.error("Error parsing JSON:", error);
      return data(
        { error: "AI로부터 받은 응답을 처리하는 데 실패했습니다." },
        { status: 500 },
      );
    }

    if (!Array.isArray(phrases)) {
      throw new Error("AI로부터 받은 응답이 배열이 아닙니다.");
    }

    // queries.ts에 정의한 insertScene 함수를 호출합니다.
    const newScene = await insertScene(client, {
      user_id: user.id,
      my_intention: v.intention,
      to_who: v.to_who,
      the_context: v.context,
      desired_nuance: v.nuances?.join(","),
      ai_request_prompt_version: prompt_version, // DB 스키마에 맞게 필드명 사용
    });

    if (!newScene) {
      throw new Error("Scene creation failed.");
    }

    // AI 응답 결과와 새로 생성된 scene의 ID를 함께 반환합니다.
    console.log("aiResponse...............",aiResponse);
    console.log("sceneId...............",newScene.id );
    return data({ 
      aiResponse: phrases, 
      sceneId: newScene.id 
    }, { headers });
    
  } catch (error) {
    console.error("Error in create-scene action:", error);
    // 에러 발생 시에도 data 객체 안에 error 필드를 담아 반환합니다.
    return data(
      { error: "Failed to generate or save phrase" },
      { status: 500, headers },
    );
  }
}



