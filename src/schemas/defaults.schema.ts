import mongoose, { Schema } from 'mongoose'

export interface IDefaults {
    factor: number
    accountsFactor: number
    proxies: number
    price: number
    geo: number
    sclick: number
    pristavka1: string
    pristavka2: string
    pristavka3: string
}

export const DefaultsSchema = new Schema<IDefaults>({
    factor: {
        type: Number,
        required: true,
    },
    accountsFactor: {
        type: Number,
        required: true,
    },
    proxies: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    geo: {
        type: Number,
        required: true,
    },
    sclick: {
        type: Number,
        required: true,
    },
    pristavka1: {
        type: String,
        required: true,
    },
    pristavka2: {
        type: String,
        required: true,
    },
    pristavka3: {
        type: String,
        required: true,
    },
})

export const Defaults = mongoose.model('Default', DefaultsSchema)