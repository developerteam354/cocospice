import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Address } from '../../models/Address.model.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSessionId(req: Request): string | null {
  return (req.query.sessionId as string) || (req.body?.sessionId as string) || null;
}

// ─── GET /api/user/addresses?sessionId=xxx ────────────────────────────────────

export const getAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = getSessionId(req);
    if (!sessionId) {
      res.status(400).json({ message: 'sessionId is required' });
      return;
    }

    const addresses = await Address.find({ sessionId })
      .sort({ isDefault: -1, createdAt: 1 })
      .exec();

    res.status(200).json({ addresses });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/user/addresses ─────────────────────────────────────────────────

export const createAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    const {
      sessionId, label, fullName, line1, line2,
      city, postcode, phone, isDefault,
    } = req.body as {
      sessionId: string;
      label: string;
      fullName: string;
      line1: string;
      line2?: string;
      city: string;
      postcode: string;
      phone: string;
      isDefault?: boolean;
    };

    if (!sessionId) {
      res.status(400).json({ message: 'sessionId is required' });
      return;
    }

    let address: InstanceType<typeof Address>;

    await session.withTransaction(async () => {
      // Count existing addresses inside the transaction
      const count = await Address.countDocuments({ sessionId }).session(session);
      const shouldBeDefault = isDefault || count === 0;

      // If this will be default, atomically unset all others
      if (shouldBeDefault) {
        await Address.updateMany(
          { sessionId },
          { $set: { isDefault: false } },
          { session }
        );
      }

      const [created] = await Address.create(
        [{
          sessionId,
          label,
          fullName,
          line1,
          line2: line2 || '',
          city,
          postcode,
          phone,
          isDefault: shouldBeDefault,
        }],
        { session }
      );
      address = created;
    });

    res.status(201).json({ address: address!, message: 'Address saved successfully' });
  } catch (err) {
    next(err);
  } finally {
    await session.endSession();
  }
};

// ─── PATCH /api/user/addresses/:id ───────────────────────────────────────────

export const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    const { sessionId, isDefault, ...rest } = req.body as {
      sessionId: string;
      isDefault?: boolean;
      label?: string;
      fullName?: string;
      line1?: string;
      line2?: string;
      city?: string;
      postcode?: string;
      phone?: string;
    };

    if (!sessionId) {
      res.status(400).json({ message: 'sessionId is required' });
      return;
    }

    let updated: InstanceType<typeof Address> | null = null;

    await session.withTransaction(async () => {
      // Verify ownership
      const existing = await Address.findOne({ _id: id, sessionId }).session(session).exec();
      if (!existing) return; // handled below

      // If setting as default, atomically unset all others first
      if (isDefault) {
        await Address.updateMany(
          { sessionId, _id: { $ne: id } },
          { $set: { isDefault: false } },
          { session }
        );
      }

      updated = await Address.findByIdAndUpdate(
        id,
        { $set: { ...rest, isDefault: isDefault ?? existing.isDefault } },
        { new: true, session }
      ).exec();
    });

    if (!updated) {
      res.status(404).json({ message: 'Address not found' });
      return;
    }

    res.status(200).json({ address: updated, message: 'Address updated successfully' });
  } catch (err) {
    next(err);
  } finally {
    await session.endSession();
  }
};

// ─── DELETE /api/user/addresses/:id ──────────────────────────────────────────

export const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    const sessionId = getSessionId(req);

    if (!sessionId) {
      res.status(400).json({ message: 'sessionId is required' });
      return;
    }

    await session.withTransaction(async () => {
      const existing = await Address.findOne({ _id: id, sessionId }).session(session).exec();
      if (!existing) return;

      await Address.findByIdAndDelete(id).session(session).exec();

      // If deleted address was default, promote the oldest remaining one
      if (existing.isDefault) {
        const next = await Address.findOne({ sessionId })
          .sort({ createdAt: 1 })
          .session(session)
          .exec();
        if (next) {
          await Address.findByIdAndUpdate(
            next._id,
            { $set: { isDefault: true } },
            { session }
          ).exec();
        }
      }
    });

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (err) {
    next(err);
  } finally {
    await session.endSession();
  }
};

// ─── PATCH /api/user/addresses/:id/default ───────────────────────────────────

export const setDefaultAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    const { sessionId } = req.body as { sessionId: string };

    if (!sessionId) {
      res.status(400).json({ message: 'sessionId is required' });
      return;
    }

    let updated: InstanceType<typeof Address> | null = null;

    await session.withTransaction(async () => {
      const existing = await Address.findOne({ _id: id, sessionId }).session(session).exec();
      if (!existing) return;

      // Atomically unset all, then set this one
      await Address.updateMany(
        { sessionId },
        { $set: { isDefault: false } },
        { session }
      );

      updated = await Address.findByIdAndUpdate(
        id,
        { $set: { isDefault: true } },
        { new: true, session }
      ).exec();
    });

    if (!updated) {
      res.status(404).json({ message: 'Address not found' });
      return;
    }

    res.status(200).json({ address: updated, message: 'Default address updated' });
  } catch (err) {
    next(err);
  } finally {
    await session.endSession();
  }
};
