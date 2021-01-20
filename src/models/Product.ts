import mongoose, { Schema } from 'mongoose';
import { GetProductType } from '../types/products';

export const productSchema = new Schema(
  {
    name: String,
    weight: Number,
    price: String,
  },
  {
    timestamps: true,
  },
);

// tslint:disable-next-line: variable-name
export const Product = mongoose.model<mongoose.Document & GetProductType>('Product', productSchema);
