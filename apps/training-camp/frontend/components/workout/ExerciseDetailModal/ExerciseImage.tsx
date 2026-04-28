import Image from 'next/image'

interface ExerciseImageProps {
  imageUrl?: string
  alt: string
}

export function ExerciseImage({ imageUrl, alt }: ExerciseImageProps) {
  if (!imageUrl) return null

  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border">
      <Image src={imageUrl} alt={alt} fill className="object-cover" />
    </div>
  )
}
