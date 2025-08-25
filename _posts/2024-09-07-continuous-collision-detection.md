---
layout: post
title: "Continuous Collision Detection — Time of Impact"
date: 2024-09-07
description: Why fast-moving objects tunnel through walls and how Time-of-Impact continuous collision detection solves it. Interactive demo with Rapier.js.
tags: physics simulation collision-detection rapier3d
categories: blog
---

## Why Tunneling Happens

Physics engines that step through time in finite increments can miss collisions when objects move fast or are very thin. A bullet may skip from one side of a wall to the other without ever being detected.

## Time-of-Impact to the Rescue

Continuous collision detection sweeps shapes through time and solves for the moment of contact, preventing tunneling. Rapier.js exposes this through *time of impact* (TOI) calculations.

## Try it: Discrete vs CCD

Toggle between discrete and continuous collision detection. The magenta bar shows the TOI sweep, predicting where the bullet should hit.


<div id="ccd-demo" style="max-width:480px; margin:20px auto; text-align:center;">
  <canvas id="ccd-canvas" width="480" height="120" style="background:#111; width:100%;"></canvas>
  <div style="margin-top:10px;">
    <button id="ccd-toggle">Enable CCD</button>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/@dimforge/rapier2d-compat@0.12.0/rapier2d-compat.min.js"></script>
<script>
RAPIER.init().then(() => {
  const canvas = document.getElementById('ccd-canvas');
  const ctx = canvas.getContext('2d');
  const scale = 100;
  let useCCD = false;
  let world, bullet;

  function reset() {
    world = new RAPIER.World({ x: 0, y: 0 });
    bullet = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic().setTranslation(-2, 0).setLinvel(50, 0)
    );
    world.createCollider(
      RAPIER.ColliderDesc.ball(0.1).setCcdEnabled(useCCD),
      bullet
    );
    const wallBody = world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(0, 0)
    );
    world.createCollider(RAPIER.ColliderDesc.cuboid(0.025, 0.5), wallBody);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#808080';
    ctx.fillRect(canvas.width / 2 - 0.025 * scale, canvas.height / 2 - 0.5 * scale, 0.05 * scale, 1 * scale);
    ctx.fillStyle = 'hotpink';
    ctx.fillRect(canvas.width / 2 - 2 * scale, canvas.height / 2, 1.875 * scale, 2);
    const pos = bullet.translation();
    ctx.beginPath();
    ctx.arc(canvas.width / 2 + pos.x * scale, canvas.height / 2 - pos.y * scale, 0.1 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6a00';
    ctx.fill();
  }

  function step() {
    world.step();
    draw();
    requestAnimationFrame(step);
  }

  document.getElementById('ccd-toggle').addEventListener('click', () => {
    useCCD = !useCCD;
    reset();
    document.getElementById('ccd-toggle').textContent = useCCD ? 'Switch to Discrete' : 'Enable CCD';
  });

  reset();
  step();
});
</script>

*Built with [Rapier.js](https://rapier.rs).* 
=======
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
