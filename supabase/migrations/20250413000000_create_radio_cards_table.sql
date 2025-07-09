-- Create radio_cards table
CREATE TABLE "public"."radio_cards" (
    "id" integer PRIMARY KEY,
    "driver_name" text NOT NULL,
    "team_color" text NOT NULL,
    "team_icon" text NOT NULL,
    "driver_response" text NOT NULL,
    "team_response" text NOT NULL,
    "response_order" text NOT NULL CHECK (response_order IN ('T', 'D')),
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE "public"."radio_cards" ENABLE ROW LEVEL SECURITY;

-- Create policies for reading radio cards (public access)
CREATE POLICY "Anyone can read radio cards"
  ON "public"."radio_cards"
  FOR SELECT
  USING (true);

-- Insert existing radio card data with response order
INSERT INTO "public"."radio_cards" (id, driver_name, team_color, team_icon, driver_response, team_response, response_order) VALUES
(1, 'Nico Hulkenberg', '#00b722', 'stake', '"I HAVE A PROBLEM WITH THE CAR!"', '"COPY, WE ARE CHECKING. BOX, BOX."', 'D'),
(2, 'Gabriel Bortoleto', '#00b722', 'stake', '"THE TYRES ARE GONE, MAN!"', '"OKAY, PUSH NOW. THREE LAPS TO GO."', 'D'),
(3, 'Charles Leclerc', '#E8002D', 'ferrari', '"HE JUST TURNED IN ON ME!"', '"WE SAW THAT. WE ARE REPORTING IT."', 'D'),
(4, 'Lewis Hamilton', '#E8002D', 'ferrari', '"I AM FASTER THAN HIM. LET ME PASS."', '"LET HIM GO. DON''T FIGHT HIM."', 'D'),
(5, 'Lando Norris', '#FF8700', 'mclaren', '"GREAT JOB EVERYONE! WHAT A RACE!"', '"P1, MATE! FANTASTIC DRIVE!"', 'D'),
(6, 'Oscar Piastri', '#FF8700', 'mclaren', '"IS THE RAIN COMING?"', '"WE EXPECT LIGHT DRIZZLE IN 5 MINUTES."', 'D'),
(7, 'Carlos Sainz', '#6e90d8', 'williams', '"BLUE FLAGS! BLUE FLAGS!"', '"HE HAS BEEN SHOWN THE FLAGS."', 'D'),
(8, 'Alexander Albon', '#6e90d8', 'williams', '"THE CAR FEELS GOOD. REALLY GOOD."', '"COPY THAT. KEEP THIS PACE."', 'D'),
(9, 'Fernando Alonso', '#2cc2af', 'astonmartin', '"I''M STUCK BEHIND HIM."', '"USE YOUR OVERTAKE BUTTON NOW."', 'D'),
(10, 'Lance Stroll', '#2cc2af', 'astonmartin', '"Pit confirm button is the OK button,Brad"', '"You are pressing the Pit confirm button,Lance."', 'T'),
(11, 'Pierre Gasly', '#ca3980', 'alpine', '"I THINK I HAVE A PUNCTURE."', '"BOX THIS LAP, BOX, BOX."', 'D'),
(12, 'Franco Colapinto', '#ca3980', 'alpine', '"LEAVE ME ALONE, I KNOW WHAT I''M DOING."', '"...COPY."', 'D'),
(13, 'Yuki Tsunoda', '#3272c5', 'redbull', '"SAFETY CAR, SAFETY CAR. STAY OUT."', '"STAY OUT, CONFIRMED."', 'D'),
(14, 'Max Verstappen', '#3272c5', 'redbull', '"THAT WAS A BIT DANGEROUS, NO?"', '"WE AGREE. RACE CONTROL HAS IT NOTED."', 'D'),
(15, 'Esteban Ocon', '#b6b6b6', 'haas', '"HOW ARE WE ON FUEL?"', '"FUEL IS GOOD. YOU CAN PUSH."', 'D'),
(16, 'Oliver Bearman', '#b6b6b6', 'haas', '"I''M LOSING POWER!"', '"TRY MODE 8. TRY MODE 8."', 'D'),
(17, 'George Russell', '#1ee6fd', 'mercedes', '"PLAN B? ARE WE ON PLAN B?"', '"AFFIRMATIVE. WE ARE ON PLAN B."', 'D'),
(18, 'Kimi Antolnelli', '#1ee6fd', 'mercedes', '"THANKS FOR THE HELP, TEAM."', '"NO PROBLEM. GREAT DRIVE."', 'D'),
(19, 'Isack Hadjar', '#052b8a', 'racingbulls', '"THE BALANCE IS AWFUL."', '"OKAY, WE''LL ADJUST AT THE NEXT STOP."', 'D'),
(20, 'Liam Lawson', '#052b8a', 'racingbulls', '"YES! GET IN THERE! HAHA!"', '"BRILLIANT, MATE! SIMPLY BRILLIANT!"', 'D');

-- Create function to get random radio cards
CREATE OR REPLACE FUNCTION get_random_radio_cards(card_count integer DEFAULT 2)
RETURNS SETOF radio_cards AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM radio_cards
  ORDER BY RANDOM()
  LIMIT card_count;
END;
$$ LANGUAGE plpgsql; 