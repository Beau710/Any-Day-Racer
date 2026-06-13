# Any Day Racer

A monthly mountain bike segment racing app built on Strava data.

## Concept

A new trail segment is picked every month. Riders connect via Strava, ride the segment as many times as they like during the month, and their fastest time appears on the leaderboard. Anyone can win.

## Tagline

"Race the trails your way any day"

## Live Site

https://timely-shortbread-58de89.netlify.app

## Tech Stack

- HTML, CSS, JavaScript (vanilla, no frameworks)
- Hosted on Netlify (Pro plan)
- Strava OAuth for authentication
- Netlify serverless functions for Strava API calls
- Supabase (PostgreSQL) for leaderboard data storage
- localStorage for user session management (temporary until full auth is built)

## File Structure

- `index.html` — homepage
- `leaderboard.html` — monthly segment leaderboard
- `profile.html` — rider profile page
- `signup.html` — Strava connect and profile creation
- `login.html` — returning user login page
- `login-callback.html` — handles Strava OAuth return for login, restores session from Supabase
- `index.css` — shared styles across all pages
- `leaderboard.css` — leaderboard specific styles
- `profile.css` — profile page specific styles
- `signup.css` — signup and login page styles
- `index.js` — homepage scripts (countdown timer)
- `leaderboard.js` — triggers a server-side effort sync, builds leaderboard from Supabase
- `profile.js` — loads profile from localStorage, saves to Supabase on signup
- `signup.js` — handles Strava OAuth redirect and saves temp profile
- `login.js` — triggers Strava OAuth for returning user login
- `main.js` — shared scripts across all pages (login/logout state, nav management)
- `netlify/functions/strava-auth.js` — exchanges Strava auth code for access token (signup flow)
- `netlify/functions/strava-login.js` — exchanges Strava auth code for access token (login flow)
- `netlify/functions/save-effort.js` — verifies the rider via their Strava token, fetches their efforts from Strava server-side, and saves their best time to Supabase (only if faster than their existing entry — times are never accepted from the browser)
- `netlify/functions/get-leaderboard.js` — fetches leaderboard data from Supabase
- `netlify/functions/save-profile.js` — saves rider profile to Supabase on signup
- `netlify/functions/get-profile.js` — fetches rider profile from Supabase by athlete_id on login

## Supabase Tables

### leaderboard

- `id` — auto generated
- `athlete_id` — Strava athlete ID
- `athlete_name` — rider's chosen display name
- `segment_id` — Strava segment ID
- `elapsed_time` — time in seconds
- `start_date` — date of the effort
- RLS enabled with public read and insert policies
- One row per rider per segment, enforced by a unique constraint — create with:
```sql
-- one-time cleanup of any historical duplicates, keeping the fastest time
DELETE FROM leaderboard a USING leaderboard b
WHERE a.athlete_id = b.athlete_id AND a.segment_id = b.segment_id
  AND (b.elapsed_time < a.elapsed_time
       OR (b.elapsed_time = a.elapsed_time AND b.ctid < a.ctid));

ALTER TABLE leaderboard
  ADD CONSTRAINT leaderboard_athlete_segment_unique UNIQUE (athlete_id, segment_id);
```

### profiles

- `athlete_id` — Strava athlete ID (primary key)
- `name` — rider's chosen display name
- `homepark` — rider's home bike park
- `bike` — rider's bike
- `trail` — rider's favourite trail
- Required for login flow — create with:
```sql
CREATE TABLE profiles (
  athlete_id TEXT PRIMARY KEY,
  name TEXT,
  homepark TEXT,
  bike TEXT,
  trail TEXT
);
```

## Current Segment

Native - Miro Downhill section (Segment ID: 3818489)

## Design

- Dark black aesthetic
- Turquoise accent colour
- Orange for all Strava branded buttons (#fc4c02)
- Fonts: Bebas Neue (display), Barlow (body)
- Consistent nav across all pages with login/logout state management

## Prize Structure

- 🥇 The Racer — fastest time wins
- 🗓️ The Any Day Racer Award — rider closest to the monthly average time wins. Inclusive, on brand, anyone can win.

## Sponsorship Model

- Local bike shops, trail clubs and businesses sponsor monthly segments
- Naming rights e.g. "Any Day Race #3 — Powered by Trek Bikes"
- Advertised on social media
- Monthly POV trail video released when segment goes live, hosted on YouTube and embedded in the app

## Trail Strategy

- Not limited to big named parks
- Partner with local trail clubs to promote new trails and networks
- Offer free POV video content and social media exposure in exchange for support

## What's Working

- Strava OAuth signup flow with profile creation (display name, home park, bike, favourite trail)
- Returning user login via Strava — profile fetched from Supabase and session restored
- Logout clears session and returns to homepage
- Profile persisted to Supabase `profiles` table on signup
- Real segment times pulling from Strava API
- Best effort saved to Supabase
- Leaderboard reading from Supabase and displaying fastest to slowest
- Nav state consistent across all pages — shows Sign Up + Log In when logged out, My Profile + Log Out when logged in

## In Progress

- Mobile hamburger nav

## Next Steps (Priority Order)

1. Set up `races` table in Supabase for monthly race management
3. Add date filtering to segment efforts — only count efforts within race dates
4. Multi segment support for enduro format
5. Stage leaderboards and combined overall leaderboard
6. Race archive page — past results
7. The Any Day Racer Award — closest to average time calculation
8. Mobile nav hamburger menu
9. Rider profile photos from Strava
10. Full Supabase auth to replace localStorage

## Planned Test Event

A multi stage enduro test with ~5 riders across 4 segments in the next few months. This will be the first real world test of the multi-user and multi-segment features.

## To Start A New Claude Chat

1. Paste this README
2. Say "I'm continuing to build Any Day Racer"
3. Paste any relevant code files for the feature you're working on
4. Claude will be up to speed instantly
