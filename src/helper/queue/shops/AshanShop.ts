import axios from 'axios';
import { parse } from 'node-html-parser';

type ProductType = {
  name: string;
  price: string;
  image: string;
  brand?: string;
  weight?: string;
  country?: string;
};
export default class AshanShop {
  readonly mainUrl: string;
  readonly siteUrlPrefix: string;
  readonly lastPage: string = 'pagination__direction_disabled';
  readonly symbols = {
    '&amp;': '&',
    '&#x27;': '\'',
  };
  readonly values = {
    Бренд: 'brand',
    Вес: 'weight',
    Страна: 'country',
  };
  private products:ProductType[] = [];
  constructor(mainUrl: string, siteUrlPrefix: string) {
    this.mainUrl = mainUrl;
    this.siteUrlPrefix = siteUrlPrefix;
  }

  async parseAshanShop() {
    await this.parseAshanShopHelper();
    return;
  }

  private async parseAshanShopHelper() {
    await this.parser();
  }

  private async parser() {
    const content = await axios.get(this.mainUrl);
    const root = parse(content.data);
    const links = root.querySelectorAll('.CategoriesMenuListItem__link').filter(data => !data.classNames.includes('CategoriesMenuListItem__link_withChildren'));

    for (const link of links) {
      const { href } = link.rawAttributes;

      await this.getLinks(href);
    }
  }
  private async getLinks(url: string) {
    let currentUrl = url;
    let count = 1;

    while (1) {
      const content = await axios.get(`${this.siteUrlPrefix}${currentUrl}`);
      const { products, pages } = await this.parseHtmlLink(content.data);
      const currentPage = parse(content.data);
      for (const link of products) {
        try {
          await this.grabOneProduct(link);
        } catch (error) {
          console.log(error);
        }
      }
      // tslint:disable-next-line: no-increment-decrement
      count++;
      console.log('currentUrl: ', currentUrl);
      const tablePagination = currentPage.querySelector('.pagination');
      const lastPageSelector = tablePagination && tablePagination.querySelectorAll('li').pop();

      if (!lastPageSelector || lastPageSelector.rawAttributes.class.includes(this.lastPage)) {
        break;
      } else {
        currentUrl = `${url}?page=${count}`;
      }
    }
  }

  private async parseHtmlLink(result) {
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
  }

  private async grabOneProduct (link: string) {
    const content = await axios.get(`${this.siteUrlPrefix}${link}`);

    const productScrape:ProductType = await this.parseHtmlData(content.data);

    const product = this.changeData(productScrape);

  }

  private async changeData (product) {
    const { name, brand } = product;
    for (const symbol in this.symbols) {
      product.name = name.replace(symbol, this.symbols[symbol]);
      product.brand = brand && brand.replace(symbol, this.symbols[symbol]);
    }

    return product;
  }

  private async parseHtmlData(result) {
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
      const params = this.values[title];
      if (params) {
        resultObj[params] = value;
      }
    }
    return resultObj;
  }
}
