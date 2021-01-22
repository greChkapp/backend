import { dumpPrices } from '../../helper/dump';
import { Prices } from '../../models/Prices';

export default class ProductPrices {
  readonly params;
  private prices;
  constructor(args) {
    this.params = args;
  }

  async productPrices() {
    await this.getProductPrices();

    return this.prices.map(dumpPrices);
  }

  private async getProductPrices() {
    const { productId } = this.params;
    console.log(productId);
    this.prices = await Prices.find({ product: productId })
                                .populate('product');
    console.log(this.prices);
  }
}
