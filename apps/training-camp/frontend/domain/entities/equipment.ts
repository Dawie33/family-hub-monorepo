// ============================================================================
// TYPES POUR LES EQUIPEMENTS
// ============================================================================
export interface Equipment {
    id: string
    label: string
    slug: string
    description?: string
    image_url?: string
    created_at: string
    updated_at: string
}

export interface CreateEquipmentDTO {
    label: string
    description?: string
    image_url?: string
}

export type UpdateEquipmentDTO = Partial<CreateEquipmentDTO>