import {
  PasswordResetTokenDocument,
  PasswordResetTokenModel,
} from '@/features/auth/schema/password-reset-token.schema';
import { mongo } from '@/shared/lib/mongo';

export const passwordResetTokenRepository = {
  async create(email: string, token: string, expiresAt: Date): Promise<string> {
    await mongo.connect();
    const doc = await PasswordResetTokenModel.create({ email, token, expiresAt });
    return doc._id.toString();
  },

  async findByToken(token: string): Promise<PasswordResetTokenDocument | null> {
    await mongo.connect();
    return PasswordResetTokenModel.findOne({ token }).lean<PasswordResetTokenDocument>().exec();
  },

  async markUsed(token: string): Promise<void> {
    await mongo.connect();
    await PasswordResetTokenModel.updateOne({ token }, { $set: { used: true } });
  },

  async deleteByEmail(email: string): Promise<void> {
    await mongo.connect();
    await PasswordResetTokenModel.deleteMany({ email });
  },
};
