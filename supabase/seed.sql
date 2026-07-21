insert into drills (slug, title, description, purpose, player_count, duration_minutes,
                    focus_points, dos, donts, video_urls, tags, status)
values (
  'rondo-4v2',
  'Rondo 4v2',
  'Four attackers keep the ball in a 8x8m grid against two defenders. Defender who wins the ball swaps with the attacker who lost it.',
  'Quick passing and support angles under pressure.',
  '6',
  15,
  array['first touch', 'passing angles', 'scanning'],
  array['move immediately after passing', 'open your body to see the whole grid'],
  array['do not stand behind a defender', 'no hopeful first-time smashes'],
  array['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
  array['passing', 'warm-up'],
  'public'
);

insert into sessions (slug, title, session_date, notes, status)
values ('sample-session', 'Sample Training Session', current_date,
        'Bring both light and dark shirts. We focus on passing today.', 'public');

insert into session_drills (session_id, drill_id, position, note)
select s.id, d.id, 1, 'Only 10 minutes today, weak foot only.'
from sessions s, drills d
where s.slug = 'sample-session' and d.slug = 'rondo-4v2';
