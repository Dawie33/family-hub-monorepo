interface ExerciseImageProps {
  imageUrl?: string
  alt: string
}

export function ExerciseImage({ imageUrl, alt }: ExerciseImageProps) {
  if (!imageUrl) return null

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <img src={imageUrl} alt={alt} className="w-full h-64 object-cover" />
    </div>
  )
}
