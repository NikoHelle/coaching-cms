-- Per-session video selection: which of a drill's videos (by 0-based index)
-- show on the session page. NULL = no restriction (all videos, including
-- ones added to the drill later).
alter table session_drills add column video_indexes int[];

-- Same transactional replace as 0001, now carrying video_indexes through.
-- CREATE OR REPLACE preserves the existing grants (execute revoked from
-- anon/public, granted to authenticated).
create or replace function replace_session_drills(p_session_id uuid, p_items jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  delete from public.session_drills where session_id = p_session_id;

  insert into public.session_drills (session_id, drill_id, position, note, video_indexes)
  select
    p_session_id,
    (item->>'drill_id')::uuid,
    (row_number() over (order by ord))::int,
    nullif(item->>'note', ''),
    case
      when item->'video_indexes' is null or item->'video_indexes' = 'null'::jsonb then null
      else (
        select coalesce(array_agg(v::int order by ord2), '{}')
        from jsonb_array_elements_text(item->'video_indexes') with ordinality as s(v, ord2)
      )
    end
  from jsonb_array_elements(p_items) with ordinality as t(item, ord);
end;
$$;
