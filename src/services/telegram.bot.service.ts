import {
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
    OnModuleInit,
} from '@nestjs/common'
import { TelegramMessage, TelegramService } from 'nestjs-telegram'
import { UsersService } from './users.service'
import { ApiException } from '../exceptions'
import { Cron, CronExpression, Interval } from '@nestjs/schedule'
import { UserRoleEnum } from '../utils.types'
import { TelegramInfo } from '../schemas/telegram.info.schema'

@Injectable()
export class TelegramBotService {
    private readonly logger = new Logger(TelegramBotService.name)

    public static adminChatid = 912351684

    private updateOffset = 0

    constructor(
        private readonly bot: TelegramService,
        private readonly usersService: UsersService,
    ) {}

    // every 2 seconds
    @Interval(2000)
    private async Polling() {
        try {
            const updates = await this.bot
                .getUpdates({ offset: this.updateOffset })
                .toPromise()

            if (updates.length) {
                for (const update of updates) {
                    switch (update.message.entities[0].type) {
                        case 'bot_command':
                            this.OnCommand(update.message)
                            break
                        default:
                            this.OnMessage(update.message)
                    }
                }

                this.updateOffset = updates[updates.length - 1].update_id + 1
            }
        } catch (error) {
            //this.logger.debug(error)
        }
    }

    private async OnCommand(msg: TelegramMessage) {
        const command = msg.text

        switch (command) {
            case '/start':
                {
                    const telegramLogin = msg.from.username

                    const user = await this.usersService.GetUserByTelegram(
                        telegramLogin,
                    )

                    const exist = await TelegramInfo.findOne({
                        login: msg.from.username,
                    }).exec()

                    if (!exist) {
                        const info = new TelegramInfo({
                            login: telegramLogin,
                            chatId: msg.chat.id,
                        })
                        await info.save()
                    }

                    if (user) {
                        await this.usersService.PatchUser(user._id, {
                            telegramChatId: msg.chat.id,
                        })
                    }

                    await this.bot
                        .sendMessage({
                            chat_id: msg.chat.id,
                            text: 'Уведомления подключены.',
                        })
                        .toPromise()
                }
                break
        }
    }

    private async OnMessage(msg: TelegramMessage) {
        //
    }

    public async NotifyUser(userId: string, msg: string) {
        const chatId =
            (await this.usersService.GetUserById(userId))?.telegramChatId ??
            null

        if (!chatId)
            throw new ApiException(
                'Пользователь не включил уведомления',
                HttpStatus.BAD_REQUEST,
            )

        await this.bot
            .sendMessage({
                chat_id: chatId,
                text: msg,
            })
            .toPromise()
    }

    public async NotifyAdmin(msg: string) {
        const admins = await this.usersService.GetUsersByRole(
            UserRoleEnum.Admin,
        )

        for (const admin of admins) {
            if (admin.telegramChatId)
                await this.bot
                    .sendMessage({
                        chat_id: admin.telegramChatId,
                        text: msg,
                    })
                    .toPromise()
        }
    }
}
