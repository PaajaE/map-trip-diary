-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists postgis;

-- Create trips table with PostGIS support
create table if not exists trips (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  trip_date date not null,
  gps_reference geometry(Point, 4326),
  trip_path geometry(LineString, 4326),
  gpx_data text,
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) stored
);

-- Create photos table with better constraints
create table if not exists photos (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references trips on delete cascade not null,
  name text not null,
  url text,
  is_cover_photo boolean default false not null,
  created_at timestamptz default now() not null,
  location geometry(Point, 4326),
  constraint one_cover_photo_per_trip unique (trip_id, is_cover_photo) 
    where (is_cover_photo = true)
);

-- Create tags table with unique names
create table if not exists tags (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  created_at timestamptz default now() not null
);

-- Create trip_tags junction table
create table if not exists trip_tags (
  trip_id uuid references trips on delete cascade not null,
  tag_id uuid references tags on delete cascade not null,
  primary key (trip_id, tag_id)
);

-- Create indexes for better performance
create index trips_user_id_idx on trips(user_id);
create index trips_trip_date_idx on trips(trip_date);
create index trips_search_idx on trips using gin(search_vector);
create index trips_gps_reference_idx on trips using gist(gps_reference);
create index trips_trip_path_idx on trips using gist(trip_path);
create index photos_trip_id_idx on photos(trip_id);
create index photos_location_idx on photos using gist(location);
create index tags_name_idx on tags(name);

-- Create function to update trip timestamps
create or replace function update_trip_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updating trip timestamps
create trigger update_trip_timestamp
  before update on trips
  for each row
  execute function update_trip_timestamp();

-- Create function to get user trips with all related data
create or replace function get_user_trips(cur_user_id uuid)
returns table (
  trip_id uuid,
  title text,
  description text,
  trip_date date,
  lat double precision,
  long double precision,
  trip_path jsonb,
  photos jsonb,
  tags text[]
) language plpgsql security definer as $$
begin
  return query
  with trip_photos as (
    select 
      p.trip_id,
      jsonb_agg(
        jsonb_build_object(
          'name', p.name,
          'url', p.url,
          'is_cover_photo', p.is_cover_photo
        ) order by p.is_cover_photo desc, p.created_at desc
      ) as photos
    from photos p
    group by p.trip_id
  ),
  trip_tags as (
    select 
      tt.trip_id,
      array_agg(t.name order by t.name) as tags
    from trip_tags tt
    join tags t on t.id = tt.tag_id
    group by tt.trip_id
  )
  select 
    t.id as trip_id,
    t.title,
    t.description,
    t.trip_date,
    st_y(t.gps_reference::geometry) as lat,
    st_x(t.gps_reference::geometry) as long,
    case 
      when t.trip_path is not null then
        jsonb_build_object(
          'type', 'LineString',
          'coordinates', (
            select jsonb_agg(point)
            from (
              select json_build_array(
                st_x((dp).geom), 
                st_y((dp).geom)
              ) as point
              from (
                select st_dumppoints(t.trip_path) as dp
              ) points
            ) coords
          )
        )
      else null
    end as trip_path,
    coalesce(tp.photos, '[]'::jsonb) as photos,
    coalesce(tt.tags, array[]::text[]) as tags
  from trips t
  left join trip_photos tp on t.id = tp.trip_id
  left join trip_tags tt on t.id = tt.trip_id
  where t.user_id = cur_user_id
  order by t.trip_date desc;
end;
$$;

-- Enable RLS
alter table trips enable row level security;
alter table photos enable row level security;
alter table tags enable row level security;
alter table trip_tags enable row level security;

-- Create RLS policies
create policy "Users can view their own trips"
  on trips for select
  using (auth.uid() = user_id);

create policy "Users can insert their own trips"
  on trips for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own trips"
  on trips for update
  using (auth.uid() = user_id);

create policy "Users can delete their own trips"
  on trips for delete
  using (auth.uid() = user_id);

create policy "Users can view photos of their trips"
  on photos for select
  using (exists (
    select 1 from trips
    where trips.id = photos.trip_id
    and trips.user_id = auth.uid()
  ));

create policy "Users can insert photos for their trips"
  on photos for insert
  with check (exists (
    select 1 from trips
    where trips.id = photos.trip_id
    and trips.user_id = auth.uid()
  ));

create policy "Users can update photos of their trips"
  on photos for update
  using (exists (
    select 1 from trips
    where trips.id = photos.trip_id
    and trips.user_id = auth.uid()
  ));

create policy "Users can delete photos of their trips"
  on photos for delete
  using (exists (
    select 1 from trips
    where trips.id = photos.trip_id
    and trips.user_id = auth.uid()
  ));

create policy "Everyone can view tags"
  on tags for select
  using (true);

create policy "Users can insert tags"
  on tags for insert
  with check (true);

create policy "Users can view trip tags"
  on trip_tags for select
  using (exists (
    select 1 from trips
    where trips.id = trip_tags.trip_id
    and trips.user_id = auth.uid()
  ));

create policy "Users can manage trip tags"
  on trip_tags for all
  using (exists (
    select 1 from trips
    where trips.id = trip_tags.trip_id
    and trips.user_id = auth.uid()
  ));