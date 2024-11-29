-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable RLS
alter table if exists trips disable row level security;
drop table if exists observations;
drop table if exists trips;

-- Create trips table
create table trips (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  trip_date date not null,
  location jsonb not null,
  location_name text,
  gpx_data text
);

-- Enable RLS
alter table trips enable row level security;

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

-- Create observations table
create table observations (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references trips not null,
  type text not null check (type in ('plant', 'animal', 'rock', 'formation')),
  name text not null,
  description text,
  location jsonb not null,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for observations
alter table observations enable row level security;

-- Create RLS policies for observations
create policy "Users can view observations of their trips"
  on observations for select
  using (
    exists (
      select 1 from trips
      where trips.id = observations.trip_id
      and trips.user_id = auth.uid()
    )
  );

create policy "Users can create observations for their trips"
  on observations for insert
  with check (
    exists (
      select 1 from trips
      where trips.id = observations.trip_id
      and trips.user_id = auth.uid()
    )
  );

create policy "Users can update observations of their trips"
  on observations for update
  using (
    exists (
      select 1 from trips
      where trips.id = observations.trip_id
      and trips.user_id = auth.uid()
    )
  );

create policy "Users can delete observations of their trips"
  on observations for delete
  using (
    exists (
      select 1 from trips
      where trips.id = observations.trip_id
      and trips.user_id = auth.uid()
    )
  );