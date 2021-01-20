import { parse } from 'node-html-parser';
import puppeteer from 'puppeteer';
import ValidationError from '../../../errors/ValidationError';

const values = {
  Бренд: 'brand',
  Вес: 'weight',
  Страна: 'country',
};

export const parser = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await page.goto(url);
    await getLinks(page, url);
    await page.waitFor(3000);
  } catch (error) {
    console.error(error);
  }
};

const getLinks = async (page, url) => {
  await page.waitFor(3000);
  const result = await page.evaluate(() => {
    const html = document.querySelector('.main').innerHTML;

    return html;
  });
  const { products, pages } = await parseHtmlLinks(result);

  for (const link of products) {
    await grabOneProduct(page, url, link);
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
