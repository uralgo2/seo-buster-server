import { Nullable } from '../utils.types'
import mongoose, { Model, Schema, Types } from 'mongoose'

export interface ICity {
    _id?: string

    id: number

    name: string
}

export const CitySchema = new Schema<ICity>({
    name: {
        type: String,
        required: true,
    },
    id: {
        type: Number,
    },
})

export const City = mongoose.model('City', CitySchema)
