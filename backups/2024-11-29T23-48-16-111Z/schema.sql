-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists postgis;
create extension if not exists pg_trgm; -- For better text search
create extension if not exists unaccent; -- For better search with accents

-- Create custom text search configuration
create text search configuration cs ( copy = simple );
alter text search configuration cs
  alter mapping for word, asciiword, asciihword, hword, hword_asciipart, hword_part
  with unaccent, simple;

-- Create trips table with PostGIS support and optimizations
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
  search_vector_en tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) stored,
  search_vector_cs tsvector generated always as (
    setweight(to_tsvector('cs', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('cs', coalesce(description, '')), 'B')
  ) stored,
  title_trigram text generated always as (lower(unaccent(title))) stored -- For fuzzy search
);

-- Create photos table with better constraints and metadata
create table if not exists photos (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references trips on delete cascade not null,
  name text not null,
  url text,
  is_cover_photo boolean default false not null,
  created_at timestamptz default now() not null,
  location geometry(Point, 4326),
  metadata jsonb default '{}'::jsonb not null, -- Store EXIF and other metadata
  constraint one_cover_photo_per_trip unique (trip_id, is_cover_photo) 
    where (is_cover_photo = true)
);

-- Create tags table with unique names and usage count
create table if not exists tags (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  created_at timestamptz default now() not null,
  usage_count int default 0 not null -- Track popularity
);

-- Create trip_tags junction table with timestamp
create table if not exists trip_tags (
  trip_id uuid references trips on delete cascade not null,
  tag_id uuid references tags on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (trip_id, tag_id)
);

-- Create indexes for better performance
create index trips_user_id_idx on trips(user_id);
create index trips_trip_date_idx on trips(trip_date desc);
create index trips_search_en_idx on trips using gin(search_vector_en);
create index trips_search_cs_idx on trips using gin(search_vector_cs);
create index trips_title_trgm_idx on trips using gin(title_trigram gin_trgm_ops);
create index trips_gps_reference_idx on trips using gist(gps_reference);
create index trips_trip_path_idx on trips using gist(trip_path);
create index photos_trip_id_idx on photos(trip_id);
create index photos_location_idx on photos using gist(location);
create index photos_cover_idx on photos(trip_id) where is_cover_photo = true;
create index tags_name_idx on tags(name);
create index tags_usage_idx on tags(usage_count desc);
create index trip_tags_tag_id_idx on trip_tags(tag_id);

-- Create function to update trip timestamps
create or replace function update_trip_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create function to update tag usage count
create or replace function update_tag_usage_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update tags set usage_count = usage_count + 1 where id = NEW.tag_id;
  elsif TG_OP = 'DELETE' then
    update tags set usage_count = usage_count - 1 where id = OLD.tag_id;
  end if;
  return null;
end;
$$ language plpgsql;

-- Create triggers
create trigger update_trip_timestamp
  before update on trips
  for each row
  execute function update_trip_timestamp();

create trigger update_tag_usage_count
  after insert or delete on trip_tags
  for each row
  execute function update_tag_usage_count();

-- Create optimized function to get user trips
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
          'id', p.id,
          'name', p.name,
          'url', p.url,
          'is_cover_photo', p.is_cover_photo,
          'created_at', p.created_at,
          'location', case 
            when p.location is not null then
              json_build_object(
                'lat', st_y(p.location),
                'lng', st_x(p.location)
              )
            else null
          end,
          'metadata', p.metadata
        ) order by p.is_cover_photo desc, p.created_at desc
      ) filter (where p.name is not null) as photos
    from photos p
    where exists (
      select 1 from trips t
      where t.id = p.trip_id
      and t.user_id = cur_user_id
    )
    group by p.trip_id
  ),
  trip_tags as (
    select 
      tt.trip_id,
      array_agg(t.name order by t.name) filter (where t.name != '') as tags
    from trip_tags tt
    join tags t on t.id = tt.tag_id
    where exists (
      select 1 from trips t
      where t.id = tt.trip_id
      and t.user_id = cur_user_id
    )
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
            select jsonb_agg(point order by ordinality)
            from (
              select json_build_array(
                st_x((dp).geom), 
                st_y((dp).geom)
              ) as point,
              ordinality
              from (
                select st_dumppoints(t.trip_path) as dp
              ) points
              with ordinality
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
  order by t.trip_date desc nulls last, t.created_at desc;
end;
$$;

-- Create function to search trips
create or replace function search_trips(
  cur_user_id uuid,
  search_query text,
  lang text default 'en'
)
returns table (
  trip_id uuid,
  title text,
  description text,
  trip_date date,
  lat double precision,
  long double precision,
  trip_path jsonb,
  photos jsonb,
  tags text[],
  rank float4
) language plpgsql security definer as $$
declare
  query_vector tsvector;
  search_config text;
begin
  -- Set search configuration based on language
  search_config := case when lang = 'cs' then 'cs' else 'english' end;
  
  -- Convert query to search vector
  query_vector := to_tsvector(search_config, search_query);

  return query
  with search_results as (
    select 
      t.*,
      case when lang = 'cs' then
        ts_rank(t.search_vector_cs, query_vector)
      else
        ts_rank(t.search_vector_en, query_vector)
      end as search_rank,
      similarity(t.title_trigram, lower(unaccent(search_query))) as title_similarity
    from trips t
    where t.user_id = cur_user_id
      and (
        case when lang = 'cs' then
          t.search_vector_cs @@ query_vector
        else
          t.search_vector_en @@ query_vector
        end
        or
        similarity(t.title_trigram, lower(unaccent(search_query))) > 0.3
      )
  )
  select 
    r.id as trip_id,
    r.title,
    r.description,
    r.trip_date,
    st_y(r.gps_reference::geometry) as lat,
    st_x(r.gps_reference::geometry) as long,
    case 
      when r.trip_path is not null then
        jsonb_build_object(
          'type', 'LineString',
          'coordinates', (
            select jsonb_agg(point order by ordinality)
            from (
              select json_build_array(
                st_x((dp).geom), 
                st_y((dp).geom)
              ) as point,
              ordinality
              from (
                select st_dumppoints(r.trip_path) as dp
              ) points
              with ordinality
            ) coords
          )
        )
      else null
    end as trip_path,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'url', p.url,
            'is_cover_photo', p.is_cover_photo,
            'created_at', p.created_at
          ) order by p.is_cover_photo desc, p.created_at desc
        ) filter (where p.name is not null)
        from photos p
        where p.trip_id = r.id
      ),
      '[]'::jsonb
    ) as photos,
    coalesce(
      (
        select array_agg(t.name order by t.name)
        from trip_tags tt
        join tags t on t.id = tt.tag_id
        where tt.trip_id = r.id
          and t.name != ''
      ),
      array[]::text[]
    ) as tags,
    greatest(r.search_rank, r.title_similarity) as rank
  from search_results r
  order by rank desc, trip_date desc;
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

-- Create materialized view for popular tags
create materialized view popular_tags as
select t.id, t.name, t.usage_count
from tags t
where t.usage_count > 0
  and t.name != ''
order by t.usage_count desc, t.name;

-- Create function to refresh popular tags
create or replace function refresh_popular_tags()
returns trigger as $$
begin
  refresh materialized view concurrently popular_tags;
  return null;
end;
$$ language plpgsql;

-- Create trigger to refresh popular tags
create trigger refresh_popular_tags_trigger
  after insert or update or delete on trip_tags
  for each statement
  execute function refresh_popular_tags();