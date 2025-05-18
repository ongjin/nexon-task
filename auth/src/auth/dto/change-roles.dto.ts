import { IsArray, ArrayNotEmpty, IsString, IsEnum } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class ChangeRolesDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(Role, { each: true, message: 'roles 배열 요소는 USER, OPERATOR, AUDITOR, ADMIN 중 하나여야 합니다.' })
    roles: string[];
}
