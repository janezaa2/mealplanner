import PDFDocument from 'pdfkit';

import { PlanProfile, WeekPlan } from '@/features/meal-plan/types/meal-plan.types';

class PdfGenerator {
  generateMealPlanBuffer(plan: WeekPlan, profile: PlanProfile): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(22).font('Helvetica-Bold').text('Weekly Meal Plan', { align: 'center' });
      doc.moveDown(0.5);

      // Profile
      const goalLabel = profile.goal.replace(/_/g, ' ');
      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#555555')
        .text(
          `Goal: ${goalLabel}  ·  ${profile.height} cm  ·  ${profile.weight} kg  ·  Age ${profile.age}  ·  ${profile.gender}`,
          { align: 'center' }
        );
      doc.fillColor('#000000').moveDown(1);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#dddddd').stroke();
      doc.strokeColor('#000000').moveDown(1);

      for (const day of plan.days) {
        if (doc.y > 680) doc.addPage();

        // Day heading
        doc.fontSize(14).font('Helvetica-Bold').text(day.day);
        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#777777')
          .text(`${day.totalCalories} kcal total`);
        doc.fillColor('#000000').moveDown(0.5);

        for (const meal of day.meals) {
          if (doc.y > 660) doc.addPage();

          doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .text(`${meal.type}:  ${meal.name}`);

          doc
            .fontSize(9)
            .font('Helvetica')
            .fillColor('#444444')
            .text(
              `${meal.calories} kcal   |   Protein ${meal.protein}g   |   Carbs ${meal.carbs}g   |   Fat ${meal.fat}g`
            );

          if (meal.ingredients.length > 0) {
            doc
              .fontSize(8)
              .fillColor('#666666')
              .text(`Ingredients: ${meal.ingredients.join(', ')}`);
          }

          doc.fillColor('#000000').moveDown(0.5);
        }

        doc.moveDown(0.3);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#eeeeee').stroke();
        doc.strokeColor('#000000').moveDown(0.8);
      }

      doc.end();
    });
  }
}

export const pdfGenerator = new PdfGenerator();
