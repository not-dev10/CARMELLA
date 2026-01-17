"use client"

interface SplineSceneProps {
    scene: string
    className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
    // Convert .splinecode URL to standard viewer URL if needed
    // This is a robust fallback to avoid binary parsing errors in the current environment
    const viewerUrl = scene.replace('scene.splinecode', '')

    return (
        <div className={className}>
            <iframe
                src={viewerUrl}
                frameBorder="0"
                width="100%"
                height="100%"
                className="w-full h-full border-none"
                title="3D Scene"
                loading="lazy"
            />
        </div>
    )
}
