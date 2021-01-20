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

    return this.products;
  }

  private async listProductHelper() {
    const { limit, skip } = this.params;

    this.products = await Product.find()
                                  .limit(limit)
                                  .skip(skip);
  }
}
