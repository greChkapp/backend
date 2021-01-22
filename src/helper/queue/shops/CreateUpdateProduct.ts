import { Prices } from '../../../models/Prices';
import { Product } from '../../../models/Product';
import { GetProductType } from '../../../types/products';

export default class CreateUpdateProduct {
  readonly product: GetProductType;
  private currentProduct;
  private price;
  constructor(product: GetProductType) {
    this.product = product;
  }

  async checkProduct() {
    const { name } = this.product;
    this.currentProduct = await Product.findOne({ name });

    if (this.currentProduct) {
      await this.updateProduct();
    } else {
      await this.createProduct();
    }
  }

  private async createProduct() {
    this.currentProduct = new Product(this.product);
    await this.createPrice();
    this.currentProduct.price = this.price._id;

    await this.currentProduct.save();
  }

  private async updateProduct() {
    await this.createPrice();
    await this.currentProduct.updateOne({
      price: this.price._id,
    });
  }

  private async createPrice() {
    const { price } = this.product;
    this.price = new Prices({
      price,
      product: this.currentProduct._id,
    });
    this.price.save();
  }
}
