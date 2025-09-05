import { FilterProps } from "../../../domain/types/EntityProps";
import mongoose, { Schema } from "mongoose";


const FiltersSchema = new Schema<FilterProps>({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        unique: true
    },
    options: {
        type: [String],
    }
})

export const FilterModel = mongoose.model<FilterProps>('Filter', FiltersSchema)