import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { AuthDto } from './auth.dto'
import { faker } from '@faker-js/faker'
import { hash } from 'argon2'

@Injectable()
export class AuthService {
	constructor(private prisma: PrismaService) {}

	async register(dto: AuthDto) {
		const existUser = await this.prisma.user.findUnique({
			where: { email: dto.email },
		})

		if (existUser) {
			throw new BadRequestException('User already exist')
		}
		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				name: faker.name.firstName(),
				avatarPath: faker.image.avatar(),
				phone: faker.phone.number('+7 (###) ###-##-##'),
				password: await hash(dto.password),
			},
		})
		return user
	}
}
