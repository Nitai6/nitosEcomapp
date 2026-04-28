-- 09_hooks.sql — hook-mining: store TikTok/IG video hooks + features + performance signals
-- Goal: ingest 5000+ videos, tag visual/audio/movement features at fine grain,
-- compute viral_score per source, feed pattern-lift analysis.

create extension if not exists vector;

-- Source platform enum
do $$ begin
  create type hook_source as enum ('tiktok', 'instagram', 'own');
exception when duplicate_object then null; end $$;

create table if not exists hooks (
  id uuid primary key default gen_random_uuid(),

  -- Provenance
  source            hook_source not null,
  source_url        text not null unique,
  source_id         text,                       -- platform's native id
  scraped_at        timestamptz not null default now(),
  account_handle    text,
  account_followers bigint,
  niche             text,                       -- inferred or tagged
  brand_id          uuid references brands(id) on delete set null,  -- if it's our own ad

  -- Raw media
  video_path        text,                       -- supabase storage path (mp4)
  thumbnail_path    text,
  duration_sec      numeric(6,2),
  hook_duration_sec numeric(5,2),               -- time before "value reveal"
  aspect_ratio      text,                       -- 9:16, 1:1, 16:9
  posted_at         timestamptz,

  -- Performance (raw + derived)
  views        bigint,
  likes        bigint,
  comments     bigint,
  shares       bigint,
  saves        bigint,
  performance_proxy jsonb,                      -- raw platform metrics blob
  viral_score  numeric(10,4),                   -- views/followers, weighted by saves+shares
  is_winner    boolean default false,           -- top decile within (source, niche)

  -- Hook features — three dimensions, fine grain in jsonb
  visual_features   jsonb,
  /* shape:
     {
       palette_hex: ["#aa1122","#fff","#000"],
       dominant_color: "red",
       indoor_outdoor: "indoor",
       person_present: true,
       person_count: 1,
       person_gender: "female",
       person_age_band: "25-34",
       face_framing: "close_up" | "medium" | "wide",
       text_overlay_present: true,
       text_overlay_words: 6,
       text_overlay_style: "yellow_bold_caps",
       aesthetic: "ugc_handheld" | "studio_clean" | "cinematic" | "meme",
       props: ["product","kitchen_counter"],
       lighting: "natural_window" | "ring_light" | "studio_softbox",
       background_clutter: "low" | "medium" | "high"
     }
  */

  audio_features    jsonb,
  /* shape:
     {
       has_voice: true,
       voice_gender: "female",
       voice_pace_wpm: 165,
       first_word: "stop",
       first_sentence: "stop scrolling if you have oily skin",
       hook_delivery: "question" | "command" | "statement" | "story_lead",
       music_present: true,
       music_genre: "lo-fi",
       music_energy: "low" | "med" | "high",
       sfx_present: true,
       sfx_types: ["whoosh","ding"]
     }
  */

  movement_features jsonb,
  /* shape:
     {
       camera_motion: "static" | "handheld" | "pan" | "zoom_in" | "tracking",
       cuts_in_first_3s: 4,
       cuts_per_sec: 1.3,
       subject_motion: "low" | "med" | "high",
       transition_types: ["jump_cut","whip_pan"],
       gesture_present: true,
       gesture_types: ["point_at_camera","hand_reveal"]
     }
  */

  -- Embedding for semantic search across hooks
  embedding vector(1536),

  -- Pipeline status
  status text not null default 'scraped',  -- scraped → downloaded → transcribed → vision_tagged → scored → embedded
  notes  text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists hooks_source_niche_idx on hooks(source, niche);
create index if not exists hooks_winner_idx on hooks(is_winner) where is_winner = true;
create index if not exists hooks_viral_score_idx on hooks(viral_score desc nulls last);
create index if not exists hooks_status_idx on hooks(status);
create index if not exists hooks_visual_gin on hooks using gin (visual_features);
create index if not exists hooks_audio_gin  on hooks using gin (audio_features);
create index if not exists hooks_move_gin   on hooks using gin (movement_features);
create index if not exists hooks_embedding_idx on hooks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Pattern-lift cache: precomputed feature → winner-rate analysis (refreshed weekly)
create table if not exists hook_patterns (
  id uuid primary key default gen_random_uuid(),
  cohort_source hook_source,
  cohort_niche  text,
  feature_path  text not null,          -- e.g. "visual_features.dominant_color"
  feature_value text not null,          -- e.g. "red"
  sample_size   integer not null,
  winner_rate   numeric(6,4),           -- p(winner | feature)
  baseline_rate numeric(6,4),           -- p(winner)
  lift          numeric(6,3),           -- winner_rate / baseline_rate
  examples      jsonb,                  -- [{hook_id, source_url, viral_score}]
  computed_at   timestamptz default now()
);
create index if not exists hook_patterns_lookup
  on hook_patterns(cohort_source, cohort_niche, feature_path, lift desc);

-- Convenience view: top patterns
create or replace view v_top_hook_patterns as
select cohort_source, cohort_niche, feature_path, feature_value,
       sample_size, winner_rate, baseline_rate, lift
from hook_patterns
where sample_size >= 30 and lift >= 1.5
order by lift desc;
