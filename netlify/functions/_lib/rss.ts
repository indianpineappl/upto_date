import Parser from 'rss-parser';

export type RawItem = {
  id: string;
  source_type: 'news' | 'social';
  source_name: string;
  title: string;
  snippet: string | null;
  url: string | null;
  published_at: string | null;
  engagement_signals?: Record<string, any> | null;
};

const RSS_FEEDS = [
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Automobiles.xml', source: 'NYTimes Automobiles' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Baseball.xml', source: 'NYTimes Baseball' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Books/Review.xml', source: 'NYTimes Books Review' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', source: 'NYTimes Business' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Climate.xml', source: 'NYTimes Climate' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/CollegeBasketball.xml', source: 'NYTimes College Basketball' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/CollegeFootball.xml', source: 'NYTimes College Football' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Dance.xml', source: 'NYTimes Dance' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Dealbook.xml', source: 'NYTimes Dealbook' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/DiningandWine.xml', source: 'NYTimes Dining and Wine' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml', source: 'NYTimes Economy' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Education.xml', source: 'NYTimes Education' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/EnergyEnvironment.xml', source: 'NYTimes Energy Environment' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Europe.xml', source: 'NYTimes Europe' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/FashionandStyle.xml', source: 'NYTimes Fashion and Style' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Golf.xml', source: 'NYTimes Golf' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml', source: 'NYTimes Health' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Hockey.xml', source: 'NYTimes Hockey' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', source: 'NYTimes Home Page' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Jobs.xml', source: 'NYTimes Jobs' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Lens.xml', source: 'NYTimes Lens' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml', source: 'NYTimes Middle East' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/MostEmailed.xml', source: 'NYTimes Most Emailed' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', source: 'NYTimes Politics' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/RealEstate.xml', source: 'NYTimes Real Estate' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/SmallBusiness.xml', source: 'NYTimes Small Business' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Soccer.xml', source: 'NYTimes Soccer' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Tennis.xml', source: 'NYTimes Tennis' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', source: 'NYTimes Technology' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/YourMoney.xml', source: 'NYTimes Your Money' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NYTimes World' }
];

export async function fetchRssRawItems(maxItems: number = 200): Promise<RawItem[]> {
  const parser = new Parser();
  const items: RawItem[] = [];

  for (const feed of RSS_FEEDS) {
    if (items.length >= maxItems) break;

    try {
      const rss = await parser.parseURL(feed.url);
      for (const it of rss.items) {
        if (items.length >= maxItems) break;

        const title = (it.title || '').trim();
        if (!title) continue;

        const link = (it.link || '').trim();
        const pubDate = it.pubDate ? new Date(it.pubDate).toISOString() : null;
        const snippet = (it.contentSnippet || (it as any).summary || '').trim();

        items.push({
          id: `rss:${feed.source}:${Buffer.from(title).toString('base64').slice(0, 12)}`,
          source_type: 'news',
          source_name: feed.source,
          title,
          snippet: snippet || null,
          url: link || null,
          published_at: pubDate
        });
      }
    } catch (_e) {
      continue;
    }
  }

  return items;
}
