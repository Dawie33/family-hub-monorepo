import { Module } from "@nestjs/common"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService], // Exporter pour que d'autres modules puissent l'utiliser
})

export class UsersModule { }