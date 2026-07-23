-- Store per-session video selection by URL instead of positional index:
-- reordering or deleting videos in a drill no longer silently changes
-- which videos a session shows. NULL keeps meaning "show all".
alter table session_drills add column visible_videos text[];

-- Backfill: translate index selections (0-based positions) into the URLs
-- currently at those positions.
update session_drills sd
set visible_videos = (
  select coalesce(array_agg(d.video_urls[u.i + 1] order by u.ord), '{}')
  from unnest(sd.video_indexes) with ordinality as u(i, ord)
  join drills d on d.id = sd.drill_id
  where d.video_urls[u.i + 1] is not null
)
where sd.video_indexes is not null;

alter table session_drills drop column video_indexes;

create or replace function replace_session_drills(p_session_id uuid, p_items jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  delete from public.session_drills where session_id = p_session_id;

  insert into public.session_drills (session_id, drill_id, position, note, visible_videos)
  select
    p_session_id,
    (item->>'drill_id')::uuid,
    (row_number() over (order by ord))::int,
    nullif(item->>'note', ''),
    case
      when item->'visible_videos' is null or item->'visible_videos' = 'null'::jsonb then null
      else (
        select coalesce(array_agg(v order by ord2), '{}')
        from jsonb_array_elements_text(item->'visible_videos') with ordinality as s(v, ord2)
      )
    end
  from jsonb_array_elements(p_items) with ordinality as t(item, ord);
end;
$$;
