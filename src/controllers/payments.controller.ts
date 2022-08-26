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
import { TelegramBotService } from '../services/telegram.bot.service'
import { UsersService } from '../services/users.service'

@Controller('/api/payment')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly telegramBotService: TelegramBotService,
        private readonly usersService: UsersService,
    ) {}

    @Post('notification')
    @HttpCode(HttpStatus.OK)
    async Notification(
        @Body('OrderId') orderId: string,
        @Body('Status') status: TinkoffStatus,
    ) {
        if (status == TinkoffStatus.CONFIRMED) {
            const order = await this.paymentsService.GetOrder(orderId)
            const amount = order.amount / 100
            await this.usersService.PatchUser(order.user, {
                $inc: {
                    balance: amount,
                },
            })

            await this.telegramBotService.NotifyUser(
                order.user,
                `Успешное пополнение на ${amount} руб`,
            )
        } else if (
            status == TinkoffStatus.REJECTED ||
            status == TinkoffStatus.AUTH_FAIL ||
            status == TinkoffStatus.CANCELED
        ) {
            const order = await this.paymentsService.GetOrder(orderId)

            await this.telegramBotService.NotifyUser(
                order.user,
                `Неуспешное пополнение на ${
                    order.amount / 100
                } руб. Статус: ${status}`,
            )
        }

        return 'OK'
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
