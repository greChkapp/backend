import { ashanShopQueue } from '../bull';
import Ashan from './Ashan';

ashanShopQueue.process(async (job) => {
  const { mainUrl, urls } = job.data;
  const ashanParser = new Ashan(mainUrl, urls);
  const parsedData = await ashanParser.parseAshanShop();

  return parsedData;
});
