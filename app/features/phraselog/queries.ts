import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";
import { data } from "react-router";

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

/**
 * 특정 사용자의 모든 Scene과 각 Scene에 속한 Phrase들을 함께 조회합니다.
 * @param client Supabase 클라이언트
 * @param userId 사용자 ID
 * @returns Scene과 Phrase가 포함된 배열
 */
export async function getScenesWithPhrases(client: SupabaseClient, userId: string) {
    const { data, error } = await client
      .from('scenes')
      .select(`
        id,
        my_intention,
        to_who,
        the_context,
        desired_nuance,
        phrases (
          id,
          english_phrase,
          explanation,
          example
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  
    if (error) {
      console.error("Error fetching scenes with phrases:", error);
      return [];
    }
  
    return data;
}

/**
 * 'scenes' 테이블에서 특정 scene을 삭제합니다.
 * @param client - 서버 사이드 Supabase 클라이언트 인스턴스
 * @param sceneId - 삭제할 scene의 ID
 * @param userId - 해당 scene의 소유자 ID (보안 확인용)
 * @returns 삭제 성공 시 null을 반환합니다.
 */
export const deleteScene = async (
  client: SupabaseClient<Database>,
  sceneId: string,
  userId: string
) => {
  // Phrases가 scenes를 참조하고 있으므로, 먼저 해당 scene에 속한 phrase들을 삭제해야 합니다.
  // CASCADE 설정이 DB에 되어있다면 이 과정은 불필요할 수 있습니다.
  const { error: phrasesError } = await client
    .from("phrases")
    .delete()
    .eq("scene_id", sceneId);

  if (phrasesError) {
    console.error("Error deleting phrases for scene:", phrasesError);
    throw phrasesError;
  }

  // 이제 scene을 삭제합니다.
  const { error: sceneError } = await client
    .from("scenes")
    .delete()
    .eq("id", sceneId)
    .eq("user_id", userId);

  if (sceneError) {
    console.error("Error deleting scene:", sceneError);
    throw sceneError;
  }

  return null;
};


export const getScenesCount = async (client: SupabaseClient<Database>, userId: string) => {
  const { count, error: countError } = await client
  .from('scenes')
  .select('id, phrases!inner(id)', { count: 'exact', head: true })
  .eq('user_id', userId);
  
  if (countError) {
    console.error('Error fetching scenes count:', countError);
    return 0;
  }
  return count;
}

export const getScenes = async (client: SupabaseClient<Database>, userId: string, from: number, to: number) => {
  const { data: scenesData, error } = await client
  .from('scenes')
  .select(`
    id,
    my_intention,
    to_who,
    the_context,
    desired_nuance,
    phrases!inner(
      id,
      english_phrase,
      explanation,
      example
    )
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .range(from, to);

  if (error) {
    console.error("Error fetching scenes with phrases:", error);
    return [];
  }

  return scenesData;
}