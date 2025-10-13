import { z } from "zod";
import { data, type ActionFunctionArgs } from "react-router";
import makeServerClient from "~/core/lib/supa-client.server";
import { insertPhrase } from "../queries";

// 클라이언트에서 넘어올 데이터의 유효성을 검사하기 위한 Zod 스키마
const schema = z.object({
  sceneId: z.string().uuid("Invalid Scene ID"),
  expression: z.string().min(1, "Expression is required"),
  coaching: z.string().min(1, "Coaching text is required"),
  // 'example' 필드를 optional로 변경하고, 있는 경우에만 파싱하도록 수정합니다.
  example: z.string().optional().transform((val, ctx) => {
    if (!val) return undefined; // 값이 없으면 undefined 반환
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed.en === 'string' && typeof parsed.ko === 'string') {
        return parsed as { en: string; ko: string };
      }
    } catch (e) {
      // 파싱 실패 시 에러 처리
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid example format",
    });
    return z.NEVER;
  }),
});

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method Not Allowed" }, { status: 405 });
  }
  console.log("save-phrase action");
  const [client, headers] = makeServerClient(request);
  const { data: { user } } = await client.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401, headers });
  }

  const formData = await request.formData();
  const formPayload = Object.fromEntries(formData.entries());

  // --- 여기 추가 ---
  console.log('--- [백엔드 받은 데이터 확인] ---');
  console.log(formPayload);
  console.log('-------------------------------');
  // --- 여기까지 추가 ---

  const parsed = schema.safeParse(formPayload);
  console.log("parsed...............",parsed);
  if (!parsed.success) {
    return data({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400, headers });
  }

  const { sceneId, expression, coaching, example } = parsed.data;
  console.log("sceneId...............",sceneId);
  console.log("expression...............",expression);
  console.log("coaching...............",coaching);
  try {
    const savedPhrase = await insertPhrase(client, {
      scene_id: sceneId,
      english_phrase: expression,
      explanation: coaching,
      example: example, // example이 없으면 undefined가 전달됩니다.
      is_saved_by_user: true, // 사용자가 명시적으로 저장했으므로 true
    });
    return data({ success: true, savedPhrase }, { headers });
  } catch (error) {
    console.log("error...............",error);
    return data({ error: "Failed to save phrase" }, { status: 500, headers });
  }
}
