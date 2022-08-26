import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { IRequest } from '../utils.types'

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const role = this.reflector.get<number>('role', context.getHandler())
        const request = context.switchToHttp().getRequest<IRequest>()

        return Number(request.session.role ?? 0) >= role
    }
}
