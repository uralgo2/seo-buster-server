import { Injectable } from '@nestjs/common'
import { IOrder, Order } from '../schemas/order.schema'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'

@Injectable()
export class PaymentsService {
    constructor(
        private configService: ConfigService,
        private readonly httpService: HttpService,
    ) {}

    public async GetOrder(id: string): Promise<IOrder> {
        return await Order.findOne({ _id: id }).exec()
    }

    public async CreateOrder(amount: number, user: string): Promise<IOrder> {
        return await Order.create({
            amount: amount,
            user: user,
        })
    }

    public async RequestInit(order: IOrder): Promise<ITinkoffInitResponse> {
        const key = this.configService.get<string>('TERMINAL_KEY')

        console.debug(key)

        const data = (
            await this.httpService
                .post('https://securepay.tinkoff.ru/v2/Init', {
                    TerminalKey: key,
                    Amount: order.amount,
                    Description: 'Пополнение баланса на сервисе seobuster.ru',
                    OrderId: order._id,
                    NotificationURL:
                        'https://seobuster.ru/api/payment/notification',
                })
                .toPromise()
        ).data

        //console.debug(data)

        return TinkoffResponseInit.Parse(data)
    }
}

export interface ITinkoffInitResponse {
    Success: boolean
    ErrorCode: number
    TerminalKey: string
    Status: TinkoffStatus
    PaymentId: string
    OrderId: string
    Amount: number
    PaymentURL: string
}

export class TinkoffResponseInit {
    public static Parse(o: any): ITinkoffInitResponse {
        return {
            Amount: Number(o.Amount),
            ErrorCode: Number(o.ErrorCode),
            OrderId: o.OrderId,
            PaymentId: o.PaymentId,
            PaymentURL: o.PaymentURL,
            Status: o.Status,
            Success: Boolean(o.Success),
            TerminalKey: o.TerminalKey,
        }
    }
}
export enum TinkoffStatus {
    NEW = 'NEW',
    FORM_SHOWED = 'FORM_SHOWED',
    DEADLINE_EXPIRED = 'DEADLINE_EXPIRED',
    CANCELED = 'CANCELED',
    PREAUTHORIZING = 'PREAUTHORIZING',
    AUTHORIZING = 'AUTHORIZING',
    AUTH_FAIL = 'AUTH_FAIL',
    REJECTED = 'REJECTED',
    T3DS_CHECKING = '3DS_CHECKING',
    T3DS_CHECKED = '3DS_CHECKED',
    PAY_CHECKING = 'PAY_CHECKING',
    AUTHORIZED = 'AUTHORIZED',
    REVERSING = 'REVERSING',
    PARTIAL_REVERSED = 'PARTIAL_REVERSED',
    REVERSED = 'REVERSED',
    CONFIRMING = 'CONFIRMING',
    CONFIRM_CHECKING = 'CONFIRM_CHECKING',
    CONFIRMED = 'CONFIRMED',
    REFUNDING = 'REFUNDING',
    PARTIAL_REFUNDED = 'PARTIAL_REFUNDED',
    REFUNDED = 'REFUNDED',
}
