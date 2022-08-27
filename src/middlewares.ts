import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
class LogsMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP')

    private static readonly Debug = false //true

    use(request: Request, response: Response, next: NextFunction) {
        response.on('finish', () => {
            const { method, url, body, query, params, session } = request
            const { statusCode, statusMessage } = response

            const message = LogsMiddleware.Debug
                ? `${method} ${url} ${statusCode} ${statusMessage} query: ${JSON.stringify(
                      query,
                  )} body: ${JSON.stringify(body)} params: ${JSON.stringify(
                      params,
                  )} session: ${JSON.stringify(session)}`
                : `${method} ${url} ${statusCode} ${statusMessage}`

            if (statusCode >= 500) {
                return this.logger.error(message)
            }

            if (statusCode >= 400) {
                return this.logger.warn(message)
            }

            return this.logger.log(message)
        })

        next()
    }
}

export default LogsMiddleware
