import { dumpProduct } from '../../helper/dump';
import { Product } from '../../models/Product';
import { GetProductType } from '../../types/products';

export default class ListProduct {
  readonly params;
  private filter = {};
  private products: GetProductType[] = [];
  constructor(args) {
    this.params = args;
  }

  async listProduct() {
    await this.listProductHelper();

    return this.products.map(dumpProduct);
  }

  private async listProductHelper() {
    const { limit, skip, filter } = this.params;

    if (filter) {
      await this.createFilter();
    }

    this.products = await Product.find(this.filter)
                                  .populate('price')
                                  .limit(limit)
                                  .skip(skip);
  }

  private async createFilter() {
    const { filter } = this.params;
    this.filter = filter;
    if (filter.name) {
      this.filter = {
        ...this.filter,
        name : { $regex : `.*${filter.name}.*`, $options: 'i' },
      };
    }
  }
}
