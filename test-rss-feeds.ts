import Parser from 'rss-parser';

const parser = new Parser();

// Define RSS feed sources
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
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NYTimes World' },
];

async function testRSSFeeds() {
  console.log('Testing RSS feeds...');
  
  for (const feed of RSS_FEEDS) {
    try {
      console.log(`\nFetching from ${feed.source} (${feed.url})`);
      const rss = await parser.parseURL(feed.url);
      console.log(`✓ Successfully fetched ${rss.items.length} items`);
      
      // Show first item as example
      if (rss.items.length > 0) {
        const firstItem = rss.items[0];
        console.log(`  First item: ${firstItem.title}`);
        console.log(`  Published: ${firstItem.pubDate}`);
      }
    } catch (error) {
      console.log(`✗ Error fetching from ${feed.source}:`, (error as Error).message);
    }
  }
}

testRSSFeeds();
