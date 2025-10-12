import type { Route } from ".react-router/types/app/features/phraselog/screens/+types/home.ts";
import { z } from "zod";
import { data } from "react-router";
import { callGemini } from "../hooks/use-phrases";
import { generatePrompt4_0 } from "./prompt";
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
  const prompt = generatePrompt4_0(v.to_who, v.intention, v.context, v.nuances);

  try {
    const geminiResponse = await callGemini(prompt);
    const aiResponse = geminiResponse.candidates[0].content.parts[0].text;
    const aiResponseJson = JSON.parse(aiResponse);

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
      aiResponse: aiResponseJson, 
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



