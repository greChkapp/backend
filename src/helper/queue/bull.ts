import bull from 'bull';
import Scraper from './shops/Scraper';
import ScraperProduct from './shops/ScraperProduct';
import ScraperProductsLink from './shops/ScraperProductsLink';
import {   settings,
  limiter,
  redis,
  defaultJobOptions,
  ashanData,
  novusData,
  megaMarketData,
  options,
} from './bullSettings';

export const shopQueue = new bull('shop', { redis, defaultJobOptions, settings, limiter });
export const productQueue = new bull('product', { redis, defaultJobOptions, settings, limiter });

shopQueue.process('ashan', 1, async (job) => {
  const categoriesLength = await createProcess(job.data);

  return categoriesLength;
});

shopQueue.process('novus', 1, async (job) => {
  const categoriesLength = await createProcess(job.data);

  return categoriesLength;
});

shopQueue.process('megaMarket', 1, async (job) => {
  const categoriesLength = await createProcess(job.data);

  return categoriesLength;
});

productQueue.process('products', 4, async (job) => {
  const { products: productsLink, shop, url } = job.data;
  // console.log('product process started');
  const startDate = new Date().getTime();
  const scrapedProduct = new ScraperProduct(url, shop, productsLink);
  const info = await scrapedProduct.parse_();
  const endDate = new Date().getTime();

  return {
    ...info,
    shop,
    time: (endDate - startDate) / 1000, // time of handling one process
  };
});

shopQueue.on('completed', (job, result) => {
  console.log(`Job shopQueue completed with count of categories: ${JSON.stringify(result)}`);
  job.remove();
});

shopQueue.on('failed', (job) => {
  // job has failed
  console.log('Job shopQueue failed');
});

productQueue.on('completed', (job, result) => {
  console.log('Job completed:');
  console.table(result);

  job.remove();
});

shopQueue.add('ashan', ashanData, options);
// shopQueue.add('novus', novusData, options);
// shopQueue.add('megaMarket', megaMarketData, options);

const createProcess = async ({ url, local, shop }) => {
  console.log(`process\'ve ${shop} started`);

  const categoryScraped = new Scraper(url, local);
  const categoriesLinks = await categoryScraped.scrape_();
  let count = 0;
  for (const category of categoriesLinks) {
    count += 1;
    if (count > 103) {
      console.log('category', category);
      const scrapedProducts = new ScraperProductsLink(url, category);
      const products = await scrapedProducts.scrapeProducts();
        // console.log(products.length);
      productQueue.add('products', { shop, url, products });
    }
  }

  return categoriesLinks.length;
};
