import axios from 'axios';
import { HTMLElement, parse } from 'node-html-parser';

export default class ScraperProducts {
  private links: string[] = [];

  constructor(readonly url: string, readonly categoryUrl: string) {}

  async scrapeProducts() {
    let currentPage = 0;
    let document: HTMLElement | Document;
    // console.log(this.categoryUrl);
    do {
      if (currentPage >= 40) {
        break;
      }
      currentPage += 1;
      let content;
      console.log(`${this.url}${this.categoryUrl}?page=${currentPage}`);
      try {
        content = await axios.get(`${this.url}${this.categoryUrl}?page=${currentPage}`);
      } catch (error) {
        console.log('error', error);
        break;
      }

      document = parse(content.data);

      const productsLinks = await this.processProductsLinks(document);
      this.links.push(...productsLinks);
    } while (this.checkCategoryEnd(document));
    console.log('links', this.links.length);
    return this.links;
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
}
