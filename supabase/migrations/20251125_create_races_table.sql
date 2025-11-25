-- Create races table
create table if not exists public.races (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  circuit_name text not null,
  round_number integer not null,
  country text not null,
  date date not null,
  is_sprint boolean default false,
  fp1_time timestamptz,
  fp2_time timestamptz,
  fp3_time timestamptz,
  qualifying_time timestamptz,
  sprint_qualifying_time timestamptz,
  sprint_race_time timestamptz,
  race_time timestamptz,
  circuit_image_url text,
  circuit_length_km numeric,
  turns integer,
  lap_record_time text,
  lap_record_driver text,
  last_winner text,
  status text check (status in ('upcoming', 'completed', 'cancelled')) default 'upcoming',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.races enable row level security;

-- Create policy to allow read access for all users
create policy "Allow public read access" on public.races
  for select using (true);

-- Insert sample data for testing
insert into public.races (
  name, circuit_name, round_number, country, date, is_sprint,
  fp1_time, fp2_time, fp3_time, qualifying_time, race_time,
  circuit_length_km, turns, lap_record_time, lap_record_driver, last_winner, status
) values 
(
  'Bahrain Grand Prix', 'Bahrain International Circuit', 1, 'Bahrain', '2025-03-02', false,
  '2025-02-28 11:30:00+00', '2025-02-28 15:00:00+00', '2025-03-01 12:30:00+00', '2025-03-01 16:00:00+00', '2025-03-02 15:00:00+00',
  5.412, 15, '1:31.447', 'Pedro de la Rosa (2005)', 'Max Verstappen', 'upcoming'
),
(
  'Saudi Arabian Grand Prix', 'Jeddah Corniche Circuit', 2, 'Saudi Arabia', '2025-03-09', false,
  '2025-03-07 13:30:00+00', '2025-03-07 17:00:00+00', '2025-03-08 13:30:00+00', '2025-03-08 17:00:00+00', '2025-03-09 17:00:00+00',
  6.174, 27, '1:30.734', 'Lewis Hamilton (2021)', 'Max Verstappen', 'upcoming'
);
