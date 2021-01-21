import { parse } from 'node-html-parser';
import puppeteer from 'puppeteer';
import ValidationError from '../../../errors/ValidationError';

const values = {
  Бренд: 'brand',
  Вес: 'weight',
  Страна: 'country',
};

export const parser = async (url) => {
  const browser = await puppeteer.launch({ headless: false, args: ['--start-maximized'] });
  const page    = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  try {

    console.log(url);
    await page.goto(url);
    await page.waitFor(2000);
    console.log('parse start');
  // const links = await page.evaluate(() => {
  //   console.log('parse 1');
  //   const html = document.querySelectorAll('.CategoriesMenuListItem__link');
  //   // const html = document
  //   //   .querySelectorAll('a:not(.CategoriesMenuListItem__link_withChildren).CategoriesMenuListItem__link');
  //   console.log('parse 2');
  //   console.log(html);
  //   return html;
  // });
    const result = await page.evaluate(() => {
      const html = document
         .querySelectorAll('a:not(.CategoriesMenuListItem__link_withChildren).CategoriesMenuListItem__link');
      console.log(html);
      
      return html;
    });
    console.log('parse done');
    
    // for (const link of result) {
    //   
    // }
    await grabOneProduct(page, url, '/categories/cheese-auchan/');
    browser.close();
    // console.log(result);
    // await page.waitFor(3000);
  } catch (error) {
    console.error(error);
  }
};

const grabOneProduct = async (page, previousUrl, link) => {
  const siteUrl = 'https://auchan.zakaz.ua/ru';
  await page.goto(`${siteUrl}${link}`);
  await page.waitFor(2000);
  const result = await page.evaluate(() => {
    const html = document.querySelector('.big-product-card').innerHTML;

    return html;
  });

  const resData = await parseHtmlData(result);
  console.log(resData);
  await page.goto(previousUrl);
};



// const getLinks = async (page, url) => {
//   await page.waitFor(3000);
//   const result = await page.evaluate(() => {
//     //const html = document.querySelector('.CategoriesMenuListItem__link');
//     const html = document.querySelector('a:not(.CategoriesMenuListItem__link_withChildren).CategoriesMenuListItem__link');

//     return html;
//   });
//   const { products, pages } = await parseHtmlLinks(result);

//   for (const link of products) {
//     grabOneProduct()
//   }
// };

// const parseHtmlLinks = async(result) => {
//   const content = parse(result);

//   const links = content.querySelectorAll('a');

//   const resultLinks = {
//     products: [],
//     pages: [],
//   };
//   for (const link of links) {
//     const linkAttrs = link.rawAttributes;
//     if (linkAttrs.class && linkAttrs.class.includes('product-tile')) {
//       resultLinks.products.push(linkAttrs.href);
//     }
//     if (linkAttrs.class && linkAttrs.class.includes('pagination__item')) {
//       resultLinks.pages.push(linkAttrs.href);
//     }
//   }
//   return resultLinks;
// };



const parseHtmlData = async(result) => {
  const content = parse(result);

  const name = content.querySelector('.big-product-card__title').innerText;
  const price = content.querySelector('.big-product-card__price').querySelector('span').innerText;
  const images = content.querySelectorAll('img');
  let productImage = '';

  for (const image of images) {
    const imageAttrs = image.rawAttributes;
    if (imageAttrs.title && imageAttrs.title.includes(name)) {
      productImage = imageAttrs.src;
      break;
    }
  }
  const tableInfo = content.querySelector('.big-product-card__general-info');
  const infoRaws = tableInfo.querySelectorAll('li');
  const resultObj = {
    price,
    name,
    image: productImage,
  };

  for (const raw of infoRaws) {
    const title = raw.querySelector('.big-product-card__entry-title').querySelector('span').innerText;
    const value = raw.querySelector('.big-product-card__entry-value').innerText;
    const params = values[title];
    if (params) {
      resultObj[params] = value;
    }
  }
  return resultObj;
};

// type ProductType = {
//   name: string;
//   price: string;
//   image: string;
//   brand?: string;
//   weight?: string;
//   country?: string;
// };
// export default class AshanShop {
//   readonly mainUrl: string;
//   readonly urls: string[];
//   readonly values = {
//     Бренд: 'brand',
//     Вес: 'weight',
//     Страна: 'country',
//   };
//   private browser;
//   private page;
//   private products:ProductType[] = [];
//   constructor(mainUrl: string, urls: string[]) {
//     this.mainUrl = mainUrl;
//     this.urls = urls;
//   }

//   async parseAshanShop() {
//     this.browser = await puppeteer.launch();
//     this.page = await this.browser.newPage();
//     this.parseAshanShopHelper();
//     return;
//   }

//   private async parseAshanShopHelper() {
//     for (const url of this.urls) {
//       this.parser(url);
//     }
//   }

//   private async parser(url: string) {

//     try {
//       await this.page.goto(url);
//       await this.getLinks(url);
//       await this.page.waitFor(3000);
//     } catch (error) {
//       console.error(error);
//     }
//   }

//   private async getLinks(url: string) {
//     await this.page.waitFor(2000);
//     const result = await this.page.evaluate(() => {
//       const html = document.querySelector('.main').innerHTML;

//       return html;
//     });
//     const { products, pages } = await parseHtmlLinks(result);

//     for (const link of products) {
//       await this.grabOneProduct(url, link);
//     }
//   }

//   private async grabOneProduct(previousUrl: string, link: string) {
//     await this.page.goto(`${this.mainUrl}${link}`);
//     await this.page.waitFor(2000);
//     const result = await this.page.evaluate(() => {
//       const html = document.querySelector('.big-product-card').innerHTML;

//       return html;
//     });

//     const resData = await this.parseHtmlData(result);
//     this.products.push(resData);
//     console.log(resData);
//     await this.page.goto(previousUrl);
//   }

//   private async parseHtmlData(result) {
//     const content = parse(result);

//     const name = content.querySelector('.big-product-card__title').innerText;
//     const price = content.querySelector('.big-product-card__price').querySelector('span').innerText;
//     const images = content.querySelectorAll('img');
//     let productImage = '';

//     for (const image of images) {
//       const imageAttrs = image.rawAttributes;
//       if (imageAttrs.title && imageAttrs.title.includes(name)) {
//         productImage = imageAttrs.src;
//         break;
//       }
//     }
//     const tableInfo = content.querySelector('.big-product-card__general-info');
//     const infoRaws = tableInfo.querySelectorAll('li');
//     const resultObj = {
//       price,
//       name,
//       image: productImage,
//     };

//     for (const raw of infoRaws) {
//       const title = raw.querySelector('.big-product-card__entry-title').querySelector('span').innerText;
//       const value = raw.querySelector('.big-product-card__entry-value').innerText;
//       const params = values[title];
//       if (params) {
//         resultObj[params] = value;
//       }
//     }
//     return resultObj;
//   }
// }
