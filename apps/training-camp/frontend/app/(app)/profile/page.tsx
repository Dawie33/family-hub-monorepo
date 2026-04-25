'use client'

import { AuthGuard } from '@/components/guards/AuthGuard'
import { useState } from 'react'
import { EquipmentTab } from './_components/EquipmentTab'
import { OneRepMaxTab } from './_components/OneRepMaxTab'
import { ProfileTab } from './_components/ProfileTab'
import { useProfileForm } from './_hooks/useProfileForm'

type Tab = 'profile' | 'equipment' | '1rms'

const tabs: { key: Tab; label: string }[] = [
  { key: 'profile', label: 'Profil' },
  { key: 'equipment', label: 'Équipement' },
  { key: '1rms', label: '1RMs' },
]

function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const {
    fullUser, authUser,
    firstName, setFirstName,
    lastName, setLastName,
    sportLevel, setSportLevel,
    height, setHeight,
    weight, setWeight,
    bodyFat, setBodyFat,
    savingProfile, handleSaveProfile,
    equipment, savingEquipment, toggleEquipment, setEquipment, handleSaveEquipment,
    oneRepMaxes, liftValues, savingLift, setLiftEntry, handleSaveLift,
  } = useProfileForm()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="px-4 lg:px-8 py-4 lg:py-6 border-b border-slate-700/50 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-1.5 h-10 bg-orange-500 rounded-full" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Mon Profil</h1>
            <p className="text-slate-400 text-sm mt-0.5">Gérez vos informations personnelles et préférences</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-6">
        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl border border-slate-700/50 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <ProfileTab
            fullUser={fullUser}
            authEmail={authUser?.email}
            firstName={firstName} setFirstName={setFirstName}
            lastName={lastName} setLastName={setLastName}
            sportLevel={sportLevel} setSportLevel={setSportLevel}
            height={height} setHeight={setHeight}
            weight={weight} setWeight={setWeight}
            bodyFat={bodyFat} setBodyFat={setBodyFat}
            saving={savingProfile}
            onSave={handleSaveProfile}
          />
        )}

        {activeTab === 'equipment' && (
          <EquipmentTab
            equipment={equipment}
            saving={savingEquipment}
            onToggle={toggleEquipment}
            onPreset={setEquipment}
            onClear={() => setEquipment([])}
            onSave={handleSaveEquipment}
          />
        )}

        {activeTab === '1rms' && (
          <OneRepMaxTab
            oneRepMaxes={oneRepMaxes}
            liftValues={liftValues}
            savingLift={savingLift}
            onSetEntry={setLiftEntry}
            onSave={handleSaveLift}
          />
        )}
      </div>
    </div>
  )
}

export default function ProfilePageWrapper() {
  return (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  )
}
