import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    ForbiddenException,
    HttpException,
    HttpStatus,
} from '@nestjs/common'

import { Response, Request } from 'express'
import { MongooseError } from 'mongoose'

export class ApiException extends HttpException {
    constructor(message: string, code: HttpStatus = HttpStatus.BAD_REQUEST) {
        super(
            {
                error: true,
                code: code,
                message: message,
            },
            code,
        )
    }
}

@Catch(HttpException, ApiException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()

        const getStatus: () => HttpStatus =
            exception instanceof ForbiddenException
                ? () => HttpStatus.FORBIDDEN
                : exception.getStatus ?? (() => HttpStatus.BAD_REQUEST)
        let status

        try {
            status = getStatus()
        } catch {
            status = HttpStatus.FORBIDDEN
        }
        const message = exception.message

        response.status(status).json({
            code: status,
            error: true,
            message: message,
            path: request.url,
            method: request.method,
        })
    }
}

@Catch(Error)
export class ErrorFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()

        const status = HttpStatus.BAD_REQUEST

        const message = exception.message

        response.status(status).json({
            code: status,
            error: true,
            message: message,
            path: request.url,
            method: request.method,
        })
    }
}
