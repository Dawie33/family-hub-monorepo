// ============================================================================
// Equipments API

import { CreateEquipmentDTO, Equipment, UpdateEquipmentDTO } from "@/domain/entities/equipment"
import ResourceApi from "./resourceApi"

// ============================================================================
export const equipmentsApi = new ResourceApi<Equipment, CreateEquipmentDTO, UpdateEquipmentDTO>(
    '/equipments'
)

export async function getEquipments(params?: {
    limit?: number
    offset?: number
    search?: string
    orderBy?: string
    orderDir?: string
}) {
    return equipmentsApi.getAll(params)
}

export async function getEquipment(id: string): Promise<Equipment> {
    return equipmentsApi.getOne(id)
}

export async function createEquipment(data: CreateEquipmentDTO): Promise<Equipment> {
    return equipmentsApi.create(data)
}

export async function updateEquipment(id: string, data: UpdateEquipmentDTO): Promise<Equipment> {
    return equipmentsApi.update(id, data)
}

export async function deleteEquipment(id: string): Promise<void> {
    return equipmentsApi.delete(id)
}
