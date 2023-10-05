import { Injectable } from '@nestjs/common'
import { UserDto } from './user.dto'

@Injectable()
export class UserService {
	byId(id: number) {
		return Promise.resolve(undefined)
	}

	updateProfile(dto: UserDto) {
		return Promise.resolve(undefined)
	}

	toggleFavorite(id: number, productId: string) {
		return Promise.resolve(undefined)
	}
}
