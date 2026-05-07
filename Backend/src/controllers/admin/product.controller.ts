import type { Request, Response, NextFunction } from 'express';
import { productService } from '../../services/admin/product.service.js';
import type { IImageAsset, IExtraOption } from '../../models/Product.model.js';

interface ICreateProductBody {
  name: string;
  description: string;
  price: number;
  offerPercentage?: number;
  stock?: number;
  isAvailable?: boolean;
  category: string;
  isVeg?: boolean;
  ingredients?: string[];
  hasSpiceLevel?: boolean;
  extraOptions?: Array<{ name: string; price?: number } | string>;
  thumbnail: IImageAsset;
  gallery?: IImageAsset[];
}

// Normalize extraOptions — handles both old string[] and new {name,price}[] formats
function normalizeExtraOptions(raw?: Array<{ name: string; price?: number } | string>): IExtraOption[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map((opt) => {
    if (typeof opt === 'string') return { name: opt, price: 0 };
    return { name: opt.name, price: Number(opt.price ?? 0) };
  });
}

export const productController = {
  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as ICreateProductBody;

      if (!body.thumbnail?.url || !body.thumbnail?.key) {
        res.status(400).json({ message: 'Thumbnail is required' });
        return;
      }

      const product = await productService.create({
        name:            body.name,
        description:     body.description,
        ingredients:     body.ingredients ?? [],
        isVeg:           body.isVeg ?? true,
        price:           Number(body.price),
        offerPercentage: Number(body.offerPercentage ?? 0),
        stock:           Number(body.stock ?? 0),
        isAvailable:     body.isAvailable ?? true,
        category:        body.category,
        hasSpiceLevel:   body.hasSpiceLevel ?? false,
        extraOptions:    normalizeExtraOptions(body.extraOptions),
        thumbnail:       body.thumbnail,
        gallery:         body.gallery ?? [],
      });

      res.status(201).json({ product, message: 'Product created successfully' });
    } catch (err) {
      next(err);
    }
  },

  getAll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, category, minPrice, maxPrice, search } =
        req.query as Record<string, string>;

      const filter: Record<string, unknown> = {};
      if (status === 'available')   filter.isAvailable = true;
      if (status === 'unavailable') filter.isAvailable = false;
      if (status === 'outofstock')  { filter.isAvailable = true; filter.stock = 0; }
      if (category)  filter.category = category;
      if (minPrice || maxPrice) {
        filter.finalPrice = {
          ...(minPrice ? { $gte: Number(minPrice) } : {}),
          ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
        };
      }
      if (search) filter.$text = { $search: search };

      const products = await productService.getAll(filter);
      res.status(200).json({ products, total: products.length });
    } catch (err) {
      next(err);
    }
  },

  getStats: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(await productService.getStats());
    } catch (err) {
      next(err);
    }
  },

  toggleAvailability: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { isAvailable } = req.body as { isAvailable: boolean };
      const product = await productService.toggleAvailability(id, isAvailable);
      if (!product) { res.status(404).json({ message: 'Product not found' }); return; }
      res.status(200).json({ product, message: 'Visibility updated' });
    } catch (err) {
      next(err);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await productService.getById(String(req.params.id));
      if (!product) { res.status(404).json({ message: 'Product not found' }); return; }
      res.status(200).json({ product });
    } catch (err) {
      next(err);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const body = req.body as Partial<ICreateProductBody>;

      // Normalize extraOptions if provided
      const updatePayload: Record<string, unknown> = { ...body };
      if (body.extraOptions !== undefined) {
        updatePayload.extraOptions = normalizeExtraOptions(body.extraOptions);
      }

      const product = await productService.update(id, updatePayload as any);
      if (!product) { res.status(404).json({ message: 'Product not found' }); return; }
      
      res.status(200).json({ product, message: 'Product updated successfully' });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await productService.delete(String(req.params.id));
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
      next(err);
    }
  },
};
