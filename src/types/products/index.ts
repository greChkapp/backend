import { ObjectId } from 'mongoose';

type GetProductType = {
  _id: ObjectId
  name: string;
  price: number;
  image: string;
  shop: string;
  brand?: string;
  weight?: number;
  country?: string;
};

export { GetProductType };
