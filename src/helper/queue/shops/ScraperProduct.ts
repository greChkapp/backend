import axios from 'axios';
import { HTMLElement, parse } from 'node-html-parser';
import CreateUpdateProduct from './CreateUpdateProduct';
import { GetProductType } from '../../../types/products';
import { blackList } from './blackList';

export default class ScraperProduct {
  readonly values = {
    Бренд:  'brand',
    Вес:    'weight',
    Страна: 'country',
  };
  readonly symbols = {
    '&amp;': '&',
    '&#x27;': '\'',
  };

  constructor(readonly url: string, readonly shop: string, readonly productsLink: string[]) {}

  async parse_ () {
    const promiseScrapedProduct = this.productsLink.map(this.scrapeProduct, this);
    const promiseClearScrapedProduct = promiseScrapedProduct.map(product => product.catch(error => null));
    const scrapedProducts = await Promise.all(promiseClearScrapedProduct);
    const filterScrapedProducts = scrapedProducts.filter(Boolean);
    const promiseProducts = filterScrapedProducts.map(this.changeData, this);
    const product = await Promise.all(promiseProducts);
    const promiseCreateDataBD = product.map(this.createProductBD, this);
    await Promise.all(promiseCreateDataBD);
    return {
      crashed: scrapedProducts.length - product.length,
      links: this.productsLink.length,
      products: product.length,
    };
  }

  private async createProductBD(product) {
    const createProduct = new CreateUpdateProduct(product);
    await createProduct.checkProduct();
  }

  private async changeData (product) {
    const { brand, price, weight } = product;
    let { name } = product;
    for (const symbol in this.symbols) {
      name = name.replace(symbol, this.symbols[symbol]);
      product.brand = brand && brand.replace(symbol, this.symbols[symbol]) || null;
    }
    const nameWeightPosition = name.search(/\s\d/);
    if (nameWeightPosition !== -1) {
      product.name = name.slice(0, nameWeightPosition);
    }
    product.price = parseFloat(price);
    if (weight) {
      product.weight = /(\s(г|мл))$/g.test(weight) ? this.parseWeight(weight, 1) : this.parseWeight(weight, 1000);
    }
    product.shop = this.shop;

    return product;
  }

  private parseWeight (raw, count: number) {
    const digitRaw = raw.match(/\d?[,.]?\d+/)[0];
    const digit = digitRaw.replace(',', '.');
    const weight = parseFloat(digit);

    return weight * count;
  }

  private async scrapeProduct(productLink) {
    const content = await axios.get(`${this.url}${productLink}`);

    const document = parse(content.data);

    const name  = document.querySelector('.big-product-card__title')?.innerText;
    const price = document.querySelector('.Price__value_title')?.innerText;

    const productImage = document.querySelector('.ZooomableImageSwitcher__smallImg')?.rawAttributes.src;
    const tableInfo = document.querySelector('.big-product-card__general-info');
    const infoRaws  = tableInfo.querySelectorAll('li');
    const resultObj = {
      price,
      name,
      image: productImage,
    };

    for (const raw of infoRaws) {
      const title = raw.querySelector('.big-product-card__entry-title').querySelector('span').innerText;
      const value = raw.querySelector('.big-product-card__entry-value').innerText;
      const params = this.values[title];
      if (params) {
        resultObj[params] = value;
      }
    }

    return resultObj;
  }
}
