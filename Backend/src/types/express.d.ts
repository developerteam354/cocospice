import type { IAdmin } from '../models/Admin.model.js';

declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin;
    }
  }
}

export {};
