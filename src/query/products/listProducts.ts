import ListProducts from '../../services/products/ListProducts';

async function listProducts(_, args, context) {
  const listProductsHelper = new ListProducts(args.input);

  return await  listProductsHelper.listProduct();
}

export { listProducts };
