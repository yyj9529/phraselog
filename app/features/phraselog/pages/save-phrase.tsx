import { z } from "zod";
import { data, type ActionFunctionArgs } from "react-router";
import makeServerClient from "~/core/lib/supa-client.server";
import { insertPhrase } from "../queries";

// 클라이언트에서 넘어올 데이터의 유효성을 검사하기 위한 Zod 스키마
const schema = z.object({
  sceneId: z.string().uuid("Invalid Scene ID"),
  expression: z.string().min(1, "Expression is required"),
  coaching: z.string().min(1, "Coaching text is required"),
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
  console.log("formPayload...............",formPayload);
  const parsed = schema.safeParse(formPayload);
  console.log("parsed...............",parsed);
  if (!parsed.success) {
    return data({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400, headers });
  }

  const { sceneId, expression, coaching } = parsed.data;
  console.log("sceneId...............",sceneId);
  console.log("expression...............",expression);
  console.log("coaching...............",coaching);
  try {
    const savedPhrase = await insertPhrase(client, {
      scene_id: sceneId,
      english_phrase: expression,
      explanation: coaching,
      is_saved_by_user: true, // 사용자가 명시적으로 저장했으므로 true
    });
    console.log("savedPhrase...............",savedPhrase);
    return data({ success: true, savedPhrase }, { headers });
  } catch (error) {
    console.log("error...............",error);
    return data({ error: "Failed to save phrase" }, { status: 500, headers });
  }
}
