import { ICaseRepository } from "../../../domain/interfaces/CaseRepository";
import { CaseProps, HearingDetailsProps } from "../../../domain/types/EntityProps";
import { CaseModel } from "../models/CaseModel";
import HearingDetailsModel from "../models/HearingDetailsModel";


export class CaseRepositoryImplements implements ICaseRepository {
    async create(caseData: CaseProps): Promise<CaseProps> {
        const newCase = await CaseModel.create(caseData);
        return newCase.toObject();
    }

    async findAll(userId: string): Promise<CaseProps[]> {
        return await CaseModel.find({ advocateId: userId }).lean();
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

    async addHearingData(hearingData: HearingDetailsProps): Promise<HearingDetailsProps> {
        return await HearingDetailsModel.create(hearingData)
    }

    async getHearingData(caseId: string): Promise<HearingDetailsProps[]> {
        const hearings = await HearingDetailsModel.find(
            { caseId, isDeleted: false }
        ).lean<HearingDetailsProps[]>();

        return hearings;
    }


    async updateHearingData(hearingId: string, hearingData: HearingDetailsProps): Promise<HearingDetailsProps | null> {
        return await HearingDetailsModel.findByIdAndUpdate(hearingId, hearingData, { new: true, lean: true })
    }

    async deleteHearingData(hearingId: string): Promise<void | null> {
        return await HearingDetailsModel.findByIdAndUpdate(hearingId, { $set: { isDeleted: true } })
    }

    async findByCaseId(caseId: string): Promise<CaseProps | null> {
        return await CaseModel.findOne({ caseId: caseId }).lean()
    }
}