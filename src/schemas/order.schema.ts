import mongoose, { Schema } from 'mongoose'

export interface IOrder {
    _id?: string

    user: string

    amount: number
}

export const OrderSchema = new Schema<IOrder>({
    user: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
})

export const Order = mongoose.model('Order', OrderSchema)
