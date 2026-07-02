import nodemailer from 'nodemailer';

class Mailer {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  async sendPasswordReset(to: string, token: string): Promise<void> {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: `"Meal Planner" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Reset your password',
      html: `
        <p>Click the link below to reset your password. It expires in 1 hour.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, ignore this email.</p>
      `,
    });
  }

  async sendMealPlanPDF(to: string, pdfBuffer: Buffer): Promise<void> {
    await this.transporter.sendMail({
      from: `"Meal Planner" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Your Weekly Meal Plan',
      html: `
        <h2>Your personalized weekly meal plan is ready!</h2>
        <p>Find your 7-day meal plan attached as a PDF.</p>
        <p>It includes meals, calorie counts, macros, and ingredient lists for every day.</p>
        <p style="color:#888;font-size:12px;">This email was sent automatically by Meal Planner.</p>
      `,
      attachments: [
        {
          filename: 'meal-plan.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }
}

export const mailer = new Mailer();
