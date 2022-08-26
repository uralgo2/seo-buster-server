import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Session,
} from '@nestjs/common'
import { PaymentsService, TinkoffStatus } from '../services/payments.service'
import { ISession, UserRoleEnum } from '../utils.types'
import { Level } from '../decorators'

@Controller('/api/payment')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post('notification')
    @HttpCode(HttpStatus.OK)
    async Notification(
        @Body('OrderId') orderId: string,
        @Body('Status') status: TinkoffStatus,
    ) {
        console.debug(status)
        console.debug(await this.paymentsService.GetOrder(orderId))
    }

    @Post('')
    @Level(UserRoleEnum.Authenticated)
    @HttpCode(HttpStatus.OK)
    async Create(@Body('amount') amount: number, @Session() session: ISession) {
        const order = await this.paymentsService.CreateOrder(
            amount,
            session.userId,
        )
        const payment = await this.paymentsService.RequestInit(order)

        return {
            status: payment.Status,
            url: payment.PaymentURL,
        }
    }
}
