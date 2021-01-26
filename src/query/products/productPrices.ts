import ListProduct from '../../services/products/ListProduct';
import ProductPrices from '../../services/products/ProductPrices';

async function productPrices(_, args, context) {
  const listProductsHelper = new ProductPrices(args.input);

  return await  listProductsHelper.productPrices();
}

export { productPrices };
