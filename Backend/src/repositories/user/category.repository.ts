import { Category } from '../../models/Category.model.js';

export const userCategoryRepository = {
  /**
   * Find all active categories
   */
  findAll: async () => {
    return Category.find().sort({ name: 1 }).lean();
  },

  /**
   * Find a single category by ID
   */
  findById: async (id: string) => {
    return Category.findById(id).lean();
  },

  /**
   * Find categories with product count.
   * The $project stage must include categoryImage and isListed — without them
   * the aggregate strips those fields and the frontend receives empty image URLs.
   */
  findWithProductCount: async () => {
    return Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products',
        },
      },
      {
        $project: {
          name:          1,
          categoryImage: 1,   // ← must be explicit or the field is dropped
          isListed:      1,
          productCount: {
            $size: {
              $filter: {
                input: '$products',
                as: 'product',
                cond: { $eq: ['$$product.isAvailable', true] },
              },
            },
          },
        },
      },
      { $sort: { name: 1 } },
    ]);
  },
};
