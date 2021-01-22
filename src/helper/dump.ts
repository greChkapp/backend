
const dumpPrice = (price) => {
  return {
    id: price._id,
    price: price.price,
    createdAt: price.createdAt,
  };
};

export const dumpProduct = (product) => {
  return {
    id: product._id,
    name: product.name,
    weight: product.weight,
    price: dumpPrice(product.price),
    country: product.country,
    shop: product.shop,
    brand: product.brand,
  };
};

const dumpProductForPrice = (product) => {
  return {
    id: product._id,
    name: product.name,
    weight: product.weight,
    country: product.country,
    shop: product.shop,
    brand: product.brand,
  };
};

export const dumpPrices = (price) => {
  console.log(price);

  return {
    id: price._id,
    price: price.price,
    createdAt: price.createdAt,
    product: dumpProductForPrice(price.product),
  };
};
