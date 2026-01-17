

export default function Image({ src, alt, width, height, className, priority, fill, ...props }: any) {
    // If fill is true (Next.js feature), we make it absolute inset-0
    const style = fill ? { position: 'absolute', height: '100%', width: '100%', inset: 0, objectFit: 'cover' } : {};

    return (
        <img
            src={src}
            alt={alt || ""}
            width={width}
            height={height}
            className={className}
            style={{ ...style, ...props.style }}
            {...props}
        />
    );
}
