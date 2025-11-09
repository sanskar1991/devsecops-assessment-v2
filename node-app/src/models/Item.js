import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

itemSchema.index({ name: 1 }, { unique: false });

export const Item = mongoose.model('Item', itemSchema);
