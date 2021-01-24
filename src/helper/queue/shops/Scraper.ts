import axios from 'axios';
import { HTMLElement, parse } from 'node-html-parser';
import CreateUpdateProduct from './CreateUpdateProduct';
import { GetProductType } from '../../../types/products';
import { blackList } from './blackList';

export default class ScraperLinks {
  private links: string[] = [];

  constructor(readonly url: string, readonly local: string) {}

  async scrape_() {
    const content = await axios.get(`${this.url}/${this.local}`);

    const document = parse(content.data);

    // Scrape all categories from the menu at the main page of the site
    const categories = this.scrapeCategories(document);

    return categories;
  }

  private scrapeCategories(document: HTMLElement): string[] {
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
          })
      .map(category => category.rawAttributes.href);
    // TODO Make blackList for some categories
    const filteredCategories = categories.filter(category => !blackList.includes(category));

    return filteredCategories;
  }
}
