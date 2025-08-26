---
layout: post
title: "Quaternions, SO(3), and Gimbal Lock — An Interactive Intuition"
description: "Why Euler angles hit singularities, how quaternions live on S³, and why SLERP makes interpolation behave. Zero-build, in-browser demo."
tags: [physics, graphics, games, rotations, quaternions, so3]
---

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Rotations: Understanding Gimbal Lock</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
            color: #e0e0e0;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            background: linear-gradient(135deg, #64ffda, #7c4dff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.8;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .visualization-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .wide-panel {
            grid-column: 1 / -1;
        }
        
        .panel {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 20px;
            position: relative;
            overflow: hidden;
        }
        
        .panel h3 {
            margin: 0 0 15px 0;
            font-size: 1.3rem;
            color: #64ffda;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .canvas-container {
            position: relative;
            width: 100%;
            height: 400px;
            border-radius: 10px;
            overflow: hidden;
            background: #000;
        }
        
        canvas {
            display: block;
            width: 100%;
            height: 100%;
        }
        
        .controls {
            margin-top: 15px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .control-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .control-group label {
            font-size: 0.9rem;
            color: #b0b0b0;
            font-weight: 500;
        }
        
        .slider {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: rgba(255, 255, 255, 0.1);
            outline: none;
        }
        
        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #64ffda;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(100, 255, 218, 0.3);
        }
        
        .value-display {
            font-family: 'Courier New', monospace;
            color: #64ffda;
            font-weight: bold;
        }
        
        .warning {
            background: rgba(255, 107, 107, 0.15);
            border: 1px solid rgba(255, 107, 107, 0.3);
            border-radius: 8px;
            padding: 12px;
            margin-top: 10px;
            color: #ff6b6b;
            font-weight: bold;
            display: none;
        }
        
        .warning.active {
            display: block;
            animation: pulse 1s ease-in-out infinite alternate;
        }
        
        @keyframes pulse {
            from { opacity: 0.7; }
            to { opacity: 1; }
        }
        
        .button {
            background: linear-gradient(135deg, #7c4dff, #536dfe);
            border: none;
            border-radius: 8px;
            padding: 10px 20px;
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(124, 77, 255, 0.4);
        }
        
        .info-box {
            background: rgba(100, 255, 218, 0.1);
            border: 1px solid rgba(100, 255, 218, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
            font-size: 0.9rem;
            line-height: 1.5;
        }
        
        .quaternion-display {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-top: 10px;
        }
        
        .quat-component {
            text-align: center;
            padding: 8px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 6px;
            font-family: 'Courier New', monospace;
        }
        
        .quat-component .label {
            font-size: 0.8rem;
            opacity: 0.7;
            margin-bottom: 4px;
        }
        
        .quat-component .value {
            font-weight: bold;
            color: #64ffda;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>3D Rotations: The Gimbal Lock Problem</h1>
            <p>Explore why Euler angles fail at certain orientations and how quaternions provide a elegant solution</p>
        </div>
        
        <div class="visualization-grid">
            <!-- Gimbal Rig Visualization -->
            <div class="panel">
                <h3>🎯 Gimbal Rig</h3>
                <div class="canvas-container">
                    <canvas id="gimbalCanvas"></canvas>
                </div>
                <div class="controls">
                    <div class="control-group">
                        <label><span style="color: #64ffda;">Yaw (Z-axis)</span> <span class="value-display" id="yawValue">0°</span></label>
                        <input type="range" class="slider" id="yawSlider" min="-180" max="180" value="0" step="1">
                    </div>
                    <div class="control-group">
                        <label><span style="color: #4caf50;">Pitch (Y-axis)</span> <span class="value-display" id="pitchValue">0°</span></label>
                        <input type="range" class="slider" id="pitchSlider" min="-90" max="90" value="0" step="1">
                    </div>
                    <div class="control-group">
                        <label><span style="color: #ff9800;">Roll (X-axis)</span> <span class="value-display" id="rollValue">0°</span></label>
                        <input type="range" class="slider" id="rollSlider" min="-180" max="180" value="0" step="1">
                    </div>
                </div>
                <div class="warning" id="gimbalWarning">
                    ⚠️ GIMBAL LOCK! Yaw and Roll axes are aligned - you've lost a degree of freedom!
                </div>
                <div class="info-box">
                    <strong>Try this:</strong> Set pitch to ±90° and notice how yaw and roll controls do the same thing. This is gimbal lock - the curse of Euler angles!
                </div>
            </div>
            
            <!-- Quaternion Sphere -->
            <div class="panel">
                <h3>🌐 Quaternion Sphere (S³)</h3>
                <div class="canvas-container">
                    <canvas id="quaternionCanvas"></canvas>
                </div>
                <div class="quaternion-display">
                    <div class="quat-component">
                        <div class="label">x</div>
                        <div class="value" id="quatX">0.000</div>
                    </div>
                    <div class="quat-component">
                        <div class="label">y</div>
                        <div class="value" id="quatY">0.000</div>
                    </div>
                    <div class="quat-component">
                        <div class="label">z</div>
                        <div class="value" id="quatZ">0.000</div>
                    </div>
                    <div class="quat-component">
                        <div class="label">w</div>
                        <div class="value" id="quatW">1.000</div>
                    </div>
                </div>
                <div class="controls">
                    <button class="button" id="showAntipodes">Show Antipodal Points (±q)</button>
                </div>
                <div class="info-box">
                    Quaternions live on a 4D unit sphere. Each 3D rotation maps to TWO points: q and -q. This "double cover" eliminates singularities!
                </div>
            </div>
            
            <!-- Euler Angle Heatmap -->
            <div class="panel wide-panel">
                <h3>🔥 Euler Angle Sensitivity Map (Torus Topology)</h3>
                <div class="canvas-container" style="height: 300px;">
                    <canvas id="heatmapCanvas"></canvas>
                </div>
                <div class="controls">
                    <div class="control-group">
                        <label>Fixed Pitch Value <span class="value-display" id="heatmapPitchValue">0°</span></label>
                        <input type="range" class="slider" id="heatmapPitchSlider" min="-90" max="90" value="0" step="5">
                    </div>
                    <button class="button" id="animateHeatmap">Animate Through Pitch Values</button>
                    <button class="button" id="toggleTorusView">Toggle Torus/Flat View</button>
                </div>
                <div class="info-box">
                    <strong>Color coding:</strong> <span style="color: #0066ff;">Blue</span> = stable, <span style="color: #00ff00;">Green</span> = sensitive, <span style="color: #ff0000;">Red</span> = highly singular, <span style="color: #ffff00;">Yellow</span> = gimbal lock!<br>
                    This map shows how sensitive the rotation is to small changes in yaw/roll for a given pitch. The torus topology reveals how yaw and roll wrap around at ±180°. As pitch approaches ±90°, the entire map turns red/yellow, showing that yaw and roll become coupled and the coordinate system becomes singular.
                </div>
            </div>
            
            <!-- SLERP Comparison -->
            <div class="panel wide-panel">
                <h3>📈 Interpolation: Euler LERP vs SLERP</h3>
                <div class="canvas-container" style="height: 300px;">
                    <canvas id="slerpCanvas"></canvas>
                </div>
                <div class="controls">
                    <div class="control-group">
                        <label>Interpolation Parameter t <span class="value-display" id="tValue">0.0</span></label>
                        <input type="range" class="slider" id="tSlider" min="0" max="1" value="0" step="0.01">
                    </div>
                    <button class="button" id="animateInterp">Animate Interpolation</button>
                    <button class="button" id="setRandomOrientations">Set Random Orientations</button>
                </div>
                <div class="info-box">
                    <strong>Blue path:</strong> SLERP (quaternion) - smooth great circle on S³<br>
                    <strong>Red path:</strong> Euler LERP - can be jerky, especially near singularities<br>
                    Watch how SLERP maintains constant angular velocity while Euler LERP can speed up and slow down unpredictably.
                </div>
            </div>
        </div>
    </div>

    <!-- Three.js for 3D rendering -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>

    <script>
        // Quaternion utility functions
        const qNorm = ([x, y, z, w]) => {
            const s = 1 / Math.sqrt(x*x + y*y + z*z + w*w);
            return [x*s, y*s, z*s, w*s];
        };

        const qMul = ([ax, ay, az, aw], [bx, by, bz, bw]) => ([
            aw*bx + ax*bw + ay*bz - az*by,
            aw*by - ax*bz + ay*bw + az*bx,
            aw*bz + ax*by - ay*bx + az*bw,
            aw*bw - ax*bx - ay*by - az*bz
        ]);

        const qFromAxisAngle = ([ux, uy, uz], th) => {
            const s = Math.sin(th / 2);
            return qNorm([ux*s, uy*s, uz*s, Math.cos(th / 2)]);
        };

        const qFromEulerZYX = (yaw, pitch, roll) => {
            const cy = Math.cos(yaw / 2), sy = Math.sin(yaw / 2);
            const cp = Math.cos(pitch / 2), sp = Math.sin(pitch / 2);
            const cr = Math.cos(roll / 2), sr = Math.sin(roll / 2);
            
            return qNorm([
                sr*cp*cy - cr*sp*sy,
                cr*sp*cy + sr*cp*sy,
                cr*cp*sy - sr*sp*cy,
                cr*cp*cy + sr*sp*sy
            ]);
        };

        const qSlerp = (a, b, t) => {
            let [ax, ay, az, aw] = a;
            let [bx, by, bz, bw] = b;
            
            let dot = ax*bx + ay*by + az*bz + aw*bw;
            if (dot < 0) {
                dot = -dot;
                bx = -bx; by = -by; bz = -bz; bw = -bw;
            }
            
            // Handle near-parallel quaternions
            if (dot > 0.9995) {
                return qNorm([ax + t*(bx-ax), ay + t*(by-ay), az + t*(bz-az), aw + t*(bw-aw)]);
            }
            
            // Handle antipodal quaternions (dot ≈ 0 after negation)
            if (dot < 0.001) {
                // Find an orthogonal quaternion
                let orthogonal = [aw, -az, ay, -ax];
                if (Math.abs(ax) > 0.9) {
                    orthogonal = [-aw, az, -ay, ax];
                }
                // SLERP through the orthogonal quaternion
                if (t < 0.5) {
                    return qSlerp(a, orthogonal, t * 2);
                } else {
                    return qSlerp(orthogonal, b, (t - 0.5) * 2);
                }
            }
            
            const th = Math.acos(Math.min(1, dot));
            const s = 1 / Math.sin(th);
            const aS = Math.sin((1-t)*th) * s;
            const bS = Math.sin(t*th) * s;
            
            return [ax*aS + bx*bS, ay*aS + by*bS, az*aS + bz*bS, aw*aS + bw*bS];
        };

        const qToMatrix = ([x, y, z, qw]) => {
            const xx = x*x, yy = y*y, zz = z*z;
            const xy = x*y, xz = x*z, xw = x*qw;
            const yz = y*z, yw = y*qw, zw = z*qw;
            
            return [
                1-2*(yy+zz), 2*(xy-zw), 2*(xz+yw), 0,
                2*(xy+zw), 1-2*(xx+zz), 2*(yz-xw), 0,
                2*(xz-yw), 2*(yz+xw), 1-2*(xx+yy), 0,
                0, 0, 0, 1
            ];
        };

        // Convert quaternion to Euler angles (ZYX order)
        const qToEulerZYX = ([x, y, z, w]) => {
            const sinr_cosp = 2 * (w * x + y * z);
            const cosr_cosp = 1 - 2 * (x * x + y * y);
            const roll = Math.atan2(sinr_cosp, cosr_cosp);
            
            const sinp = 2 * (w * y - z * x);
            const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * Math.PI / 2 : Math.asin(sinp);
            
            const siny_cosp = 2 * (w * z + x * y);
            const cosy_cosp = 1 - 2 * (y * y + z * z);
            const yaw = Math.atan2(siny_cosp, cosy_cosp);
            
            return [yaw, pitch, roll];
        };

        // Conjugate quaternion
        const qConj = ([x, y, z, w]) => [-x, -y, -z, w];

        // Quaternion dot product
        const qDot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2] + a[3]*b[3];

        // Get axis and angle from quaternion
        const qToAxisAngle = ([x, y, z, w]) => {
            const angle = 2 * Math.acos(Math.min(1, Math.max(-1, w)));
            if (Math.abs(angle) < 1e-6) {
                return [[1, 0, 0], 0];
            }
            const s = Math.sin(angle / 2);
            if (Math.abs(s) < 1e-6) {
                return [[1, 0, 0], angle];
            }
            return [[x/s, y/s, z/s], angle];
        };

        // Global state
        let currentQuaternion = [0, 0, 0, 1];
        let showAntipodes = false;
        let animating = false;
        let quaternionHistory = [[0, 0, 0, 1]]; // For drift correction
        let frameCount = 0;
        let showTorusView = false;

        // Canvas contexts (will be initialized in init function)
        let quaternionCtx, heatmapCtx, slerpCtx;

        // Utility functions
        const deg2rad = (deg) => deg * Math.PI / 180;
        const rad2deg = (rad) => rad * 180 / Math.PI;

        const resizeCanvases = () => {
            // Only resize 2D canvases (gimbal canvas is handled by Three.js)
            const canvases = [
                document.getElementById('quaternionCanvas'),
                document.getElementById('heatmapCanvas'),
                document.getElementById('slerpCanvas')
            ];
            
            canvases.forEach(canvas => {
                if (canvas) {
                    const rect = canvas.parentElement.getBoundingClientRect();
                    canvas.width = rect.width * window.devicePixelRatio;
                    canvas.height = rect.height * window.devicePixelRatio;
                    canvas.style.width = rect.width + 'px';
                    canvas.style.height = rect.height + 'px';
                    
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
                    }
                }
            });
        };

        // THREE.JS 3D Gimbal Visualization
        let scene, camera, renderer, controls;
        let gimbalRings = [];
        let coordinateAxes = [];
        let centerSphere;

        const initThreeJS = () => {
            const canvas = document.getElementById('gimbalCanvas');
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;

            // Scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x000000);

            // Camera
            camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            camera.position.set(3, 2, 4);

            // Renderer
            renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
            renderer.setSize(width, height);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // Controls
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.enableZoom = true;
            controls.enablePan = false;
            controls.minDistance = 2;
            controls.maxDistance = 8;

            // Lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 5, 5);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            scene.add(directionalLight);

            const pointLight = new THREE.PointLight(0x64ffda, 0.3, 100);
            pointLight.position.set(-3, 3, -3);
            scene.add(pointLight);

            // Create gimbal rings
            createGimbalRings();
            
            // Create coordinate axes
            createCoordinateAxes();
            
            // Create center sphere
            createCenterSphere();

            // Add grid helper
            const gridHelper = new THREE.GridHelper(4, 20, 0x333333, 0x111111);
            gridHelper.position.y = -2;
            scene.add(gridHelper);

            // Start animation loop
            animate();
        };

        const createGimbalRings = () => {
            // Create gimbal hierarchy: yaw contains pitch, pitch contains roll
            const yawGroup = new THREE.Group(); // Outermost group for yaw
            const pitchGroup = new THREE.Group(); // Middle group for pitch
            const rollGroup = new THREE.Group(); // Inner group for roll
            
            // Set up hierarchy: yaw -> pitch -> roll
            scene.add(yawGroup);
            yawGroup.add(pitchGroup);
            pitchGroup.add(rollGroup);
            
            const ringConfigs = [
                { radius: 1.8, tube: 0.08, color: 0x64ffda, name: 'yaw', group: yawGroup },
                { radius: 1.4, tube: 0.06, color: 0x4caf50, name: 'pitch', group: pitchGroup },
                { radius: 1.0, tube: 0.04, color: 0xff9800, name: 'roll', group: rollGroup }
            ];

            ringConfigs.forEach((config, index) => {
                const geometry = new THREE.TorusGeometry(config.radius, config.tube, 16, 100);
                
                // For yaw ring, create a gradient material to make rotation visible
                let material;
                if (index === 0) {
                    // Create a custom shader material with gradient for yaw ring
                    material = new THREE.ShaderMaterial({
                        uniforms: {
                            color1: { value: new THREE.Color(0x64ffda) },
                            color2: { value: new THREE.Color(0x1e88e5) }
                        },
                        vertexShader: `
                            varying vec3 vPosition;
                            void main() {
                                vPosition = position;
                                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                            }
                        `,
                        fragmentShader: `
                            uniform vec3 color1;
                            uniform vec3 color2;
                            varying vec3 vPosition;
                            void main() {
                                float mixFactor = (atan(vPosition.y, vPosition.x) + 3.14159) / (2.0 * 3.14159);
                                vec3 color = mix(color1, color2, mixFactor);
                                gl_FragColor = vec4(color, 0.9);
                            }
                        `,
                        transparent: true
                    });
                } else {
                    material = new THREE.MeshPhongMaterial({
                        color: config.color,
                        shininess: 100,
                        transparent: true,
                        opacity: 0.8
                    });
                }
                
                const ring = new THREE.Mesh(geometry, material);
                ring.castShadow = true;
                ring.receiveShadow = true;
                ring.userData = { name: config.name, originalColor: config.color, group: config.group };
                
                // Orient rings in their natural rotation planes
                if (index === 0) { // Yaw ring - rotates around Z (lies in XY plane)
                    // Default orientation is correct
                } else if (index === 1) { // Pitch ring - rotates around Y (lies in XZ plane)
                    ring.rotation.x = Math.PI / 2;
                } else if (index === 2) { // Roll ring - rotates around X (lies in YZ plane)
                    ring.rotation.z = Math.PI / 2;
                }
                
                // Add ring to its respective group
                config.group.add(ring);
                gimbalRings.push(ring);
                
                // Add visual markers to make rotation visible
                const markerGeometry = new THREE.SphereGeometry(0.05, 8, 8);
                const markerMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    emissive: config.color,
                    emissiveIntensity: 0.3
                });
                
                // Add markers around each ring - more for yaw to make rotation visible
                const markerCount = (index === 0) ? 8 : 4; // More markers for yaw ring
                for (let i = 0; i < markerCount; i++) {
                    const angle = (i / markerCount) * Math.PI * 2;
                    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                    
                    if (index === 0) { // Yaw ring markers
                        marker.position.set(
                            config.radius * Math.cos(angle),
                            config.radius * Math.sin(angle),
                            0
                        );
                        // Add colored markers at cardinal points for yaw ring
                        if (i === 0) {
                            // Front marker - bright cyan
                            marker.material = marker.material.clone();
                            marker.material.color.setHex(0x00ffff);
                            marker.material.emissive.setHex(0x00ffff);
                            marker.material.emissiveIntensity = 0.5;
                            marker.scale.set(1.5, 1.5, 1.5);
                        } else if (i === markerCount / 2) {
                            // Back marker - darker
                            marker.material = marker.material.clone();
                            marker.material.color.setHex(0x006666);
                            marker.material.emissive.setHex(0x003333);
                        }
                    } else if (index === 1) { // Pitch ring markers
                        marker.position.set(
                            config.radius * Math.cos(angle),
                            0,
                            config.radius * Math.sin(angle)
                        );
                    } else if (index === 2) { // Roll ring markers
                        marker.position.set(
                            0,
                            config.radius * Math.cos(angle),
                            config.radius * Math.sin(angle)
                        );
                    }
                    
                    marker.castShadow = true;
                    config.group.add(marker);
                }
                
                // Add a visual strip/band on the yaw ring to make rotation obvious
                if (index === 0) {
                    // Create a colored band on the yaw ring
                    const bandGeometry = new THREE.BoxGeometry(config.radius * 0.3, 0.15, 0.15);
                    const bandMaterial = new THREE.MeshPhongMaterial({
                        color: 0x00ffff,
                        emissive: 0x00ffff,
                        emissiveIntensity: 0.3,
                        shininess: 100
                    });
                    const band = new THREE.Mesh(bandGeometry, bandMaterial);
                    band.position.set(config.radius, 0, 0);
                    band.castShadow = true;
                    config.group.add(band);
                    
                    // Add another contrasting band
                    const band2 = new THREE.Mesh(bandGeometry, bandMaterial.clone());
                    band2.material.color.setHex(0xff00ff);
                    band2.material.emissive.setHex(0xff00ff);
                    band2.position.set(-config.radius, 0, 0);
                    band2.castShadow = true;
                    config.group.add(band2);
                }
                
                // Add arrow indicator for rotation direction - larger for yaw
                const arrowGroup = new THREE.Group();
                const arrowSize = (index === 0) ? 0.06 : 0.03;
                const arrowLength = (index === 0) ? 0.2 : 0.12;
                const arrowGeometry = new THREE.ConeGeometry(arrowSize, arrowLength, 8);
                const arrowMaterial = new THREE.MeshPhongMaterial({
                    color: config.color,
                    emissive: config.color,
                    emissiveIntensity: 0.4
                });
                const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
                
                if (index === 0) { // Yaw ring arrow - make it more visible
                    arrow.position.set(config.radius + 0.25, 0, 0);
                    arrow.rotation.z = -Math.PI / 2;
                    
                    // Add a second arrow on opposite side for yaw
                    const arrow2 = new THREE.Mesh(arrowGeometry, arrowMaterial);
                    arrow2.position.set(-config.radius - 0.25, 0, 0);
                    arrow2.rotation.z = Math.PI / 2;
                    arrowGroup.add(arrow2);
                    
                    // Add rotation direction indicator text sprite
                    const canvas = document.createElement('canvas');
                    canvas.width = 128;
                    canvas.height = 64;
                    const context = canvas.getContext('2d');
                    context.fillStyle = '#64ffda';
                    context.font = 'bold 24px Arial';
                    context.fillText('YAW', 30, 40);
                    
                    const texture = new THREE.CanvasTexture(canvas);
                    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, opacity: 0.8 });
                    const sprite = new THREE.Sprite(spriteMaterial);
                    sprite.position.set(0, 0, config.radius + 0.5);
                    sprite.scale.set(0.5, 0.25, 1);
                    config.group.add(sprite);
                } else if (index === 1) { // Pitch ring arrow
                    arrow.position.set(config.radius + 0.15, 0, 0);
                    arrow.rotation.y = Math.PI / 2;
                    arrow.rotation.z = -Math.PI / 2;
                } else if (index === 2) { // Roll ring arrow
                    arrow.position.set(0, config.radius + 0.15, 0);
                    arrow.rotation.x = Math.PI / 2;
                }
                
                arrowGroup.add(arrow);
                config.group.add(arrowGroup);
                
                // Add reference axis line for yaw ring to make rotation clearer
                if (index === 0) {
                    const lineGeometry = new THREE.BufferGeometry();
                    const lineVertices = new Float32Array([
                        0, 0, -0.5,
                        0, 0, 0.5
                    ]);
                    lineGeometry.setAttribute('position', new THREE.BufferAttribute(lineVertices, 3));
                    const lineMaterial = new THREE.LineBasicMaterial({
                        color: 0x64ffda,
                        linewidth: 3,
                        opacity: 0.5,
                        transparent: true
                    });
                    const axisLine = new THREE.Line(lineGeometry, lineMaterial);
                    config.group.add(axisLine);
                }
            });
            
            // Store groups for easy access
            gimbalRings.yawGroup = yawGroup;
            gimbalRings.pitchGroup = pitchGroup;
            gimbalRings.rollGroup = rollGroup;
        };

        const createCoordinateAxes = () => {
            const axisLength = 1.5;
            const axisConfigs = [
                { color: 0xff4444, direction: new THREE.Vector3(1, 0, 0), label: 'X' },
                { color: 0x44ff44, direction: new THREE.Vector3(0, 1, 0), label: 'Y' },
                { color: 0x4444ff, direction: new THREE.Vector3(0, 0, 1), label: 'Z' }
            ];

            axisConfigs.forEach(config => {
                // Create arrow
                const arrowHelper = new THREE.ArrowHelper(
                    config.direction,
                    new THREE.Vector3(0, 0, 0),
                    axisLength,
                    config.color,
                    0.2,
                    0.1
                );
                arrowHelper.line.material.linewidth = 3;
                
                scene.add(arrowHelper);
                coordinateAxes.push(arrowHelper);
            });
        };

        const createCenterSphere = () => {
            const geometry = new THREE.SphereGeometry(0.05, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                shininess: 100,
                emissive: 0x222222
            });
            
            centerSphere = new THREE.Mesh(geometry, material);
            centerSphere.castShadow = true;
            scene.add(centerSphere);
        };

        const updateGimbalFromSliders = () => {
            const yaw = deg2rad(parseFloat(document.getElementById('yawSlider').value));
            const pitch = deg2rad(parseFloat(document.getElementById('pitchSlider').value));
            const roll = deg2rad(parseFloat(document.getElementById('rollSlider').value));

            // Check for gimbal lock
            const isGimbalLock = Math.abs(Math.cos(pitch)) < 0.15;

            // Update gimbal groups - each ring rotates in its own group
            if (gimbalRings.yawGroup && gimbalRings.pitchGroup && gimbalRings.rollGroup) {
                // Yaw group rotates around Z-axis
                gimbalRings.yawGroup.rotation.z = yaw;
                
                // Pitch group rotates around Y-axis (and is inside yaw group)
                gimbalRings.pitchGroup.rotation.y = pitch;
                
                // Roll group rotates around X-axis (and is inside pitch group)
                gimbalRings.rollGroup.rotation.x = roll;

                // Update colors based on gimbal lock (skip yaw ring as it has custom shader)
                gimbalRings.forEach((ring, index) => {
                    if (ring.material.color) { // Only update if material has color property (not shader material)
                        ring.material.color.setHex(isGimbalLock ? 0xff6b6b : ring.userData.originalColor);
                        ring.material.emissive.setHex(isGimbalLock ? 0x220000 : 0x000000);
                    } else if (ring.material.uniforms) { // Update shader material for yaw ring
                        if (isGimbalLock) {
                            ring.material.uniforms.color1.value.setHex(0xff6b6b);
                            ring.material.uniforms.color2.value.setHex(0xff4444);
                        } else {
                            ring.material.uniforms.color1.value.setHex(0x64ffda);
                            ring.material.uniforms.color2.value.setHex(0x1e88e5);
                        }
                    }
                });

                // Disable UI controls during gimbal lock
                const yawSlider = document.getElementById('yawSlider');
                const rollSlider = document.getElementById('rollSlider');
                if (isGimbalLock) {
                    // Make roll slider semi-transparent and show it's coupled with yaw
                    rollSlider.style.opacity = '0.5';
                    rollSlider.style.pointerEvents = 'none';
                    document.querySelector('label[for="rollSlider"]').style.opacity = '0.5';
                } else {
                    rollSlider.style.opacity = '1';
                    rollSlider.style.pointerEvents = 'auto';
                    document.querySelector('label[for="rollSlider"]').style.opacity = '1';
                }
            }

            // Update coordinate axes - they should be in the final roll group to show final orientation
            if (coordinateAxes.length >= 3 && gimbalRings.rollGroup) {
                // Remove axes from scene and add to roll group so they rotate with final orientation
                coordinateAxes.forEach(axis => {
                    if (axis.parent !== gimbalRings.rollGroup) {
                        if (axis.parent) axis.parent.remove(axis);
                        gimbalRings.rollGroup.add(axis);
                    }
                });
            }

            // Update gimbal lock warning
            document.getElementById('gimbalWarning').classList.toggle('active', isGimbalLock);
        };

        const animate = () => {
            requestAnimationFrame(animate);
            
            controls.update();
            
            // Don't rotate the entire scene - let the user control the view
            // The gimbal rings should be the only things rotating
            
            renderer.render(scene, camera);
        };

        const resizeThreeJS = () => {
            const canvas = document.getElementById('gimbalCanvas');
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };

        // Replace the old drawGimbal function
        const drawGimbal = () => {
            if (renderer) {
                updateGimbalFromSliders();
                // Also update quaternion sphere
                drawQuaternionSphere();
            }
        };

        // Quaternion sphere visualization with angle encoding and geodesic
        const drawQuaternionSphere = () => {
            const canvas = document.getElementById('quaternionCanvas');
            const ctx = quaternionCtx;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            
            ctx.clearRect(0, 0, width, height);
            ctx.save();
            ctx.translate(width/2, height/2);
            
            const radius = Math.min(width, height) * 0.3;
            
            // Draw sphere wireframe
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            
            // Latitude lines
            for (let lat = -60; lat <= 60; lat += 30) {
                const r = radius * Math.cos(deg2rad(lat));
                const y = radius * Math.sin(deg2rad(lat));
                ctx.beginPath();
                ctx.arc(0, -y, r, 0, 2 * Math.PI);
                ctx.stroke();
            }
            
            // Longitude lines
            for (let lon = 0; lon < 180; lon += 30) {
                ctx.beginPath();
                const ellipseRadius = Math.abs(radius * Math.cos(deg2rad(lon)));
                ctx.ellipse(0, 0, ellipseRadius, radius, deg2rad(lon), 0, 2 * Math.PI);
                ctx.stroke();
            }
            
            // Get quaternion components
            const [x, y, z, qw] = currentQuaternion;
            
            // Calculate angle and axis from quaternion
            const angle = 2 * Math.acos(Math.min(1, Math.max(-1, Math.abs(qw))));
            
            // SIMPLE DIRECT MAPPING - guaranteed to show movement
            // Map quaternion components directly to screen coordinates
            const scale = radius * 0.8;
            
            // Use quaternion x,y components directly (scaled)
            // This will definitely move as sliders change
            const finalX = x * scale * 5; // Amplify for visibility
            const finalY = -y * scale * 5; // Flip Y for canvas, amplify for visibility
            
            // Calculate axis for rotation visualization
            let axisX = 0, axisY = 0, axisZ = 0;
            if (Math.sin(angle/2) > 1e-6) {
                const s = Math.sin(angle/2);
                axisX = x / s;
                axisY = y / s;
                axisZ = z / s;
            }
                
            // Encode angle with color gradient and ring size
            const angleNormalized = angle / Math.PI; // 0 to 1
            const hue = (1 - angleNormalized) * 120; // Green (120) to Red (0)
            const ringSize = 8 + angleNormalized * 12;  // Size based on angle
            
            // Draw angle encoding ring
            ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.3)`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(finalX, finalY, ringSize * 1.5, 0, 2 * Math.PI);
            ctx.stroke();
            
            // Draw positive quaternion point with angle-based color
            const gradient = ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, ringSize);
            gradient.addColorStop(0, `hsl(${hue}, 100%, 60%)`);
            gradient.addColorStop(1, `hsl(${hue}, 100%, 40%)`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(finalX, finalY, ringSize, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw axis of rotation if there is one
            if (Math.abs(angle) > 0.01) {
                // Draw axis line
                ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.5)`;
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(axisX * radius, -axisY * radius);
                ctx.stroke();
                ctx.setLineDash([]);
                
                // Draw axis arrow
                const arrowX = axisX * radius;
                const arrowY = -axisY * radius;
                ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
                ctx.beginPath();
                ctx.moveTo(arrowX, arrowY);
                ctx.lineTo(arrowX - 5, arrowY - 5);
                ctx.lineTo(arrowX + 5, arrowY - 5);
                ctx.closePath();
                ctx.fill();
            }
                
            // Draw antipodal point if enabled
            if (showAntipodes) {
                // Antipodal quaternion is -q
                // Use stereographic projection from south pole for antipode
                let antiX, antiY;
                if (Math.abs(1 + qw) > 1e-6) {
                    const antiScale = radius / (1.0001 + qw);
                    antiX = -x * antiScale;
                    antiY = y * antiScale;
                } else {
                    antiX = -x * radius * 10;
                    antiY = y * radius * 10;
                }
                
                // Limit projection
                const antiDist = Math.sqrt(antiX*antiX + antiY*antiY);
                if (antiDist > maxDist) {
                    const scaleFactor = maxDist / antiDist;
                    antiX *= scaleFactor;
                    antiY *= scaleFactor;
                }
                
                ctx.fillStyle = `hsla(${(hue + 60) % 360}, 100%, 50%, 0.5)`;
                ctx.beginPath();
                ctx.arc(antiX, antiY, ringSize, 0, 2 * Math.PI);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Connect with geodesic
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                for (let t = 0; t <= 1; t += 0.02) {
                    const interpX = finalX * (1 - t) + antiX * t;
                    const interpY = finalY * (1 - t) + antiY * t;
                    const arcHeight = Math.sin(t * Math.PI) * radius * 0.3;
                    
                    if (t === 0) ctx.moveTo(interpX, interpY - arcHeight);
                    else ctx.lineTo(interpX, interpY - arcHeight);
                }
                ctx.stroke();
                ctx.setLineDash([]);
            }
                
            // Display angle value and quaternion info
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(`θ = ${(angle * 180 / Math.PI).toFixed(1)}°`, finalX + ringSize + 5, finalY - 5);
            
            // Show quaternion values at bottom
            ctx.font = '11px monospace';
            ctx.fillStyle = '#64ffda';
            const quatStr = `q = [${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)}, ${qw.toFixed(3)}]`;
            ctx.fillText(quatStr, -80, radius + 25);
            
            // Show Euler angles for reference
            const [yaw, pitch, roll] = qToEulerZYX(currentQuaternion);
            ctx.fillStyle = '#ffaa00';
            const eulerStr = `Euler: Y=${rad2deg(yaw).toFixed(0)}° P=${rad2deg(pitch).toFixed(0)}° R=${rad2deg(roll).toFixed(0)}°`;
            ctx.fillText(eulerStr, -80, radius + 40);
            
            // Draw SLERP geodesic if we have two orientations
            if (window.orientationA && window.orientationB && window.orientationA !== currentQuaternion) {
                // Draw geodesic path between orientationA and orientationB
                ctx.strokeStyle = 'rgba(100, 255, 218, 0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                for (let t = 0; t <= 1; t += 0.02) {
                    const qInterp = qSlerp(window.orientationA, window.orientationB, t);
                    const [xi, yi, zi, wi] = qInterp;
                    const angleI = 2 * Math.acos(Math.min(1, Math.max(-1, Math.abs(wi))));
                    
                    if (angleI > 1e-6) {
                        const axisLenI = Math.sin(angleI / 2);
                        const axisI = [xi / axisLenI, yi / axisLenI, zi / axisLenI];
                        const pX = axisI[0] * radius * 0.9;
                        const pY = -axisI[1] * radius * 0.9;
                        
                        if (t === 0) ctx.moveTo(pX, pY);
                        else ctx.lineTo(pX, pY);
                    }
                }
                ctx.stroke();
            }
            
            ctx.restore();
        };

        // Calculate condition number using proper Jacobian
        const eulerCondition = (yaw, pitch, roll) => {
            const base = qFromEulerZYX(yaw, pitch, roll);
            const h = 1e-4;
            const J = [];
            
            // Finite differences for Jacobian columns
            for (const [dy, dp, dr] of [[h, 0, 0], [0, h, 0], [0, 0, h]]) {
                const q2 = qFromEulerZYX(yaw + dy, pitch + dp, roll + dr);
                const dq = qMul(q2, qConj(base));
                
                // Log map: for small angles, axis ≈ (x,y,z)/2
                const angle = 2 * Math.acos(Math.min(1, Math.abs(dq[3])));
                if (angle < 1e-6) {
                    J.push([0, 0, 0]);
                } else {
                    const s = Math.sin(angle / 2);
                    J.push([
                        (dq[0] / s) * (angle / h),
                        (dq[1] / s) * (angle / h),
                        (dq[2] / s) * (angle / h)
                    ]);
                }
            }
            
            // Compute J^T * J for condition number
            const JTJ = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ];
            
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    for (let k = 0; k < 3; k++) {
                        JTJ[i][j] += J[k][i] * J[k][j];
                    }
                }
            }
            
            // Simplified eigenvalue calculation for 3x3 symmetric matrix
            // Using power iteration for largest eigenvalue
            let v = [1, 0, 0];
            let lambda_max = 0;
            for (let iter = 0; iter < 10; iter++) {
                const Av = [
                    JTJ[0][0]*v[0] + JTJ[0][1]*v[1] + JTJ[0][2]*v[2],
                    JTJ[1][0]*v[0] + JTJ[1][1]*v[1] + JTJ[1][2]*v[2],
                    JTJ[2][0]*v[0] + JTJ[2][1]*v[1] + JTJ[2][2]*v[2]
                ];
                lambda_max = Math.sqrt(Av[0]*Av[0] + Av[1]*Av[1] + Av[2]*Av[2]);
                if (lambda_max > 1e-12) {
                    v = [Av[0]/lambda_max, Av[1]/lambda_max, Av[2]/lambda_max];
                }
            }
            
            // Estimate smallest eigenvalue using trace and determinant
            const trace = JTJ[0][0] + JTJ[1][1] + JTJ[2][2];
            const det = JTJ[0][0] * (JTJ[1][1] * JTJ[2][2] - JTJ[1][2] * JTJ[2][1]) -
                       JTJ[0][1] * (JTJ[1][0] * JTJ[2][2] - JTJ[1][2] * JTJ[2][0]) +
                       JTJ[0][2] * (JTJ[1][0] * JTJ[2][1] - JTJ[1][1] * JTJ[2][0]);
            
            const lambda_min = Math.max(1e-12, Math.min(lambda_max, det / (lambda_max * trace - lambda_max * lambda_max)));
            return Math.sqrt(lambda_max / lambda_min);
        };

        // Heatmap visualization with proper Jacobian and torus topology
        const drawHeatmap = () => {
            const canvas = document.getElementById('heatmapCanvas');
            const ctx = heatmapCtx;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            
            ctx.clearRect(0, 0, width, height);
            
            const fixedPitch = deg2rad(parseFloat(document.getElementById('heatmapPitchSlider').value));
            const resolution = 64;
            
            // Calculate condition numbers for the grid
            let maxCond = 0;
            const conditionGrid = [];
            
            for (let i = 0; i < resolution; i++) {
                conditionGrid[i] = [];
                for (let j = 0; j < resolution; j++) {
                    const yaw = (i / resolution - 0.5) * 2 * Math.PI;
                    const roll = (j / resolution - 0.5) * 2 * Math.PI;
                    
                    const cond = eulerCondition(yaw, fixedPitch, roll);
                    conditionGrid[i][j] = cond;
                    maxCond = Math.max(maxCond, Math.min(cond, 1000));
                }
            }
            
            if (showTorusView) {
                // Draw as torus (3D projection)
                ctx.save();
                ctx.translate(width/2, height/2);
                
                const majorRadius = Math.min(width, height) * 0.25;
                const minorRadius = majorRadius * 0.4;
                
                // Draw torus mesh
                for (let i = 0; i < resolution; i++) {
                    for (let j = 0; j < resolution; j++) {
                        const theta = (i / resolution) * 2 * Math.PI - Math.PI; // Yaw
                        const phi = (j / resolution) * 2 * Math.PI - Math.PI; // Roll
                        
                        // Torus parametric equations with perspective
                        const torusX = (majorRadius + minorRadius * Math.cos(phi)) * Math.cos(theta);
                        const torusY = (majorRadius + minorRadius * Math.cos(phi)) * Math.sin(theta) * 0.5;
                        const torusZ = minorRadius * Math.sin(phi);
                        
                        // Simple perspective projection
                        const perspective = 1 + torusY / 500;
                        const projX = torusX * perspective;
                        const projY = (torusZ - torusY * 0.3) * perspective;
                        
                        // Get condition value and color
                        const cond = conditionGrid[i][j];
                        const logCond = Math.log10(Math.max(1, Math.min(cond, 1000)));
                        const normalizedValue = logCond / 3;
                        
                        let r, g, b;
                        if (normalizedValue < 0.25) {
                            const t = normalizedValue * 4;
                            r = 0;
                            g = Math.floor(100 * t);
                            b = 255 - Math.floor(155 * t);
                        } else if (normalizedValue < 0.5) {
                            const t = (normalizedValue - 0.25) * 4;
                            r = 0;
                            g = 100 + Math.floor(155 * t);
                            b = Math.floor(100 * (1 - t));
                        } else if (normalizedValue < 0.75) {
                            const t = (normalizedValue - 0.5) * 4;
                            r = Math.floor(255 * t);
                            g = Math.floor(255 * (1 - t));
                            b = 0;
                        } else {
                            const t = Math.min(1, (normalizedValue - 0.75) * 4);
                            r = 255;
                            g = Math.floor(255 * t);
                            b = 0;
                        }
                        
                        // Draw point with depth-based size and opacity
                        const depth = torusY + majorRadius;
                        const opacity = 0.3 + 0.7 * (1 - depth / (2 * majorRadius));
                        const size = 3 + depth / majorRadius;
                        
                        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                        ctx.beginPath();
                        ctx.arc(projX, projY, size, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                }
                
                // Draw coordinate labels on torus
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                
                // Draw major circle (yaw)
                ctx.beginPath();
                ctx.arc(0, 0, majorRadius, 0, 2 * Math.PI);
                ctx.stroke();
                
                // Draw labels
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px sans-serif';
                ctx.fillText('Yaw →', majorRadius + 10, 0);
                ctx.fillText('Roll ↻', 0, -majorRadius - minorRadius - 10);
                
                ctx.restore();
                
                // Add topology note
                ctx.fillStyle = 'rgba(100, 255, 218, 0.8)';
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText('Torus View: Angles wrap at ±180°', 10, height - 10);
            } else {
                // Original flat view
                const imageData = ctx.createImageData(resolution, resolution);
                const data = imageData.data;
                
                // Render with proper logarithmic scaling
                for (let i = 0; i < resolution; i++) {
                    for (let j = 0; j < resolution; j++) {
                        const cond = conditionGrid[i][j];
                        const logCond = Math.log10(Math.max(1, Math.min(cond, 1000)));
                        const normalizedValue = logCond / 3;
                        
                        // Add wrapping indicators at edges
                        const isEdgeX = (i === 0 || i === resolution - 1);
                        const isEdgeY = (j === 0 || j === resolution - 1);
                        
                        const pixelIndex = (j * resolution + i) * 4;
                        
                        if (normalizedValue < 0.25) {
                            const t = normalizedValue * 4;
                            data[pixelIndex] = 0;
                            data[pixelIndex + 1] = Math.floor(100 * t);
                            data[pixelIndex + 2] = 255 - Math.floor(155 * t);
                        } else if (normalizedValue < 0.5) {
                            const t = (normalizedValue - 0.25) * 4;
                            data[pixelIndex] = 0;
                            data[pixelIndex + 1] = 100 + Math.floor(155 * t);
                            data[pixelIndex + 2] = Math.floor(100 * (1 - t));
                        } else if (normalizedValue < 0.75) {
                            const t = (normalizedValue - 0.5) * 4;
                            data[pixelIndex] = Math.floor(255 * t);
                            data[pixelIndex + 1] = Math.floor(255 * (1 - t));
                            data[pixelIndex + 2] = 0;
                        } else {
                            const t = Math.min(1, (normalizedValue - 0.75) * 4);
                            data[pixelIndex] = 255;
                            data[pixelIndex + 1] = Math.floor(255 * t);
                            data[pixelIndex + 2] = 0;
                        }
                        
                        // Highlight edges to show wrapping
                        if (isEdgeX || isEdgeY) {
                            data[pixelIndex + 3] = 200;
                        } else {
                            data[pixelIndex + 3] = 255;
                        }
                    }
                }
                
                // Scale up the heatmap
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = resolution;
                tempCanvas.height = resolution;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.putImageData(imageData, 0, 0);
                
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(tempCanvas, 0, 0, width, height);
                
                // Draw wrapping indicators
                ctx.strokeStyle = 'rgba(100, 255, 218, 0.5)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                
                // Top-bottom wrap
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, height);
                ctx.moveTo(width, 0);
                ctx.lineTo(width, height);
                ctx.stroke();
                
                // Left-right wrap
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(width, 0);
                ctx.moveTo(0, height);
                ctx.lineTo(width, height);
                ctx.stroke();
                
                ctx.setLineDash([]);
                
                // Draw labels and scale
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px sans-serif';
                ctx.fillText('Yaw [-180°, 180°] →', width - 120, height - 10);
                ctx.save();
                ctx.translate(15, height/2);
                ctx.rotate(-Math.PI/2);
                ctx.fillText('Roll [-180°, 180°] →', 0, 0);
                ctx.restore();
            }
            
            // Add pitch value indicator
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = Math.abs(fixedPitch) > deg2rad(80) ? '#ff6b6b' : '#64ffda';
            ctx.fillText(`Pitch: ${rad2deg(fixedPitch).toFixed(0)}°`, 10, 20);
            
            // Add singularity warning if near gimbal lock
            if (Math.abs(Math.cos(fixedPitch)) < 0.15) {
                ctx.fillStyle = '#ffff00';
                ctx.font = 'bold 16px sans-serif';
                ctx.fillText('⚠️ NEAR SINGULARITY!', width/2 - 80, 25);
            }
        };

        // SLERP comparison visualization
        let orientationA = [0, 0, 0, 1];
        let orientationB = qFromEulerZYX(deg2rad(90), deg2rad(45), deg2rad(30));

        const drawSlerpComparison = () => {
            const canvas = document.getElementById('slerpCanvas');
            const ctx = slerpCtx;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            
            ctx.clearRect(0, 0, width, height);
            
            const t = parseFloat(document.getElementById('tSlider').value);
            
            // Get Euler angles for start and end orientations
            const eulerA = qToEulerZYX(orientationA);
            const eulerB = qToEulerZYX(orientationB);
            
            // Draw interpolation paths
            ctx.lineWidth = 2;
            
            // Collect path points
            const slerpPath = [];
            const eulerPath = [];
            
            for (let i = 0; i <= 100; i++) {
                const t_i = i / 100;
                
                // SLERP path
                const qSlerped = qSlerp(orientationA, orientationB, t_i);
                const [axis, angle] = qToAxisAngle(qSlerped);
                slerpPath.push(angle);
                
                // Euler LERP path - actual Euler angle interpolation
                const interpYaw = eulerA[0] + (eulerB[0] - eulerA[0]) * t_i;
                const interpPitch = eulerA[1] + (eulerB[1] - eulerA[1]) * t_i;
                const interpRoll = eulerA[2] + (eulerB[2] - eulerA[2]) * t_i;
                const qEuler = qFromEulerZYX(interpYaw, interpPitch, interpRoll);
                const [axisE, angleE] = qToAxisAngle(qEuler);
                eulerPath.push(angleE);
            }
            
            // Normalize paths for visualization
            const maxAngle = Math.max(...slerpPath, ...eulerPath);
            const minAngle = Math.min(...slerpPath, ...eulerPath);
            const angleRange = maxAngle - minAngle || 1;
            
            // SLERP path (blue)
            ctx.strokeStyle = '#2196f3';
            ctx.beginPath();
            for (let i = 0; i <= 100; i++) {
                const x = width * 0.1 + (width * 0.8) * (i / 100);
                const normalizedAngle = (slerpPath[i] - minAngle) / angleRange;
                const y = height * 0.4 - normalizedAngle * height * 0.25;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            
            // Euler LERP path (red) - shows actual interpolation issues
            ctx.strokeStyle = '#f44336';
            ctx.beginPath();
            for (let i = 0; i <= 100; i++) {
                const x = width * 0.1 + (width * 0.8) * (i / 100);
                const normalizedAngle = (eulerPath[i] - minAngle) / angleRange;
                const y = height * 0.7 - normalizedAngle * height * 0.25;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            
            // Draw current position markers
            const currentX = width * 0.1 + (width * 0.8) * t;
            const currentIndex = Math.floor(t * 100);
            
            // SLERP position
            ctx.fillStyle = '#2196f3';
            ctx.beginPath();
            const slerpNormalized = (slerpPath[currentIndex] - minAngle) / angleRange;
            const slerpY = height * 0.4 - slerpNormalized * height * 0.25;
            ctx.arc(currentX, slerpY, 6, 0, 2 * Math.PI);
            ctx.fill();
            
            // Euler LERP position
            ctx.fillStyle = '#f44336';
            ctx.beginPath();
            const eulerNormalized = (eulerPath[currentIndex] - minAngle) / angleRange;
            const eulerY = height * 0.7 - eulerNormalized * height * 0.25;
            ctx.arc(currentX, eulerY, 6, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw angle values
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px sans-serif';
            ctx.fillText(`Angle: ${(slerpPath[currentIndex] * 180 / Math.PI).toFixed(1)}°`, currentX - 20, slerpY - 10);
            ctx.fillText(`Angle: ${(eulerPath[currentIndex] * 180 / Math.PI).toFixed(1)}°`, currentX - 20, eulerY + 20);
            
            // Labels
            ctx.fillStyle = '#2196f3';
            ctx.font = '14px sans-serif';
            ctx.fillText('SLERP (Smooth)', 20, height * 0.2);
            
            ctx.fillStyle = '#f44336';
            ctx.fillText('Euler LERP (Jerky)', 20, height * 0.9);
        };

        // Event handlers
        const updateFromSliders = () => {
            const yaw = deg2rad(parseFloat(document.getElementById('yawSlider').value));
            const pitch = deg2rad(parseFloat(document.getElementById('pitchSlider').value));
            const roll = deg2rad(parseFloat(document.getElementById('rollSlider').value));
            
            currentQuaternion = qFromEulerZYX(yaw, pitch, roll);
            
            // Drift correction - renormalize quaternion periodically
            frameCount++;
            if (frameCount % 10 === 0) {
                currentQuaternion = qNorm(currentQuaternion);
                
                // Keep history for continuity
                quaternionHistory.push([...currentQuaternion]);
                if (quaternionHistory.length > 10) {
                    quaternionHistory.shift();
                }
                
                // Ensure continuity by checking dot product with previous
                if (quaternionHistory.length > 1) {
                    const prev = quaternionHistory[quaternionHistory.length - 2];
                    const dot = qDot(currentQuaternion, prev);
                    if (dot < 0) {
                        // Flip sign to maintain continuity
                        currentQuaternion = currentQuaternion.map(v => -v);
                        quaternionHistory[quaternionHistory.length - 1] = currentQuaternion;
                    }
                }
            }
            
            // Update displays
            document.getElementById('yawValue').textContent = `${rad2deg(yaw).toFixed(0)}°`;
            document.getElementById('pitchValue').textContent = `${rad2deg(pitch).toFixed(0)}°`;
            document.getElementById('rollValue').textContent = `${rad2deg(roll).toFixed(0)}°`;
            
            // Update quaternion display
            document.getElementById('quatX').textContent = currentQuaternion[0].toFixed(3);
            document.getElementById('quatY').textContent = currentQuaternion[1].toFixed(3);
            document.getElementById('quatZ').textContent = currentQuaternion[2].toFixed(3);
            document.getElementById('quatW').textContent = currentQuaternion[3].toFixed(3);
            
            // Redraw visualizations
            drawGimbal();
            
            // Ensure quaternion sphere updates - call directly
            if (quaternionCtx) {
                drawQuaternionSphere();
            }
        };

        // Initialize everything
        const init = () => {
            // Initialize Three.js for gimbal visualization
            initThreeJS();
            
            // Initialize other canvas contexts
            quaternionCtx = document.getElementById('quaternionCanvas').getContext('2d');
            heatmapCtx = document.getElementById('heatmapCanvas').getContext('2d');
            slerpCtx = document.getElementById('slerpCanvas').getContext('2d');
            
            resizeCanvases();
            
            // Set up slider event listeners
            ['yawSlider', 'pitchSlider', 'rollSlider'].forEach(id => {
                document.getElementById(id).addEventListener('input', updateFromSliders);
            });
            
            document.getElementById('heatmapPitchSlider').addEventListener('input', () => {
                const pitch = parseFloat(document.getElementById('heatmapPitchSlider').value);
                document.getElementById('heatmapPitchValue').textContent = `${pitch}°`;
                drawHeatmap();
            });
            
            document.getElementById('tSlider').addEventListener('input', () => {
                const t = parseFloat(document.getElementById('tSlider').value);
                document.getElementById('tValue').textContent = t.toFixed(2);
                drawSlerpComparison();
            });
            
            document.getElementById('showAntipodes').addEventListener('click', () => {
                showAntipodes = !showAntipodes;
                document.getElementById('showAntipodes').textContent = 
                    showAntipodes ? 'Hide Antipodal Points' : 'Show Antipodal Points (±q)';
                drawQuaternionSphere();
            });
            
            document.getElementById('setRandomOrientations').addEventListener('click', () => {
                orientationA = qFromAxisAngle([Math.random()-0.5, Math.random()-0.5, Math.random()-0.5], Math.random() * Math.PI);
                orientationB = qFromAxisAngle([Math.random()-0.5, Math.random()-0.5, Math.random()-0.5], Math.random() * Math.PI);
                // Store globally for geodesic visualization
                window.orientationA = orientationA;
                window.orientationB = orientationB;
                drawSlerpComparison();
                drawQuaternionSphere(); // Redraw to show geodesic
            });
            
            let heatmapAnimating = false;
            document.getElementById('animateHeatmap').addEventListener('click', () => {
                if (heatmapAnimating) return;
                heatmapAnimating = true;
                
                let pitch = -90;
                const animate = () => {
                    document.getElementById('heatmapPitchSlider').value = pitch;
                    document.getElementById('heatmapPitchValue').textContent = `${pitch}°`;
                    drawHeatmap();
                    
                    pitch += 2;
                    if (pitch <= 90) {
                        setTimeout(animate, 50);
                    } else {
                        heatmapAnimating = false;
                    }
                };
                animate();
            });
            
            document.getElementById('toggleTorusView').addEventListener('click', () => {
                showTorusView = !showTorusView;
                document.getElementById('toggleTorusView').textContent =
                    showTorusView ? 'Switch to Flat View' : 'Switch to Torus View';
                drawHeatmap();
            });
            
            let interpAnimating = false;
            document.getElementById('animateInterp').addEventListener('click', () => {
                if (interpAnimating) return;
                interpAnimating = true;
                
                let t = 0;
                const animate = () => {
                    document.getElementById('tSlider').value = t;
                    document.getElementById('tValue').textContent = t.toFixed(2);
                    drawSlerpComparison();
                    
                    t += 0.01;
                    if (t <= 1) {
                        setTimeout(animate, 20);
                    } else {
                        interpAnimating = false;
                        // Reset
                        setTimeout(() => {
                            t = 0;
                            document.getElementById('tSlider').value = t;
                            document.getElementById('tValue').textContent = t.toFixed(2);
                            drawSlerpComparison();
                        }, 500);
                    }
                };
                animate();
            });
            
            // Initial draw
            updateFromSliders();
            drawHeatmap();
            drawSlerpComparison();
        };

        // Handle window resize
        window.addEventListener('resize', () => {
            setTimeout(() => {
                resizeCanvases();
                resizeThreeJS();
                updateFromSliders();
                drawHeatmap();
                drawSlerpComparison();
            }, 100);
        });

        // Start when page loads
        document.addEventListener('DOMContentLoaded', init);

    </script>
</body>
</html>
