'use client'

import { ExternalLink } from 'lucide-react'
import { Button } from '../../ui/button'

interface ExerciseVideoProps {
  videoUrl?: string
  title: string
}

export function ExerciseVideo({ videoUrl, title }: ExerciseVideoProps) {
  if (!videoUrl) return null

  const renderVideo = () => {
    const youtubeMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^#&?]*)/)
    if (youtubeMatch && youtubeMatch[1]) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
        />
      )
    }

    const vimeoMatch = videoUrl.match(/(?:vimeo\.com\/)([0-9]+)/)
    if (vimeoMatch && vimeoMatch[1]) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={title}
        />
      )
    }

    if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
      return (
        <video controls className="w-full h-full" src={videoUrl}>
          Your browser does not support the video tag.
        </video>
      )
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 p-6 text-center">
        <p className="text-muted-foreground mb-4">Video preview not available for this URL format.</p>
        <Button asChild variant="outline">
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            Watch on external site
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="pt-4 border-t">
      <h3 className="font-semibold mb-4">Video Tutorial</h3>
      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black/5 border">{renderVideo()}</div>
    </div>
  )
}
