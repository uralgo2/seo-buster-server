import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { TelegramBotService } from '../services/telegram.bot.service'

@Controller('/api/cities')
export class TelegramBotController {
    constructor(private readonly telegramBotService: TelegramBotService) {}


}
