import { CreateUserDTO, UpdateUserDTO, User, UserQueryParams } from "@/domain/entities/auth"
import apiClient from "./apiClient"
import ResourceApi from "./resourceApi"


export const usersApi = new ResourceApi<User, CreateUserDTO, UpdateUserDTO>('/users')
export class UsersService {

    /**
     * Récupère le profil de l'utilisateur connecté.
     * L'ID de l'utilisateur est automatiquement récupéré depuis le token JWT.
     * @returns {Promise<User>} - Promesse qui renvoie l'utilisateur connecté.
     * Le résultat inclut le mot de passe de l'utilisateur qui est masqué.
     * Les stats de l'utilisateur sont également récupérés et incluent le nombre de workout et de sessions qu'il a créées.
     */
    async getUserProfile(): Promise<User> {
        const response = await apiClient.get<User>('/users/me')
        return response
    }

    async updateMe(data: UpdateUserDTO): Promise<User> {
        return apiClient.patch<User>('/users/me', data)
    }

    async getUsers(params?: UserQueryParams) {
        return usersApi.getAll(params)
    }

    async updateUser(id: string, data: UpdateUserDTO): Promise<User> {
        return usersApi.update(id, data)
    }

    async deleteUser(id: string): Promise<void> {
        return usersApi.delete(id)
    }

}

export const usersService = new UsersService()