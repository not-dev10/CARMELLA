export function CloudinaryDebug() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg text-xs font-mono max-w-sm z-50">
      <div className="font-bold mb-2">Cloudinary Config</div>
      <div className="space-y-1">
        <div>Cloud Name: <span className={cloudName ? "text-green-400" : "text-red-400"}>{cloudName || "MISSING"}</span></div>
        <div>Upload Preset: <span className={uploadPreset ? "text-green-400" : "text-red-400"}>{uploadPreset || "MISSING"}</span></div>
      </div>
    </div>
  )
}
