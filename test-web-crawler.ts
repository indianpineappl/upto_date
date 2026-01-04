import WebCrawler from './src/services/webCrawler';

async function testWebCrawler() {
  console.log('Testing web crawler...');
  
  try {
    const crawler = WebCrawler;
    const articles = await crawler.crawlNewsSites(5);
    
    console.log(`Successfully crawled ${articles.length} articles`);
    
    for (const article of articles) {
      console.log(`\nTitle: ${article.title}`);
      console.log(`Source: ${article.source}`);
      console.log(`URL: ${article.url}`);
      console.log(`Summary: ${article.summary.substring(0, 100)}...`);
    }
  } catch (error) {
    console.error('Error testing web crawler:', (error as Error).message);
  }
}

testWebCrawler();
