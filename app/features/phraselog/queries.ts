import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

// Supabase가 생성한 타입 정의(database.types.ts)를 활용하여
// 'scenes' 테이블에 삽입될 데이터의 타입을 가져옵니다.
// 이렇게 하면 타입 안정성을 확보할 수 있습니다.
type SceneInsert = Database["public"]["Tables"]["scenes"]["Insert"];
type PhraseInsert = Database["public"]["Tables"]["phrases"]["Insert"];
/**
 * 'scenes' 테이블에 새로운 scene을 삽입합니다.
 * @param client - 서버 사이드 Supabase 클라이언트 인스턴스
 * @param sceneData - 삽입할 scene 데이터 (user_id 포함)
 * @returns 삽입에 성공한 경우, 생성된 scene 객체를 반환합니다.
 */
export const insertScene = async (
  client: SupabaseClient<Database>,
  sceneData: SceneInsert
) => {
  const { data, error } = await client
    .from("scenes")
    .insert(sceneData)
    .select()
    .single(); // .single()을 사용하여 결과값이 배열이 아닌 단일 객체로 반환되도록 합니다.
    if (error) {
        console.error("Error inserting scene:", error);
        throw error;
      }
      return data;
}

/**
 * 'phrases' 테이블에 새로운 표현을 삽입합니다.
 * 사용자가 "Save" 버튼을 클릭했을 때 호출됩니다.
 * @param client - 서버 사이드 Supabase 클라이언트 인스턴스
 * @param phraseData - 삽입할 표현 데이터
 * @returns 삽입에 성공한 경우, 생성된 phrase 객체를 반환합니다.
 */
export const insertPhrase = async (
    client: SupabaseClient<Database>,
    phraseData: PhraseInsert
  ) => {
    const { data, error } = await client
      .from("phrases")
      .insert(phraseData)
      .select()
      .single();
  
    if (error) {
      console.error("Error inserting phrase:", error);
      throw error;
    }
  
    return data;
  };