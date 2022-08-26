import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { RoleGuard } from './guards/role.guard'
import { UserRoleEnum } from './utils.types'
import { isObject } from '@nestjs/common/utils/shared.utils'

export const Level = (who: UserRoleEnum) =>
    applyDecorators(UseGuards(RoleGuard), SetMetadata('role', who))

export const ValidateParameters = (
    target: any,
    key: string,
    descriptor: PropertyDescriptor,
) => {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
        const metadataKey = `__validate_${key}_parameters`
        const toValidate = target[metadataKey]

        if (Array.isArray(toValidate)) {
            for (let i = 0; i < args.length; i++) {
                const arg = toValidate.find((index) => index[0] == i)
                if (arg) {
                    const [validateTo] = arg

                    if (isObject(validateTo)) {
                    }
                }
            }
            return originalMethod.apply(this, args)
        } else {
            return originalMethod.apply(this, args)
        }
    }
    return descriptor
}

export const Validate = (
    validateTo: any,
    target: any,
    key: string,
    index: number,
) => {
    const metadataKey = `__validate_${key}_parameters`

    if (Array.isArray(target[metadataKey])) {
        target[metadataKey].push([index, validateTo])
    } else {
        target[metadataKey] = [[index, validateTo]]
    }
}
