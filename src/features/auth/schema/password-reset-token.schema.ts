import mongoose, { InferSchemaType, Schema } from 'mongoose';

const PasswordResetTokenSchema = new Schema(
  {
    email: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type PasswordResetTokenDocument = InferSchemaType<typeof PasswordResetTokenSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const PasswordResetTokenModel =
  mongoose.models.PasswordResetToken ||
  mongoose.model('PasswordResetToken', PasswordResetTokenSchema);
