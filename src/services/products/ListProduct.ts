import { dumpProduct } from '../../helper/dump';
import { Product } from '../../models/Product';
import { GetProductType } from '../../types/products';

export default class ListProduct {
  readonly params;
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

    this.products = await Product.find(filter)
                                  .populate('price')
                                  .limit(limit)
                                  .skip(skip);
  }
}
