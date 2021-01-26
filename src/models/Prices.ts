import mongoose, { Schema } from 'mongoose';
import { GetProductType } from '../types/products';

export const pricesSchema = new Schema(
  {
    price: Number,
    product: { type: Schema.Types.ObjectId, ref: 'Product' },

  },
  {
    timestamps: true,
  },
);

// tslint:disable-next-line: variable-name
export const Prices = mongoose.model<mongoose.Document & GetProductType>('Prices', pricesSchema);
