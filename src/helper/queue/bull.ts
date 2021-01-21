import bull from 'bull';

export const ashanShopQueue = new bull('ashan');

ashanShopQueue.add({
  mainUrl: 'https://auchan.zakaz.ua/ru',
  urls: ['https://auchan.zakaz.ua/ru/categories/pulses-and-grain-auchan/'] },
                   { repeat: { cron: '15 3 * * *' } },
);
