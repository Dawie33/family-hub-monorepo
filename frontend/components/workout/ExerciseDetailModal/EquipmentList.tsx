import { Equipment } from '@/domain/entities/equipment'
import { Dumbbell } from 'lucide-react'

interface EquipmentListProps {
  equipments: Equipment[]
}

export function EquipmentList({ equipments }: EquipmentListProps) {
  if (equipments.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Dumbbell className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-lg">Équipements requis</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {equipments.map(equipment => (
          <div key={equipment.id} className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg border border-border">
            {equipment.image_url ? (
              <img src={equipment.image_url} alt={equipment.label} className="w-12 h-12 object-cover rounded" />
            ) : (
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-medium">{equipment.label}</p>
              {equipment.description && <p className="text-xs text-muted-foreground">{equipment.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
