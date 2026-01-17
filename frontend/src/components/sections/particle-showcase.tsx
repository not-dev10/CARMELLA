"use client"

import { useEffect } from "react"
import { SplashCursor } from "@/components/ui/splash-cursor"

export function ParticleShowcase() {
    useEffect(() => {
        // Load Three.js first
        const threeScript = document.createElement("script")
        threeScript.src = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"
        threeScript.onload = () => {
            // Load post-processing scripts
            const effectComposerScript = document.createElement("script")
            effectComposerScript.src = "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/js/postprocessing/EffectComposer.js"
            document.head.appendChild(effectComposerScript)

            const renderPassScript = document.createElement("script")
            renderPassScript.src = "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/js/postprocessing/RenderPass.js"
            document.head.appendChild(renderPassScript)

            const bloomPassScript = document.createElement("script")
            bloomPassScript.src = "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/js/postprocessing/UnrealBloomPass.js"
            document.head.appendChild(bloomPassScript)

            // Wait a bit for all scripts to load, then load particle script
            setTimeout(() => {
                const particleScript = document.createElement("script")
                particleScript.src = "/particle-main.js"
                document.head.appendChild(particleScript)
            }, 500)
        }
        document.head.appendChild(threeScript)
    }, [])

    return (
        <section className="relative w-full" style={{ background: "linear-gradient(to bottom, #0f172a, #0f1729, #0f172a)" }}>
            <SplashCursor />
            <div 
                id="particle-container"
                style={{
                    width: "100%",
                    height: "100vh",
                    overflow: "hidden",
                    position: "relative",
                    margin: 0,
                    padding: 0,
                    display: "block"
                }}
            >
                <div id="info" style={{
                    position: "absolute",
                    top: "20px",
                    left: "20px",
                    color: "#ffffff",
                    fontSize: "14px",
                    textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
                    zIndex: 10,
                    animation: "fadeIn 1s ease-in"
                }}>
                    <p>✨ Move your cursor to interact • Click to explode</p>
                </div>

                <div id="clickHint" style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "20px",
                    color: "#ffffff",
                    fontSize: "12px",
                    textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
                    zIndex: 10,
                    animation: "pulse 2s infinite"
                }}>
                    💥 Click anywhere for explosion effect
                </div>

                <div id="stats" style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    color: "#ffffff",
                    fontSize: "12px",
                    textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
                    zIndex: 10,
                    background: "rgba(0, 0, 0, 0.5)",
                    padding: "10px 15px",
                    borderRadius: "5px",
                    border: "1px solid #ffffff",
                    backdropFilter: "blur(10px)"
                }}>
                    <p>Particles: <span id="particleCount">0</span></p>
                    <p>FPS: <span id="fps">0</span></p>
                </div>

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    @keyframes pulse {
                        0%, 100% { opacity: 0.6; }
                        50% { opacity: 1; }
                    }
                `}</style>
            </div>
        </section>
    )
}
