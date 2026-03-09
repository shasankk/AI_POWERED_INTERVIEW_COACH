import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';

function Particles() {
    const mesh = useRef();

    // Create an array of random positions for the particles
    const [particles] = useState(() => {
        const temp = [];
        for (let i = 0; i < 50; i++) {
            const x = (Math.random() - 0.5) * 15;
            const y = (Math.random() - 0.5) * 15;
            const z = (Math.random() - 0.5) * 15;
            temp.push({ position: [x, y, z], scale: Math.random() * 0.2 + 0.05 });
        }
        return temp;
    });

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y += 0.001;
            mesh.current.rotation.x += 0.0005;
        }
    });

    return (
        <group ref={mesh}>
            {particles.map((p, i) => (
                <Float key={i} speed={2} rotationIntensity={1} floatIntensity={2}>
                    <mesh position={p.position} scale={p.scale}>
                        <octahedronGeometry args={[1, 0]} />
                        <meshStandardMaterial
                            color="#6366f1"
                            opacity={0.6}
                            transparent
                            wireframe={Math.random() > 0.5}
                        />
                    </mesh>
                </Float>
            ))}
        </group>
    );
}

const AnimatedBackground = () => {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.8 }}>
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} color="#6366f1" />
                <directionalLight position={[-10, -10, -5]} intensity={1} color="#ec4899" />
                <Particles />
                <Environment preset="night" />
            </Canvas>
        </div>
    );
};

export default AnimatedBackground;
