const defaultJobOptions = {
  removeOnComplete: true,
  removeOnFail: false,
};

const redis = {
  host: 'redis-14750.c52.us-east-1-4.ec2.cloud.redislabs.com',
  port: 14750,
  password: 'RTGd18n3Jyjgd93KUdVAtCSAj6R05tID',
  maxRetriesPerRequest: null,
  connectTimeout: 180000,
};

const limiter = {
  max: 10000,
  duration: 1000,
  bounceBack: false,
};

const settings = {
  lockDuration: 600000, // Key expiration time for job locks.
  stalledInterval: 5000, // How often check for stalled jobs (use 0 for never checking).
  maxStalledCount: 2, // Max amount of times a stalled job will be re-processed.
  guardInterval: 5000, // Poll interval for delayed jobs and added jobs.
  retryProcessDelay: 30000, // delay before processing next job in case of internal error.
  drainDelay: 5, // A timeout for when the queue is in drained state (empty waiting for jobs).
};

const options = {
  repeat: { cron: '01 12 * * *' },
};

const ashanData = {
  url: 'https://auchan.zakaz.ua',
  local: 'ru',
  shop: 'Ashan',
};

const novusData = {
  url: 'https://novus.zakaz.ua',
  local: 'ru',
  shop: 'Novus',
};

const megaMarketData = {
  url: 'https://megamarket.zakaz.ua',
  local: 'ru',
  shop: 'MegaMarket',
};

export {
  settings,
  limiter,
  redis,
  defaultJobOptions,
  ashanData,
  novusData,
  megaMarketData,
  options,
};
