---
layout: post
title: "Continuous Collision Detection — Time of Impact"
date: 2024-09-07
description: Why fast-moving objects tunnel through walls and how Time-of-Impact continuous collision detection solves it. Interactive demo with Rapier.js and React Three Fiber.
tags: physics simulation collision-detection rapier3d react-three-fiber
categories: blog
---

## Why Tunneling Happens

Physics engines that step through time in finite increments can miss collisions when objects move fast or are very thin. A bullet may skip from one side of a wall to the other without ever being detected.

## Time-of-Impact to the Rescue

Continuous collision detection sweeps shapes through time and solves for the moment of contact, preventing tunneling. Rapier.js exposes this through *time of impact* (TOI) calculations.

## Try it: Discrete vs CCD

Toggle between discrete and continuous collision detection. The magenta bar shows the TOI sweep, predicting where the bullet should hit.

<div id="ccd-demo" style="height:360px;"></div>

<script type="module">
import React, { useState, useRef, useEffect } from 'https://cdn.skypack.dev/react@18.2.0';
import { createRoot } from 'https://cdn.skypack.dev/react-dom@18.2.0/client';
import { Canvas } from 'https://cdn.skypack.dev/@react-three/fiber@8.15.12';
import { Physics, RigidBody } from 'https://cdn.skypack.dev/@react-three/rapier@1.4.0';
import * as THREE from 'https://cdn.skypack.dev/three@0.157.0';

function Bullet({ useCCD }) {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current) return;
    ref.current.setTranslation({ x: -2, y: 0, z: 0 }, true);
    ref.current.setLinvel({ x: 50, y: 0, z: 0 }, true);
  }, [useCCD]);
  return (
    <RigidBody ref={ref} colliders="ball" ccd={useCCD}>
      <mesh>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color="#ff6a00" />
      </mesh>
    </RigidBody>
  );
}

function Wall() {
  return (
    <RigidBody type="fixed" position={[0, 0, 0]}>
      <mesh>
        <boxGeometry args={[0.05, 1, 1]} />
        <meshStandardMaterial color="#808080" />
      </mesh>
    </RigidBody>
  );
}

function TOISweep() {
  const length = 1.875; // distance from start to contact
  return (
    <mesh position={[-2 + length / 2, 0, 0]}>
      <boxGeometry args={[length, 0.01, 0.01]} />
      <meshBasicMaterial color="hotpink" />
    </mesh>
  );
}

function Scene({ useCCD }) {
  return (
    <Canvas style={{ height: '300px', background: '#111' }} camera={{ position: [0, 0, 4] }}>
      <ambientLight />
      <Physics gravity={[0, 0, 0]}>
        <Bullet useCCD={useCCD} />
        <Wall />
        <TOISweep />
      </Physics>
    </Canvas>
  );
}

function App() {
  const [useCCD, setUseCCD] = useState(false);
  return (
    <>
      <Scene useCCD={useCCD} key={useCCD ? 'ccd' : 'discrete'} />
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <button onClick={() => setUseCCD(v => !v)}>
          {useCCD ? 'Switch to Discrete' : 'Enable CCD'}
        </button>
      </div>
    </>
  );
}

const root = createRoot(document.getElementById('ccd-demo'));
root.render(<App />);
</script>

*Built with [Rapier.js](https://rapier.rs) and [React Three Fiber](https://docs.pmnd.rs/react-three-fiber).* 
