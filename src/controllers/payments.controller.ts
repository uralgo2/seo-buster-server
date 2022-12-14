import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Logger,
    Post,
    Request,
    Session,
} from '@nestjs/common'
import { PaymentsService, TinkoffStatus } from '../services/payments.service'
import { IRequest, ISession, UserRoleEnum } from '../utils.types'
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

    private readonly logger = new Logger(PaymentsController.name)

    @Post('notification')
    @Level(UserRoleEnum.All)
    @HttpCode(HttpStatus.OK)
    async Notification(
        @Body('OrderId') orderId: string,
        @Body('Status') status: TinkoffStatus,
        @Request() req: IRequest,
    ) {
        if (status == TinkoffStatus.CONFIRMED) {
            const order = await this.paymentsService.GetOrder(orderId)
            const amount = order.amount / 100
            await this.usersService.PatchUser(order.user, {
                $inc: {
                    balance: amount,
                },
            })

            try {
                await this.telegramBotService.NotifyUser(
                    order.user,
                    `Успешное пополнение на сумму ${amount} руб`,
                )
            } catch (e) {
                this.logger.error(e.message)
            }
        } else if (
            status == TinkoffStatus.REJECTED ||
            status == TinkoffStatus.AUTH_FAIL ||
            status == TinkoffStatus.CANCELED
        ) {
            const order = await this.paymentsService.GetOrder(orderId)

            try {
                await this.telegramBotService.NotifyUser(
                    order.user,
                    `Неуспешное пополнение на сумму ${
                        order.amount / 100
                    } руб. Статус: ${status}`,
                )
            } catch (e) {
                this.logger.error(e.message)
            }
        } else if (status == TinkoffStatus.REFUNDED) {
            const order = await this.paymentsService.GetOrder(orderId)

            try {
                await this.telegramBotService.NotifyUser(
                    order.user,
                    `Успешный возврат средств на сумму ${
                        order.amount / 100
                    } руб.`,
                )
            } catch (e) {
                this.logger.error(e.message)
            }
            await this.usersService.PatchUser(order.user, {
                $inc: {
                    balance: -order.amount / 100,
                },
            })
        }

        //console.debug(status)
        //console.debug(req.body)

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
