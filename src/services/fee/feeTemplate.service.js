import { Fee } from '../../models/fee.model.js';
import { Student } from '../../models/student.model.js';
import { AppError } from '../../utils/appError.js';

export class FeeTemplateService {
  static async createFeeTemplate(templateData) {
    const {
      name,
      type,
      amount,
      description,
      applicableTo,
      academicYear,
      semester
    } = templateData;

    return {
      name,
      type,
      amount,
      description,
      applicableTo,
      academicYear,
      semester,
      createdAt: new Date()
    };
  }

  static async applyTemplate(templateId, filters) {
    try {
      const template = await this.getFeeTemplate(templateId);
      const students = await Student.find(filters);

      const feePromises = students.map(student => 
        Fee.create({
          student: student._id,
          type: template.type,
          amount: template.amount,
          description: template.description,
          semester: template.semester,
          academicYear: template.academicYear,
          dueDate: new Date()
        })
      );

      return await Promise.all(feePromises);
    } catch (error) {
      throw new AppError('Failed to apply fee template', 500);
    }
  }
}