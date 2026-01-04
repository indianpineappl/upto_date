import Parser from 'rss-parser';

const parser = new Parser();

async function testRSS() {
  try {
    // Test with a simple RSS feed
    const feed = await parser.parseURL('https://feeds.bbci.co.uk/news/rss.xml');
    console.log(`Fetched ${feed.items.length} items from BBC RSS feed`);
    
    // Display first 3 items
    for (let i = 0; i < Math.min(3, feed.items.length); i++) {
      const item = feed.items[i];
      console.log(`\nItem ${i + 1}:`);
      console.log(`Title: ${item.title}`);
      console.log(`Published: ${item.pubDate}`);
      console.log(`Link: ${item.link}`);
      console.log(`Summary: ${item.contentSnippet || item.summary}`);
    }
  } catch (error) {
    console.error('Error testing RSS feed:', error);
  }
}

testRSS();
