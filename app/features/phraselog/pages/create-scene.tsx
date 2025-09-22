import type { Route } from ".react-router/types/app/features/phraselog/screens/+types/home.ts";
import { z } from "zod";    
import { data } from "react-router";
import makerServerClient from "~/core/lib/supa-client.server";

const schema = z.object({
  intention: z.string().min(1),
  context: z.string().min(1),
  to_who: z.string().min(1),
  nuances: z.array(z.string()).optional(),
  ai_request_prompt: z.string().optional(),
});

export async function action({ request }: Route.ActionArgs) {

  if(request.method !== "POST") return data(null, { status: 405 });
  
  const [client , headers] = makerServerClient(request);
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


  const intention = formData.get("intention");
  const context = formData.get("context");
  const to_who = formData.get("to_who");
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

  const prompt = [
    "You are an assistant that responds with JSON only.",
    "Return strictly: { \"english_phrase\": string, \"explanation\": string }.",
    `Intention: ${intention}`,
    `ToWho: ${to_who}`,
    `Context: ${context}`,
    nuances?.length ? `Nuances: ${nuances.join(", ")}` : undefined,
  ].filter(Boolean).join("\n");
  
  
  
}




export default function CreateScene() {
  return <div>CreateScene</div>;
}