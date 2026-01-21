
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  klas text,
  avatar_url text,
  app_theme text default 'green', 
  role text default 'user' check (role in ('user','admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles: eigen profiel lezen"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles: eigen profiel bijwerken"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Profiles: eigen profiel aanmaken"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "Profiles: admin mag alle profielen lezen"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Trigger: bij nieuwe user een profiel aanmaken
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, klas)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'klas'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text,
  image_url text,
  created_at timestamptz default now()
);

create index if not exists posts_created_at_idx on public.posts(created_at desc);
alter table public.posts enable row level security;

create policy "Posts: iedereen lezen"
  on public.posts for select to authenticated
  using (true);

create policy "Posts: eigen posts maken"
  on public.posts for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Posts: eigen posts verwijderen"
  on public.posts for delete to authenticated
  using (auth.uid() = user_id);

create policy "Posts: admin mag alle posts verwijderen"
  on public.posts for delete to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

create index if not exists post_comments_post_id_idx on public.post_comments(post_id);
alter table public.post_comments enable row level security;

create policy "Comments: iedereen lezen"
  on public.post_comments for select to authenticated
  using (true);

create policy "Comments: eigen reacties plaatsen"
  on public.post_comments for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Comments: eigen reacties verwijderen"
  on public.post_comments for delete to authenticated
  using (auth.uid() = user_id);

create policy "Comments: admin mag alle verwijderen"
  on public.post_comments for delete to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists notes_user_id_idx on public.notes(user_id);
alter table public.notes enable row level security;

create policy "Notes: eigen notities crud"
  on public.notes for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null, 
  is_anonymous boolean not null default false,
  mood int check (mood >= 1 and mood <= 5), 
  what_went_well text,
  what_to_improve text,
  extra text,
  created_at timestamptz default now()
);

create index if not exists reflections_created_at_idx on public.reflections(created_at desc);
alter table public.reflections enable row level security;

create policy "Reflections: eigen reflecties lezen"
  on public.reflections for select to authenticated
  using (auth.uid() = user_id);

create policy "Reflections: eigen reflecties plaatsen"
  on public.reflections for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Reflections: admin mag alle lezen (voor stats)"
  on public.reflections for select to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  points int default 0,
  start_date date,
  end_date date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.challenges enable row level security;

create policy "Challenges: iedereen lezen"
  on public.challenges for select to authenticated
  using (true);

create policy "Challenges: alleen admin insert/update/delete"
  on public.challenges for all to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


create table if not exists public.steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  steps int not null default 0,
  source text default 'pedometer',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

create index if not exists steps_user_date_idx on public.steps(user_id, date desc);
alter table public.steps enable row level security;

create policy "Steps: eigen steps crud"
  on public.steps for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


create table if not exists public.preventive_content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text, -- bv. 'ademhaling', 'hulplijnen', 'tips'
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.preventive_content enable row level security;

create policy "Preventive_content: iedereen lezen"
  on public.preventive_content for select to authenticated
  using (true);

create policy "Preventive_content: admin crud"
  on public.preventive_content for all to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );


insert into public.preventive_content (title, content, category, sort_order) values
  ('Het is oké om niet oké te zijn', 'Iedereen heeft weleens een dip. Praat erover met iemand die je vertrouwt: een vriend, ouder, mentor of vertrouwenspersoon. Je hoeft het niet alleen te doen.', 'tips', 1),
  ('Ademhalingsoefening: 4-7-8', 'Adem 4 tellen in door je neus, houd 7 tellen vast, adem 8 tellen uit door je mond. Herhaal 3–4 keer. Helpt om rustiger te worden.', 'ademhaling', 2),
  ('Structuur en ritme', 'Vaste tijden voor slapen, eten en ontspanning geven houvast. Kleine doelen per dag (één taak afmaken, even bewegen) helpen om niet overweldigd te raken.', 'tips', 3),
  ('Bewegen helpt', 'Een korte wandeling of wat stretchen kan je hoofd letterlijk even leegmaken. Je hoeft niet te sporten; even in beweging zijn is al goed.', 'tips', 4),
  ('Hulplijnen', '113 Zelfmoordpreventie: 113 of 0800-0113. De Luisterlijn: 088-0767000. Jongeren: @ease. School: vraag naar je vertrouwenspersoon of zorgcoördinator.', 'hulplijnen', 5),
  ('Grenzen aangeven', 'Het is goed om ‘‘nee’’ te zeggen als iets te veel is. Geef aan wat je nodig hebt (rust, geen vragen, even alleen) en bespreek het op een moment dat het kan.', 'tips', 6)
;



create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.chat_room_members (
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (room_id, user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text,
  image_url text,
  created_at timestamptz default now()
);

create index if not exists chat_messages_room_created_idx on public.chat_messages(room_id, created_at desc);
alter table public.chat_rooms enable row level security;
alter table public.chat_room_members enable row level security;
alter table public.chat_messages enable row level security;

create policy "Chat_rooms: alle ingelogde gebruikers kunnen rooms zien (join bij eerste gebruik)"
  on public.chat_rooms for select to authenticated
  using (true);

create policy "Chat_room_members: eigen membership"
  on public.chat_room_members for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Chat_room_members: inzage voor leden"
  on public.chat_room_members for select to authenticated
  using (true);

create policy "Chat_messages: leden van de room kunnen lezen"
  on public.chat_messages for select to authenticated
  using (
    exists (select 1 from public.chat_room_members m where m.room_id = room_id and m.user_id = auth.uid())
  );

create policy "Chat_messages: leden kunnen berichten sturen"
  on public.chat_messages for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.chat_room_members m where m.room_id = room_id and m.user_id = auth.uid())
  );

insert into public.chat_rooms (id, name) values
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Algemeen')
on conflict do nothing;


insert into storage.buckets (id, name, public)
values ('avatars','avatars',true), ('post-images','post-images',true), ('chat-images','chat-images',true)
on conflict (id) do nothing;

create policy "avatars_select" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_insert" on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "post_images_select" on storage.objects for select using (bucket_id = 'post-images');
create policy "post_images_insert" on storage.objects for insert with check (bucket_id = 'post-images' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "chat_images_select" on storage.objects for select using (bucket_id = 'chat-images');
create policy "chat_images_insert" on storage.objects for insert with check (bucket_id = 'chat-images' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);


insert into public.profiles (id, display_name, klas, role)
select u.id,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'klas',
  'user'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

