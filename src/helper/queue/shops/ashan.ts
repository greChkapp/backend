import axios from 'axios';
import { parse } from 'node-html-parser';
import puppeteer from 'puppeteer';
import ValidationError from '../../../errors/ValidationError';

const values = {
  Бренд: 'brand',
  Вес: 'weight',
  Страна: 'country',
};

export const parser = async (url) => {

  const content = await axios.get(url);
  // console.log(content);
  const root = parse(content.data);
  const links = root.querySelectorAll('.CategoriesMenuListItem__link').filter(data => !data.classNames.includes('CategoriesMenuListItem__link_withChildren'));

  // console.log(links);

  for (const link of links) {
    const { href } = link.rawAttributes;

    await getLinks(href);
  }
};

const grabOneProduct = async (link) => {
  const siteUrl = 'https://auchan.zakaz.ua';
  const content = await axios.get(`${siteUrl}${link}`);

  const resData = await parseHtmlData(content.data);
  console.log(resData);
};

const getLinks = async (url) => {
  let currentUrl = url;
  const siteUrl = 'https://auchan.zakaz.ua';
  const lastPage = '.pagination__direction pagination__direction_disabled';
  let count = 0;

  while (1) {
    const content = await axios.get(`${siteUrl}${currentUrl}`);
    const { products, pages } = await parseHtmlLinks(content.data);
    const currentPage = parse(content.data);
    // for (const link of products) {
    //   console.log(`${siteUrl}${link}`);
    //   try {
    //     await grabOneProduct(link);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
    // tslint:disable-next-line: no-increment-decrement
    count++;
    console.log('currentUrl: ', currentUrl);
    const tablePagination = currentPage.querySelectorAll('.pagination');
    const lastPageSelector = tablePagination.pop();
    console.log(lastPageSelector);
    if (!lastPageSelector.querySelector(lastPage)) {
      console.log(count);
      break;
    } else {
      currentUrl = `${currentUrl}?page=${count}`;
    }
  }


};

const parseHtmlLinks = async(result) => {
  const content = parse(result);

  const links = content.querySelectorAll('a');

  const resultLinks = {
    products: [],
    pages: [],
  };
  for (const link of links) {
    const linkAttrs = link.rawAttributes;
    if (linkAttrs.class && linkAttrs.class.includes('product-tile')) {
      resultLinks.products.push(linkAttrs.href);
    }
    if (linkAttrs.class && linkAttrs.class.includes('pagination__item')) {
      resultLinks.pages.push(linkAttrs.href);
    }
  }
  return resultLinks;
};

const parseHtmlData = async(result) => {
  const content = parse(result);

  const name = content.querySelector('.big-product-card__title').innerText;
  console.log(name);
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
