# Privacy Policy — InterestLoop

**Effective date:** 24 November 2026
**Owner:** PraiseTechzw (praisetechzw@gmail.com)

InterestLoop is a mobile app that helps you collect news, movie picks and discoveries around your interests. This policy explains what data the app handles.

## Data stored on your device

The app stores the following in a local SQLite database on your device:

- your selected interest topics,
- articles, movies and discovery items you save,
- mindset prompts you create and your written reflections,
- learning-path progress.

There is no user account, no cloud sync and no analytics or advertising SDK in this release.

## Data sent to third parties

When you open a feed, the app makes requests to:

- **NewsAPI.org** and **FreeNewsApi.io** for news headlines,
- **TheMovieDB (TMDB)** for movie recommendations and artwork,
- **Hacker News** and **Reddit** public JSON endpoints for discovery items.

These requests contain standard network information (IP address, user agent) and the interest keywords used to query the feed. Your saved items, prompts and reflections are **never** sent to these providers.

When you tap a story, discussion, poster or trailer, the app opens the destination website in your browser. Those sites have their own privacy policies.

## Permissions

The app uses the internet permission to fetch feeds. It does not request contacts, location, camera, microphone or notification permissions in this release.

## Your controls

- **Settings → Clear local data** removes saved content, prompts, reflections and learning progress from the device. Selected interests are kept.
- Individual items can be removed from the **Saved** screen.
- You can stop using any live source by removing its API key; the app will show an empty state instead of fetching.

## Children

InterestLoop is not directed at children under 13. We do not knowingly collect personal information from them.

## Changes

Updates to this policy will be published in the repository and in a new app release.

## Contact

Questions about privacy can be sent to praisetechzw@gmail.com or raised privately via GitHub Security Advisories.
