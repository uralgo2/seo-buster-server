import { Injectable, Logger } from '@nestjs/common'
import { ProjectsService } from './projects.service'
import { UsersService } from './users.service'
import { Cron, CronExpression, Timeout } from '@nestjs/schedule'

@Injectable()
export class DeductService {
    private readonly logger = new Logger(DeductService.name)

    constructor(
        private readonly projectsService: ProjectsService,
        private readonly usersService: UsersService,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
        name: 'deductFromUserBalanceEveryDayAtMidnight',
        timeZone: 'Europe/Moscow',
    })
    async DeductFromUserBalanceEveryDayAtMidnight() {
        const users = await this.usersService.GetUsers()
        const today = new Date()

        for (const user of users) {
            const projects = await this.projectsService.GetUsersProjects(
                user._id,
            )

            for (const project of projects) {
                const createdAt = new Date(
                    project.createdAt.toISOString().split('T')[0],
                )

                const diffTime = today.getTime() - createdAt.getTime()
                const diffDay = Math.round(diffTime / (1000 * 3600 * 24))

                if (diffDay >= 1 && user.balance - project.expensePerDay >= 0)
                    await this.usersService.PatchUser(user._id, {
                        balance: user.balance - project.expensePerDay,
                    })
            }
        }
    }
}
