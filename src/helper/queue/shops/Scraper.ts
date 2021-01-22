import axios from 'axios';
import { HTMLElement, parse } from 'node-html-parser';
import CreateUpdateProduct from './CreateUpdateProduct';
import { GetProductType } from '../../../types/products';
import { blackList } from './blackList';

export default class Scraper {
  readonly values = {
    Бренд:  'brand',
    Вес:    'weight',
    Страна: 'country',
  };
  readonly symbols = {
    '&amp;': '&',
    '&#x27;': '\'',
  };

  constructor(readonly url: string, readonly local: string) {}

  async scrape_() {
    const content = await axios.get(`${this.url}/${this.local}`);

    const document = parse(content.data);

    // Scrape all categories from the menu at the main page of the site
    const categories = this.scrapeCategories(document);

     // Scrape all products from the categories page
    for (const category of categories) {
      const { href } = category.rawAttributes;
      await this.scrapeProducts(href);
    }
  }

  private scrapeCategories(document: HTMLElement): HTMLElement[] {
    // The class of the main category that the menu consists of
    const categoryClass = '.CategoriesMenuListItem';
    // Root link for categories
    const categoryLinkClass    = `${categoryClass}__link`;
    // Link for sub categories
    const subCategoryLinkClass = `${categoryLinkClass}_withChildren`;

    const categories = document
      .querySelectorAll(categoryLinkClass)
      .filter(
          (category) => {
            const { classNames } = category;
            return !classNames.includes(subCategoryLinkClass);
          });
    // TODO Make blackList for some categories
    const filteredCategories = categories.filter(category => !blackList.includes(category.rawAttributes.href));

    return filteredCategories;
  }

  private async scrapeProducts(categoryUrl: string) {
    let currentPage = 0;
    let document: HTMLElement | Document;
    console.log(categoryUrl);
    do {
      currentPage += 1;

      const content = await axios.get(`${this.url}${categoryUrl}?page=${currentPage}`);
      document = parse(content.data);

      const productsLinks = await this.processProductsLinks(document);
      const products:Promise<void>[] = [];
      for (const link of productsLinks) {
        try {
          const scrapedProduct = await this.scrapeProduct(link);
          const product: GetProductType = await this.changeData(scrapedProduct);
          console.log(product);
          // const createProduct = new CreateUpdateProduct(product);
          // products.push(createProduct.checkProduct());
          // if (products.length === 100) {
          //   await Promise.all(products);
          // }
        } catch (error) {
          console.log(error);
        }
      }
    } while (this.checkCategoryEnd(document));
  }

  private checkCategoryEnd(document: HTMLElement) {
    const paginationTable = document.querySelectorAll('.pagination li');
    const paginationDirection = paginationTable?.pop();

    return paginationDirection &&
      !paginationDirection.classNames.includes('pagination__direction_disabled');
  }

  private async processProductsLinks(document: HTMLElement) {
    const rawProductsLinks = document.querySelectorAll('.product-tile');

    const productsLinks: string[] = [];

    for (const link of rawProductsLinks) {
      const { href } = link.rawAttributes;
      productsLinks.push(href);
    }

    return productsLinks;
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
      product.weight = weight.indexOf(/(\s(г|мл))$/g) ? parseInt(weight, 10) : parseInt(weight, 10) * 1000;
    }

    return product;
  }

  private async scrapeProduct(productLink: string) {
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
