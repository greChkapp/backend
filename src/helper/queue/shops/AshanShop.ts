import axios from 'axios';
import { HTMLElement, parse } from 'node-html-parser';

type ProductType = {
  name: string;
  price: string;
  image: string;
  brand?: string;
  weight?: string;
  country?: string;
};

export default class Scraper {
export default class AshanShop {
  readonly mainUrl: string;
  readonly siteUrlPrefix: string;
  readonly lastPage: string = 'pagination__direction_disabled';
  readonly symvols = {
    '&amp;': '&',
    '&#x27;': '\'',
  }
  readonly values = {
    Бренд:  'brand',
    Вес:    'weight',
    Страна: 'country',
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

    return categories;
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
      for (const link of productsLinks) {
        try {
          await this.scrapeProduct(link);
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

  private async scrapeProduct(productLink: string) {
    const content = await axios.get(`${this.url}${productLink}`);
    const document = parse(content.data);
  private async grabOneProduct (link: string) {
    const content = await axios.get(`${this.siteUrlPrefix}${link}`); 

    const name  = document.querySelector('.big-product-card__title')?.innerText;
    const price = document.querySelector('.Price__value_title')?.innerText;
    const resData:ProductType = await this.parseHtmlData(content.data);
    for (let i in this.symvols){
      resData.name = resData.name.replace(i,this.symvols[i]);
      if (resData.brand != null){
      resData.brand = resData.brand && resData.brand.replace(i,this.symvols[i]);
      }
    }
    console.log(resData);
  }

    const productImage = document.querySelector('.ZooomableImageSwitcher__smallImg')?.rawAttributes.src;

    // for (const image of images) {
    //   const imageAttrs = image.rawAttributes;
    //   if (imageAttrs.title && imageAttrs.title.includes(name)) {
    //     productImage = imageAttrs.src;
    //     break;
    //   }
    // }


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

    console.log(resultObj);
  }
}
