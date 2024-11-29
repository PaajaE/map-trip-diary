-- Enable PostGIS extension
create extension if not exists postgis;

-- Create trips table
create table if not exists trips (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  trip_date date not null,
  gps_reference geometry(Point, 4326),
  gpx_data text
);

-- Create photos table
create table if not exists photos (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references trips not null,
  url text not null,
  is_cover_photo boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tags table
create table if not exists tags (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create trip_tags table
create table if not exists trip_tags (
  trip_id uuid references trips not null,
  tag_id uuid references tags not null,
  primary key (trip_id, tag_id)
);

-- Create function to get user trips with all related data
create or replace function get_user_trips(cur_user_id uuid)
returns table (
  id uuid,
  user_id uuid,
  title text,
  description text,
  created_at timestamptz,
  updated_at timestamptz,
  trip_date date,
  location jsonb,
  photos jsonb,
  tags jsonb
) as $$
begin
  return query
  select 
    t.id,
    t.user_id,
    t.title,
    t.description,
    t.created_at,
    t.updated_at,
    t.trip_date,
    case 
      when t.gps_reference is not null then 
        json_build_object(
          'lat', ST_Y(t.gps_reference::geometry),
          'lng', ST_X(t.gps_reference::geometry)
        )
      else null
    end as location,
    coalesce(
      (
        select json_agg(
          json_build_object(
            'id', p.id,
            'url', p.url,
            'is_cover_photo', p.is_cover_photo,
            'created_at', p.created_at
          )
        )
        from photos p
        where p.trip_id = t.id
      ),
      '[]'::json
    ) as photos,
    coalesce(
      (
        select json_agg(tags.name)
        from trip_tags
        join tags on tags.id = trip_tags.tag_id
        where trip_tags.trip_id = t.id
      ),
      '[]'::json
    ) as tags
  from trips t
  where t.user_id = cur_user_id
  order by t.trip_date desc;
end;
$$ language plpgsql security definer;

-- Enable RLS
alter table trips enable row level security;
alter table photos enable row level security;
alter table tags enable row level security;
alter table trip_tags enable row level security;

-- Create RLS policies
create policy "Users can view their own trips"
  on trips for select
  using (auth.uid() = user_id);

create policy "Users can create their own trips"
  on trips for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own trips"
  on trips for update
  using (auth.uid() = user_id);

create policy "Users can delete their own trips"
  on trips for delete
  using (auth.uid() = user_id);

-- Photos policies
create policy "Users can view photos of their trips"
  on photos for select
  using (
    exists (
      select 1 from trips
      where trips.id = photos.trip_id
      and trips.user_id = auth.uid()
    )
  );

create policy "Users can insert photos for their trips"
  on photos for insert
  with check (
    exists (
      select 1 from trips
      where trips.id = photos.trip_id
      and trips.user_id = auth.uid()
    )
  );

-- Tags policies
create policy "Everyone can view tags"
  on tags for select
  using (true);

create policy "Users can create tags"
  on tags for insert
  with check (true);

-- Trip tags policies
create policy "Users can view trip tags"
  on trip_tags for select
  using (
    exists (
      select 1 from trips
      where trips.id = trip_tags.trip_id
      and trips.user_id = auth.uid()
    )
  );

create policy "Users can create trip tags"
  on trip_tags for insert
  with check (
    exists (
      select 1 from trips
      where trips.id = trip_tags.trip_id
      and trips.user_id = auth.uid()
    )
  );