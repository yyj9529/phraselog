import { pgTable, uuid, text, integer } from "drizzle-orm/pg-core";    
import { timestamp } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";
import { profiles } from "../users/schema";
import { boolean } from "drizzle-orm/pg-core";

export const scenes = pgTable('scenes', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').notNull().references(() => profiles.profile_id, { onDelete: 'cascade' }),
    // 사용자가 입력한 핵심 의도
    my_intention: text('my_intention').notNull(),
    // 사용자가 입력한 대화의 배경
    the_context: text('the_context').notNull(),
    // 사용자가 선택한 뉘앙스 (쉼표로 구분된 문자열 또는 배열 타입)
    desired_nuance: text('desired_nuance'), // 예: "친절하게,정중하게"
    // AI에 요청한 원본 프롬프트 (디버깅 및 재사용 목적)
    ai_request_prompt: text('ai_request_prompt'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const phrases = pgTable('phrases', {
    id: uuid('id').defaultRandom().primaryKey(),
    scene_id: uuid('scene_id').notNull().references(() => scenes.id, { onDelete: 'cascade' }),
    // AI가 제안한 실제 영어 표현
    english_phrase: text('english_phrase').notNull(),
    // AI가 제안한 표현에 대한 설명 (한국어)
    explanation: text('explanation').notNull(),
    // 사용자가 이 표현을 자신의 노트에 저장했는지 여부 (PhraseLog의 핵심)
    is_saved_by_user: boolean('is_saved_by_user').default(false).notNull(),
    // AI 응답의 원본 데이터 (필요시)
    ai_response_raw: text('ai_response_raw'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const learningProgress = pgTable('learning_progress', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').notNull().references(() => profiles.profile_id, { onDelete: 'cascade' }),
    phrase_id: uuid('phrase_id').notNull().references(() => phrases.id, { onDelete: 'cascade' }),
    // 복습 횟수
    review_count: integer('review_count').default(0).notNull(),
    // 마지막 복습 시간
    last_reviewed_at: timestamp('last_reviewed_at'),
    // 암기 완료 여부
    is_mastered: boolean('is_mastered').default(false).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
});