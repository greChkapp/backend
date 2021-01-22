import ListProduct from '../../services/products/ListProduct';

async function listProducts(_, args, context) {
  const listProductsHelper = new ListProduct(args.input);

  return await  listProductsHelper.listProduct();
}

export { listProducts };
