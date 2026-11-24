# Screen usage guide

## Home
Your dashboard. Interest pills reflect your Profile selections. Quick actions open Coach, Graph and Saved. Tap **All news / All movies / Discover more** to jump to the full feed.

## News
- Filter with the interest pills at the top (only shown when more than one interest is selected).
- Tap a story title area to open the source in your browser.
- Tap the bookmark to save/remove it for offline reading.
- Pull down to refresh. A banner appears when a partial source returned results.

## Movies
- Filter by interest, tap the bookmark to keep a movie.
- Posters come from TMDB when a key is configured; otherwise a monogram placeholder is used.
- Pull down to refresh.

## Discover
- Live Hacker News and Reddit stories, ranked by score with a recency bonus.
- Filter by source: All / Hacker News / Reddit / Curated.
- Bookmark a find to keep it in Saved.

## Profile
- Toggle interest chips. Changes propagate to News, Movies and the Knowledge Graph immediately.
- **Saved for later** opens your offline library.
- **Data sources** shows whether each API key is configured.

## Knowledge Graph
- Drag the canvas to pan; use + / − / reset to zoom.
- Tap a node for its description, saved-item count and connected topics.
- Nodes are your selected interests; connections come from the curated relationship map between interest topics (not content samples).

## Mindset Coach
- Pick a thinking category, write a reflection and save it.
- Reflections are stored locally and scheduled for review after one day.
- **Again** resets the interval; **Got it** doubles it (up to 60 days).
- Delete an entry with the trash button.

## Learning Paths
Open from Home (**Paths**) or Profile (**Learning Paths**). Each interest with at least two saved items becomes an ordered path. Tick steps off as you go; progress is stored locally and survives a restart. **Reset all progress** clears every path. If you have not saved anything yet, the screen explains how to get started — no sample paths are generated.

## Time Capsule
Open from Profile (**Time Capsule**) or the Home card. It previews a dated snapshot of your interests, saved counts and top topics. **Copy / share capsule** copies the text to the clipboard, or opens the native share sheet on supported web browsers. Reflection text is excluded unless you turn on *Include reflection text*.

## Saved for later
- Switch between Articles, Movies and Finds.
- Open a link or remove an item. Everything here is stored in SQLite on the device.

## Settings
Shows whether NewsAPI, FreeNewsApi and TMDB keys are available to the build, the app version and platform, links to Credits and Privacy, and a **Clear local data** action with confirmation. Interests are kept when data is cleared.

## Credits
Lists and links the services used for data: TMDB, NewsAPI, FreeNewsApi, Hacker News, Reddit and Expo. Includes the TMDB attribution required by its API terms.

## Privacy
A plain-language summary of what is stored locally, what is sent to third-party APIs, permissions, and your controls. If `EXPO_PUBLIC_PRIVACY_URL` is configured, it also links to the hosted policy.

## Onboarding
Shown on first launch for new installs. Pick at least two interests, then tap **Start my loop**. You can change them later in Profile. Existing installs skip this screen.

## Article reader
Open **Offline reader** from any News card. Saved articles show their title, source, date and summary without a network connection; **Read the full story online** opens the publisher. Unsaved articles show a short explanation.

## Movie detail
Open **Movie details** from any Movies card. Shows poster, rating, synopsis and a **Watch trailer** link. Live details are loaded from TMDB when configured; saved movies are shown from local storage.

## Search
Search across your saved articles, movies and discoveries by title or source. Results open their detail screen where supported.

## Feedback
Choose a category, write a message and save it locally, or open a GitHub issue template. Previous feedback is listed on the same screen.

## Community
Shows time capsules you saved locally. Public sharing is not enabled in this release.

## Diagnostics
Shows which API keys are available to the build, feed item counts, last fetch times and error messages. Used to verify installed preview builds.

## Export data
Copies all locally stored data (interests, profile, saved items, prompts, reflections, progress, capsules and feedback) to the clipboard as JSON. API keys are not included.

## Accessibility
Shows the current system colour scheme and the accessibility features the app supports, plus guidance for reporting issues.

## Terms
Plain-language terms of use; the canonical copy lives at `docs/TERMS.md`.
