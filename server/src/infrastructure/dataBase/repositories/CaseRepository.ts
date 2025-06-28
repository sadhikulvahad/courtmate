import { CaseRepository } from "../../../domain/interfaces/CaseRepository";
import { CaseProps } from "../../../domain/types/EntityProps";
import { CaseModel } from "../models/CaseModel";


export class CaseRepositoryImplements implements CaseRepository {
    async create(caseData: CaseProps): Promise<CaseProps> {
        const newCase = await CaseModel.create(caseData);
        return newCase.toObject();
    }

    async findAll(userId: string): Promise<CaseProps[]> {
        return await CaseModel.find({advocateId: userId}).lean();
    }

    async findById(id: string): Promise<CaseProps | null> {
        return await CaseModel.findById(id).lean();
    }

    async update(id: string, caseData: Partial<CaseProps>): Promise<CaseProps | null> {
        return await CaseModel.findByIdAndUpdate(id, caseData, { new: true }).lean();
    }

    async delete(id: string): Promise<boolean> {
        const result = await CaseModel.findByIdAndDelete(id);
        return !!result;
    }

    async addHearingDate(id: string, hearingDate: Date): Promise<CaseProps | null> {
        return await CaseModel.findByIdAndUpdate(
            id,
            { $push: { hearingHistory: hearingDate } },
            { new: true }
        ).lean();
    }
}