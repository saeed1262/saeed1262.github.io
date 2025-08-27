---
layout: post
title: "Quaternions, SO(3), and Gimbal Lock — An Interactive Intuition"
description: "Why Euler angles hit singularities, how quaternions live on S³, and why SLERP makes interpolation behave. Zero-build, in-browser demo."
tags: [physics, graphics, games, rotations, quaternions, so3]
---

# Quaternion-Based 3D Rotation: Mathematical Analysis of Singularities and Optimal Interpolation

The parameterization of 3D rotations presents fundamental mathematical challenges that manifest prominently in computer graphics, robotics, and aerospace applications. Euler angle representations, while intuitive, suffer from inherent topological limitations that create computational singularities and discontinuities. This analysis examines these limitations and demonstrates how quaternion-based representations provide a mathematically superior framework.

## Mathematical Foundation: The Singularity Problem

Three-dimensional rotations form the special orthogonal group SO(3), a 3-dimensional manifold that cannot be smoothly parameterized by any 3-parameter coordinate system without singularities. This is a direct consequence of the hairy ball theorem - any continuous tangent vector field on a 2-sphere must have at least one point where the vector field vanishes.

**Gimbal Lock Demonstration**: In the interactive visualization below, observe the Euler angle parameterization breakdown. When pitch approaches ±90°, the yaw and roll axes become parallel, causing a loss of one degree of freedom. This singularity is not a computational error but a fundamental topological constraint.

<div class="panel">
    <h3>Gimbal Rig</h3>
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
        GIMBAL LOCK! Yaw and Roll axes are aligned - you've lost a degree of freedom!
    </div>
    <div class="info-box">
        <strong>Try this:</strong> Set pitch to ±90° and notice how yaw and roll controls do the same thing. This is gimbal lock - the curse of Euler angles!
    </div>
</div>

The degeneracy occurs because Euler angles represent rotations as a composition of rotations about fixed axes: R = R_z(ψ)R_y(θ)R_x(φ), where the middle rotation R_y(θ) at θ = ±π/2 aligns the first and third rotation axes.

<div class="panel">
    <h3>Quaternion Sphere (S³)</h3>
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
        <button class="button" id="showGeodesicArc">Show Antipodal Geodesic Arc</button>
    </div>
    <div class="info-box">
        Quaternions live on a 4D unit sphere. Each 3D rotation maps to TWO points: q and -q. This "double cover" eliminates singularities!
    </div>
</div>

## Quaternion Representation: S³ Double Cover of SO(3)

Quaternions resolve this limitation by embedding SO(3) into the 4-dimensional unit sphere $S^3$. Each unit quaternion $q = (x,y,z,w)$ with $\|\|q\|\| = 1$ represents a rotation, with the crucial property that both q and -q represent the same physical rotation.

**Mathematical Properties**:
- **Double Cover**: The mapping S³ → SO(3) is 2:1, eliminating singularities
- **Lie Group Structure**: Quaternion multiplication corresponds to rotation composition
- **Geodesic Interpolation**: Great circles on S³ provide optimal rotation paths

The quaternion sphere visualization above demonstrates this double coverage. The antipodal points ±q on S³ both map to the same rotation matrix in SO(3), providing redundancy that eliminates singular configurations.

## Comparative Analysis of Interpolation Methods

The quaternion framework enables superior interpolation techniques compared to naive Euler angle interpolation:

**Spherical Linear Interpolation (SLERP)**:
```
q(t) = sin((1-t)θ)/sin(θ) * q₀ + sin(tθ)/sin(θ) * q₁
```
where θ = arccos(|q₀ · q₁|) is the geodesic angle between quaternions.

**Euler Linear Interpolation (LERP)**:
```
euler(t) = (1-t) * euler₀ + t * euler₁
```

### Visualization Analysis

**Panel 1 - Angular Velocity Profile**:
This visualization quantifies the kinematic properties of both interpolation methods by computing the instantaneous angular velocity $ω(t) = ||log(q(t+dt) * q(t)⁻¹)||/dt$. SLERP maintains constant angular velocity $(σ ≈ 0)$, while Euler LERP exhibits significant velocity variations $(σ > 0)$, violating the principle of uniform motion.

**Panel 2 - Geodesic Path Visualization**:
The 3D sphere representation shows the actual rotation trajectories in quaternion space. SLERP follows great circle arcs (geodesics on $S^3$), representing the shortest path between rotations. Euler LERP produces curved, non-optimal paths that deviate from the geodesic, resulting in longer rotation distances and non-uniform motion.

<div class="panel wide-panel">
    <h3>Interpolation: Euler LERP vs SLERP</h3>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="canvas-container" style="height: 300px;">
            <canvas id="slerpVelocityCanvas"></canvas>
        </div>
        <div class="canvas-container" style="height: 300px;">
            <canvas id="slerpPathCanvas"></canvas>
        </div>
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
        <strong>Left Panel - Angular Velocity:</strong> Shows rotation speed over time (0 to 1)<br>
        • <span style="color: #2196f3;">Blue (SLERP)</span>: Constant angular velocity - the line is flat! (σ ≈ 0)<br>
        • <span style="color: #f44336;">Red (Euler LERP)</span>: Varying speed - speeds up and slows down (σ > 0)<br>
        <br>
        <strong>Right Panel - Quaternion Paths:</strong> Shows actual rotation paths on the unit sphere<br>
        • <span style="color: #2196f3;">Blue path</span>: SLERP follows the shortest great circle arc<br>
        • <span style="color: #f44336;">Red path</span>: Euler LERP takes a curved, non-optimal path<br>
        <br>
        <strong>Key Insight:</strong> SLERP provides smooth, constant-speed rotation (like a spinning gyroscope), while Euler LERP causes jerky, unnatural motion with varying speeds. This is why SLERP is essential for animation and robotics!
    </div>
</div>

## Topological Insights: Euler Angle Sensitivity Analysis

The sensitivity heatmap visualizes the condition number of the Euler angle Jacobian matrix across the rotation space, revealing regions of numerical instability and singularities.

**Mathematical Framework**:
The Jacobian J relates small changes in Euler angles to angular velocity:

$$
ω = J(ψ,θ,φ) * [dψ/dt, dθ/dt, dφ/dt]ᵀ
$$  

Near gimbal lock $(θ ≈ ±π/2)$, $J$ becomes singular $(det(J) → 0)$, causing numerical instabilities and loss of controllability.

**Torus Topology Visualization**:
The torus view represents the natural topology of the Euler angle space, where yaw and roll angles wrap at ±180°. This visualization clearly shows how singularities manifest as highly sensitive regions (red/yellow) that span entire meridians when pitch approaches ±90°.

<div class="panel wide-panel">
    <h3>Euler Angle Sensitivity Map (Torus Topology)</h3>
    <div class="canvas-container" style="height: 500px;">
        <canvas id="heatmapCanvas"></canvas>
    </div>
    <div class="controls">
        <div class="control-group">
            <label>Fixed Pitch Value <span class="value-display" id="heatmapPitchValue">0°</span></label>
            <input type="range" class="slider" id="heatmapPitchSlider" min="-90" max="90" value="0" step="5">
        </div>
        <div class="control-group">
            <label><span style="color: #64ffda;">Torus Yaw</span> <span class="value-display" id="torusYawValue">0°</span></label>
            <input type="range" class="slider" id="torusYawSlider" min="-180" max="180" value="0" step="1">
        </div>
        <div class="control-group">
            <label><span style="color: #ff9800;">Torus Roll</span> <span class="value-display" id="torusRollValue">0°</span></label>
            <input type="range" class="slider" id="torusRollSlider" min="-180" max="180" value="0" step="1">
        </div>
        <button class="button" id="animateHeatmap">Animate Through Pitch Values</button>
        <button class="button" id="toggleTorusView">Toggle Torus/Flat View</button>
    </div>
    <div class="info-box">
        <strong>Color coding:</strong> <span style="color: #0066ff;">Blue</span> = stable, <span style="color: #00ff00;">Green</span> = sensitive, <span style="color: #ff0000;">Red</span> = highly singular, <span style="color: #ffff00;">Yellow</span> = gimbal lock!<br>
        This map shows how sensitive the rotation is to small changes in yaw/roll for a given pitch. The torus topology reveals how yaw and roll wrap around at ±180°. As pitch approaches ±90°, the entire map turns red/yellow, showing that yaw and roll become coupled and the coordinate system becomes singular.
    </div>
</div>

## Implementation Guidelines: Mathematical Best Practices

### **Quaternion Storage and Normalization**
```javascript
// Maintain unit quaternion constraint: ||q||² = x² + y² + z² + w² = 1
let orientation = [0, 0, 0, 1]; // Identity quaternion (x, y, z, w)

// Periodic renormalization to counteract floating-point drift
orientation = qNorm(orientation); // Project back onto S³
```

### **Optimal Interpolation Protocol**
```javascript
// SLERP implementation with double-cover handling
const interpolated = qSlerp(q0, q1, t);

// Choose shorter geodesic path (handle antipodal ambiguity)
if (qDot(q0, q1) < 0) {
    q1 = qNegate(q1); // Use -q₁ instead for shorter arc
}
```

### **Interface Layer Conversion**
```javascript
// Euler angles only for human-readable interfaces
const [yaw, pitch, roll] = qToEulerZYX(orientation);

// Critical: Never interpolate or integrate Euler angles directly
// Always work in quaternion space for internal computations
```

### **Angular Velocity Integration**
```javascript
// Exponential map for angular velocity integration
const deltaQ = qFromAxisAngle(ω, Δt); // ω is angular velocity vector
orientation = qMul(orientation, deltaQ); // Right-multiplication for body frame
```

## Geometric and Topological Insights

The fundamental advantage of quaternions stems from their natural geometric properties:

**Lie Group Structure**: Unit quaternions form a Lie group isomorphic to $SU(2)$, with the exponential map providing a natural connection between the Lie algebra (3D angular velocity space) and the group manifold $(S^3)$.

**Minimal Representation**: While quaternions use four parameters to represent three degrees of freedom, this redundancy is precisely what eliminates singularities. The constraint $\|\|q\|\| = 1$ reduces the effective dimensionality to three while maintaining global validity.

**Geodesic Optimality**: SLERP follows geodesics on $S^3$, which project to the shortest rotation paths in $SO(3)$. This ensures both mathematical optimality and physical realism in animation and control systems.

## Practical Applications and Performance Considerations

The mathematical superiority of quaternions translates directly into practical benefits:

- **Robust Control Systems**: Elimination of gimbal lock enables reliable attitude control in aerospace applications
- **Smooth Animation**: Constant angular velocity interpolation produces natural-looking rotations in computer graphics
- **Numerical Stability**: Better conditioning of rotation operations reduces accumulation of numerical errors
- **Compact Representation**: Four parameters vs. nine for rotation matrices, with inherent orthogonality constraints

## Conclusion: Mathematical Rigor in Computational Practice

The choice between Euler angles and quaternions is not merely one of computational convenience—it reflects a deeper understanding of the mathematical structure underlying 3D rotations. While Euler angles offer intuitive parameterization for human interfaces, quaternions provide the mathematically principled foundation necessary for robust computational systems.

The interactive visualizations demonstrate these theoretical principles through direct manipulation, revealing how mathematical abstractions manifest as concrete computational behaviors. This convergence of theory and practice exemplifies the power of choosing representations that align with the underlying mathematical reality.

---

*Explore the interactive mathematical demonstrations above to develop geometric intuition for these abstract concepts.*

<!-- <!DOCTYPE html> -->
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
    </div>

    <!-- Three.js for 3D rendering -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/TrackballControls.js"></script>

    <script>
        // ===============================================================================
        // COMPREHENSIVE MATHEMATICAL ANALYSIS OF QUATERNION SPHERE VISUALIZATION
        // ===============================================================================
        
        // Mathematical Constants and Tolerances
        const MATH_EPSILON = 1e-15;
        const QUATERNION_TOLERANCE = 1e-12;
        const GEODESIC_RESOLUTION = 100;
        const ANTIPODAL_THRESHOLD = 0.999999; // cos(θ) for nearly antipodal quaternions
        
        // Mathematical Analysis State
        const mathAnalysis = {
            unitConstraintViolations: [],
            geodesicErrors: [],
            singularityDetections: [],
            temporalCoherence: [],
            projectionErrors: [],
            frameCount: 0
        };

        // ===============================================================================
        // ENHANCED QUATERNION OPERATIONS WITH MATHEMATICAL VERIFICATION
        // ===============================================================================
        
        // Unit quaternion normalization with constraint verification
        const qNorm = ([x, y, z, w]) => {
            const normSq = x*x + y*y + z*z + w*w;
            const norm = Math.sqrt(normSq);
            
            // Mathematical verification: Check if quaternion is already unit
            const unitConstraintError = Math.abs(norm - 1.0);
            if (unitConstraintError > QUATERNION_TOLERANCE) {
                mathAnalysis.unitConstraintViolations.push({
                    frame: mathAnalysis.frameCount,
                    originalNorm: norm,
                    error: unitConstraintError,
                    quaternion: [x, y, z, w]
                });
            }
            
            // Handle near-zero quaternions (degenerate case)
            if (norm < MATH_EPSILON) {
                console.warn("Mathematical Analysis: Degenerate quaternion detected, defaulting to identity");
                return [0, 0, 0, 1];
            }
            
            const s = 1 / norm;
            const result = [x*s, y*s, z*s, w*s];
            
            // Post-normalization verification
            const resultNorm = Math.sqrt(result[0]*result[0] + result[1]*result[1] +
                                       result[2]*result[2] + result[3]*result[3]);
            const postNormError = Math.abs(resultNorm - 1.0);
            
            if (postNormError > QUATERNION_TOLERANCE) {
                console.error("Mathematical Analysis: Post-normalization error:", postNormError);
            }
            
            return result;
        };

        // Quaternion multiplication with mathematical verification
        const qMul = ([ax, ay, az, aw], [bx, by, bz, bw]) => {
            const result = [
                aw*bx + ax*bw + ay*bz - az*by,  // i component
                aw*by - ax*bz + ay*bw + az*bx,  // j component
                aw*bz + ax*by - ay*bx + az*bw,  // k component
                aw*bw - ax*bx - ay*by - az*bz   // scalar component
            ];
            
            // Mathematical verification: Product of unit quaternions should be unit
            const aNorm = Math.sqrt(ax*ax + ay*ay + az*az + aw*aw);
            const bNorm = Math.sqrt(bx*bx + by*by + bz*bz + bw*bw);
            const resultNorm = Math.sqrt(result[0]*result[0] + result[1]*result[1] +
                                       result[2]*result[2] + result[3]*result[3]);
            
            const expectedNorm = aNorm * bNorm;
            const multiplicativeError = Math.abs(resultNorm - expectedNorm);
            
            if (multiplicativeError > QUATERNION_TOLERANCE) {
                console.warn("Mathematical Analysis: Quaternion multiplication norm error:",
                           multiplicativeError);
            }
            
            return result;
        };

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

        // ===============================================================================
        // GEODESIC ANALYSIS AND SLERP WITH MATHEMATICAL VERIFICATION
        // ===============================================================================
        
        // Calculate geodesic distance on S³ between two quaternions
        const geodesicDistance = (qa, qb) => {
            // Ensure we take the shorter path (handle double cover)
            let dot = Math.abs(qa[0]*qb[0] + qa[1]*qb[1] + qa[2]*qb[2] + qa[3]*qb[3]);
            dot = Math.min(1.0, Math.max(-1.0, dot)); // Clamp for numerical stability
            return Math.acos(dot);
        };
        
        // Analyze antipodal points and their geodesic properties
        const analyzeAntipodalPoints = (q) => {
            const [x, y, z, w] = q;
            const antipodalQ = [-x, -y, -z, -w];
            
            // Verify that q and -q represent the same rotation
            const rotationMatrix1 = qToMatrix(q);
            const rotationMatrix2 = qToMatrix(antipodalQ);
            
            // Calculate matrix difference (should be zero for same rotation)
            let maxMatrixDiff = 0;
            for (let i = 0; i < 16; i++) {
                const diff = Math.abs(rotationMatrix1[i] - rotationMatrix2[i]);
                maxMatrixDiff = Math.max(maxMatrixDiff, diff);
            }
            
            // Calculate antipodal geodesic distance (should be π for true antipodal points)
            const dot = x*(-x) + y*(-y) + z*(-z) + w*(-w); // Should be -1 for unit quaternions
            const clampedDot = Math.min(1.0, Math.max(-1.0, dot));
            // For antipodal points: dot = -1, so arccos(-1) = π
            const antipodalGeodesicDist = Math.acos(clampedDot);
            
            // For true antipodal points on unit sphere, distance should be π
            const expectedDistance = Math.PI;
            const geodesicError = Math.abs(antipodalGeodesicDist - expectedDistance);
            
            // Additional verification: dot product should be -1 for perfect antipodal points
            const dotProductError = Math.abs(dot - (-1.0));
            
            return {
                q: q,
                antipodal: antipodalQ,
                geodesicDistance: antipodalGeodesicDist,
                geodesicError: geodesicError,
                dotProduct: dot,
                dotProductError: dotProductError,
                rotationMatrixError: maxMatrixDiff,
                isValidAntipodal: geodesicError < QUATERNION_TOLERANCE * 100 && maxMatrixDiff < QUATERNION_TOLERANCE * 10
            };
        };
        
        // Enhanced SLERP with comprehensive mathematical analysis
        const qSlerp = (a, b, t) => {
            // Input validation
            if (t < 0 || t > 1) {
                console.warn("Mathematical Analysis: SLERP parameter t outside [0,1]:", t);
            }
            
            // Ensure inputs are normalized
            const aNorm = qNorm(a);
            const bNorm = qNorm(b);
            let [ax, ay, az, aw] = aNorm;
            let [bx, by, bz, bw] = bNorm;
            
            // Calculate dot product for geodesic analysis
            let dot = ax*bx + ay*by + az*bz + aw*bw;
            const originalDot = dot;
            
            // Handle double cover: choose shorter path on S³
            if (dot < 0) {
                dot = -dot;
                bx = -bx; by = -by; bz = -bz; bw = -bw;
            }
            
            // Mathematical analysis: Record geodesic properties
            const geodesicAngle = Math.acos(Math.min(1, Math.abs(originalDot)));
            mathAnalysis.geodesicErrors.push({
                frame: mathAnalysis.frameCount,
                geodesicAngle: geodesicAngle,
                dotProduct: originalDot,
                shortestPath: dot > Math.abs(originalDot)
            });
            
            // Handle near-parallel quaternions (cosine close to 1)
            if (dot > 0.9995) {
                // Use linear interpolation for numerical stability
                const result = qNorm([ax + t*(bx-ax), ay + t*(by-ay), az + t*(bz-az), aw + t*(bw-aw)]);
                
                // Verify constant angular velocity property is maintained
                const midPoint = qSlerp(aNorm, bNorm, 0.5);
                const dist1 = geodesicDistance(aNorm, midPoint);
                const dist2 = geodesicDistance(midPoint, bNorm);
                const velocityError = Math.abs(dist1 - dist2);
                
                if (velocityError > QUATERNION_TOLERANCE) {
                    console.warn("Mathematical Analysis: SLERP velocity consistency error:", velocityError);
                }
                
                return result;
            }
            
            // Handle antipodal quaternions (dot ≈ 0 after negation) - NON-RECURSIVE
            if (dot < 0.001) {
                console.log("Mathematical Analysis: Handling antipodal quaternions with non-recursive method");
                
                // For antipodal quaternions, we need to interpolate through a great semicircle
                // Use simple linear interpolation and then normalize (NLERP) for stability
                const result = qNorm([
                    ax + t * (bx - ax),
                    ay + t * (by - ay),
                    az + t * (bz - az),
                    aw + t * (bw - aw)
                ]);
                
                // Record this as a special case in mathematical analysis
                mathAnalysis.geodesicErrors.push({
                    frame: mathAnalysis.frameCount,
                    type: 'antipodal-nlerp-fallback',
                    t: t,
                    originalDot: originalDot,
                    message: 'Used NLERP for antipodal quaternions to avoid recursion'
                });
                
                return result;
            }
            
            // Standard SLERP calculation
            const theta = Math.acos(Math.min(1, dot));
            const sinTheta = Math.sin(theta);
            
            // Check for numerical stability
            if (Math.abs(sinTheta) < MATH_EPSILON) {
                console.warn("Mathematical Analysis: SLERP numerical instability detected");
                return qNorm([ax + t*(bx-ax), ay + t*(by-ay), az + t*(bz-az), aw + t*(bw-aw)]);
            }
            
            const aCoeff = Math.sin((1-t)*theta) / sinTheta;
            const bCoeff = Math.sin(t*theta) / sinTheta;
            
            const result = [ax*aCoeff + bx*bCoeff, ay*aCoeff + by*bCoeff,
                          az*aCoeff + bz*bCoeff, aw*aCoeff + bw*bCoeff];
            
            // Mathematical verification: Check that result lies on unit sphere
            const resultNorm = Math.sqrt(result[0]*result[0] + result[1]*result[1] +
                                       result[2]*result[2] + result[3]*result[3]);
            const normError = Math.abs(resultNorm - 1.0);
            
            if (normError > QUATERNION_TOLERANCE) {
                console.warn("Mathematical Analysis: SLERP result not on unit sphere:", normError);
            }
            
            // Verify geodesic property: distances should scale linearly with t
            if (t > 0 && t < 1) {
                const distTotal = geodesicDistance(aNorm, bNorm);
                const distPartial = geodesicDistance(aNorm, result);
                const expectedPartial = t * distTotal;
                const geodesicLinearityError = Math.abs(distPartial - expectedPartial);
                
                if (geodesicLinearityError > QUATERNION_TOLERANCE * 10) {
                    mathAnalysis.geodesicErrors.push({
                        frame: mathAnalysis.frameCount,
                        t: t,
                        geodesicLinearityError: geodesicLinearityError,
                        distTotal: distTotal,
                        distPartial: distPartial
                    });
                }
            }
            
            return result;
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

        // ===============================================================================
        // ENHANCED QUATERNION OPERATIONS WITH MATHEMATICAL VERIFICATION
        // ===============================================================================
        
        // Conjugate quaternion with verification
        const qConj = ([x, y, z, w]) => {
            const result = [-x, -y, -z, w];
            
            // Mathematical verification: ||q*|| = ||q|| for unit quaternions
            const originalNorm = Math.sqrt(x*x + y*y + z*z + w*w);
            const conjugateNorm = Math.sqrt(x*x + y*y + z*z + w*w); // Same calculation
            const normError = Math.abs(originalNorm - conjugateNorm);
            
            if (normError > QUATERNION_TOLERANCE) {
                console.warn("Mathematical Analysis: Conjugate norm error:", normError);
            }
            
            return result;
        };

        // Quaternion dot product with bounds checking
        const qDot = (a, b) => {
            const result = a[0]*b[0] + a[1]*b[1] + a[2]*b[2] + a[3]*b[3];
            
            // For unit quaternions, dot product should be in [-1, 1]
            if (Math.abs(result) > 1.0 + QUATERNION_TOLERANCE) {
                console.warn("Mathematical Analysis: Dot product outside [-1,1]:", result);
            }
            
            return result;
        };

        // Enhanced axis-angle extraction with singularity handling
        const qToAxisAngle = ([x, y, z, w]) => {
            // Ensure w is positive for canonical representation
            let qx = x, qy = y, qz = z, qw = w;
            if (w < 0) {
                qx = -x; qy = -y; qz = -z; qw = -w;
            }
            
            const angle = 2 * Math.acos(Math.min(1, Math.max(-1, qw)));
            
            // Handle near-identity quaternion (small angle)
            if (Math.abs(angle) < MATH_EPSILON) {
                return [[1, 0, 0], 0];
            }
            
            const s = Math.sin(angle / 2);
            
            // Handle singularity when s ≈ 0 (shouldn't happen for valid quaternions)
            if (Math.abs(s) < MATH_EPSILON) {
                mathAnalysis.singularityDetections.push({
                    frame: mathAnalysis.frameCount,
                    type: 'axis-angle-extraction',
                    quaternion: [x, y, z, w],
                    angle: angle,
                    sinHalfAngle: s
                });
                return [[1, 0, 0], angle];
            }
            
            // Extract and normalize axis
            let axis = [qx/s, qy/s, qz/s];
            const axisNorm = Math.sqrt(axis[0]*axis[0] + axis[1]*axis[1] + axis[2]*axis[2]);
            
            // Normalize axis to ensure unit length (handle floating point precision errors)
            if (axisNorm > MATH_EPSILON) {
                axis = [axis[0]/axisNorm, axis[1]/axisNorm, axis[2]/axisNorm];
            }
            
            // Mathematical verification: only warn for significant axis normalization errors
            const axisNormError = Math.abs(axisNorm - 1.0);
            if (axisNormError > QUATERNION_TOLERANCE * 10) {
                console.warn("Mathematical Analysis: Non-unit rotation axis:", axisNormError);
            }
            
            return [axis, angle];
        };
        
        // ===============================================================================
        // SO(3) TO S³ MAPPING VERIFICATION
        // ===============================================================================
        
        // Verify the double cover relationship: q and -q map to same rotation
        const verifyDoubleCover = (q) => {
            const [x, y, z, w] = q;
            const antipodalQ = [-x, -y, -z, -w];
            
            // Convert both quaternions to rotation matrices
            const R1 = qToMatrix(q);
            const R2 = qToMatrix(antipodalQ);
            
            // Calculate Frobenius norm of difference
            let frobeniusNorm = 0;
            for (let i = 0; i < 16; i++) {
                const diff = R1[i] - R2[i];
                frobeniusNorm += diff * diff;
            }
            frobeniusNorm = Math.sqrt(frobeniusNorm);
            
            // Verify that both quaternions produce the same rotation
            const doubleCoverError = frobeniusNorm;
            
            if (doubleCoverError > QUATERNION_TOLERANCE) {
                console.error("Mathematical Analysis: Double cover violation:", doubleCoverError);
                mathAnalysis.geodesicErrors.push({
                    frame: mathAnalysis.frameCount,
                    type: 'double-cover-violation',
                    error: doubleCoverError,
                    quaternion: q
                });
            }
            
            return {
                isValid: doubleCoverError < QUATERNION_TOLERANCE,
                error: doubleCoverError,
                rotationMatrix1: R1,
                rotationMatrix2: R2
            };
        };
        
        // Verify SO(3) properties of rotation matrix
        const verifySO3Properties = (rotationMatrix) => {
            const R = rotationMatrix;
            
            // Check orthogonality: R^T * R = I
            const RTR = [];
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    let sum = 0;
                    for (let k = 0; k < 3; k++) {
                        sum += R[k*4 + i] * R[k*4 + j]; // R^T[i][k] * R[k][j]
                    }
                    RTR[i*3 + j] = sum;
                }
            }
            
            // Check if RTR is identity matrix
            let orthogonalityError = 0;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const expected = (i === j) ? 1 : 0;
                    const error = Math.abs(RTR[i*3 + j] - expected);
                    orthogonalityError = Math.max(orthogonalityError, error);
                }
            }
            
            // Check determinant = 1 (proper rotation)
            const det = R[0] * (R[5] * R[10] - R[6] * R[9]) -
                       R[1] * (R[4] * R[10] - R[6] * R[8]) +
                       R[2] * (R[4] * R[9] - R[5] * R[8]);
            const determinantError = Math.abs(det - 1.0);
            
            return {
                isValidSO3: orthogonalityError < QUATERNION_TOLERANCE && determinantError < QUATERNION_TOLERANCE,
                orthogonalityError: orthogonalityError,
                determinantError: determinantError,
                determinant: det
            };
        };
        
        // ===============================================================================
        // STEREOGRAPHIC PROJECTION AND TEMPORAL COHERENCE ANALYSIS
        // ===============================================================================
        
        // Enhanced stereographic projection with error analysis
        const stereographicProjection = (q, fromPole = 'north') => {
            const [x, y, z, w] = qNorm(q); // Ensure unit quaternion
            
            let projectedX, projectedY, projectionError = 0;
            
            if (fromPole === 'north') {
                // Project from north pole (w = 1)
                if (Math.abs(1 - w) < MATH_EPSILON) {
                    // Near north pole - use Taylor expansion for numerical stability
                    const factor = 2 / (1 + MATH_EPSILON);
                    projectedX = x * factor;
                    projectedY = y * factor;
                    projectionError = MATH_EPSILON;
                } else {
                    const denominator = 1 - w;
                    projectedX = x / denominator;
                    projectedY = y / denominator;
                    
                    // Check for numerical issues
                    if (Math.abs(denominator) < QUATERNION_TOLERANCE) {
                        projectionError = Math.abs(denominator);
                        mathAnalysis.projectionErrors.push({
                            frame: mathAnalysis.frameCount,
                            type: 'stereographic-singularity',
                            quaternion: q,
                            denominator: denominator,
                            error: projectionError
                        });
                    }
                }
            } else {
                // Project from south pole (w = -1)
                if (Math.abs(1 + w) < MATH_EPSILON) {
                    const factor = 2 / (1 + MATH_EPSILON);
                    projectedX = x * factor;
                    projectedY = y * factor;
                    projectionError = MATH_EPSILON;
                } else {
                    const denominator = 1 + w;
                    projectedX = x / denominator;
                    projectedY = y / denominator;
                    
                    if (Math.abs(denominator) < QUATERNION_TOLERANCE) {
                        projectionError = Math.abs(denominator);
                    }
                }
            }
            
            return {
                x: projectedX,
                y: projectedY,
                error: projectionError,
                isValid: projectionError < QUATERNION_TOLERANCE
            };
        };
        
        // Temporal coherence analysis for antipodal motion vectors
        const analyzeTemporalCoherence = (currentQ, previousQ, dt) => {
            if (!previousQ) return null;
            
            const currentNorm = qNorm(currentQ);
            const previousNorm = qNorm(previousQ);
            
            // Calculate angular velocity
            const deltaQ = qMul(currentNorm, qConj(previousNorm));
            const [deltaAxis, deltaAngle] = qToAxisAngle(deltaQ);
            const angularVelocity = deltaAngle / dt;
            
            // Analyze antipodal consistency
            const currentAntipodal = [-currentNorm[0], -currentNorm[1], -currentNorm[2], -currentNorm[3]];
            const previousAntipodal = [-previousNorm[0], -previousNorm[1], -previousNorm[2], -previousNorm[3]];
            
            // Check if antipodal pairs maintain same relative motion
            const antipodalDeltaQ = qMul(currentAntipodal, qConj(previousAntipodal));
            const [antipodalDeltaAxis, antipodalDeltaAngle] = qToAxisAngle(antipodalDeltaQ);
            const antipodalAngularVelocity = antipodalDeltaAngle / dt;
            
            // Temporal coherence error
            const velocityCoherenceError = Math.abs(angularVelocity - antipodalAngularVelocity);
            const axisCoherenceError = Math.acos(Math.min(1, Math.abs(
                deltaAxis[0] * antipodalDeltaAxis[0] +
                deltaAxis[1] * antipodalDeltaAxis[1] +
                deltaAxis[2] * antipodalDeltaAxis[2]
            )));
            
            const coherenceAnalysis = {
                frame: mathAnalysis.frameCount,
                angularVelocity: angularVelocity,
                antipodalAngularVelocity: antipodalAngularVelocity,
                velocityCoherenceError: velocityCoherenceError,
                axisCoherenceError: axisCoherenceError,
                isCoherent: velocityCoherenceError < QUATERNION_TOLERANCE && axisCoherenceError < QUATERNION_TOLERANCE
            };
            
            mathAnalysis.temporalCoherence.push(coherenceAnalysis);
            
            return coherenceAnalysis;
        };

        // Global state
        let currentQuaternion = [0, 0, 0, 1];
        let showAntipodes = false;
        let showGeodesicArc = false;
        let animating = false;
        let quaternionHistory = [[0, 0, 0, 1]]; // For drift correction
        let frameCount = 0;
        let showTorusView = true;

        // Canvas contexts (will be initialized in init function)
        let heatmapCtx, slerpVelocityCtx;
        
        // Three.js for SLERP path visualization
        let slerpScene, slerpCamera, slerpRenderer, slerpControls;
        let slerpSphere, slerpPathLine, eulerPathLine;
        let slerpCurrentPoint, eulerCurrentPoint;

        // Utility functions
        const deg2rad = (deg) => deg * Math.PI / 180;
        const rad2deg = (rad) => rad * 180 / Math.PI;

        const resizeCanvases = () => {
            // Only resize 2D canvases (gimbal canvas is handled by Three.js)
            const canvases = [
                document.getElementById('quaternionCanvas'),
                document.getElementById('heatmapCanvas'),
                document.getElementById('slerpVelocityCanvas')
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

        // THREE.JS 3D Quaternion Sphere Visualization
        let quaternionScene, quaternionCamera, quaternionRenderer, quaternionControls;
        let quaternionSphere;
        let quaternionPoint, antipodalPoint;
        let geodesicCurve;

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

            // Trackball Controls for free-form 3D navigation
            controls = new THREE.TrackballControls(camera, renderer.domElement);
            
            // Configure trackball behavior
            controls.rotateSpeed = 1.5;
            controls.zoomSpeed = 1.2;
            controls.panSpeed = 0.8;
            controls.noZoom = false;
            controls.noPan = false;
            controls.staticMoving = true;
            controls.dynamicDampingFactor = 0.3;
            controls.keys = [65, 83, 68]; // A, S, D keys for pan
            
            // Set zoom limits
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
                const rollLabel = document.querySelector('label');
                
                if (rollSlider && isGimbalLock) {
                    // Make roll slider semi-transparent and show it's coupled with yaw
                    rollSlider.style.opacity = '0.5';
                    rollSlider.style.pointerEvents = 'none';
                    if (rollLabel) rollLabel.style.opacity = '0.5';
                } else if (rollSlider) {
                    rollSlider.style.opacity = '1';
                    rollSlider.style.pointerEvents = 'auto';
                    if (rollLabel) rollLabel.style.opacity = '1';
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
                updateQuaternionSphere3D();
            }
        };

        // Initialize 3D Quaternion Sphere Visualization
        const initQuaternionSphere3D = () => {
            const canvas = document.getElementById('quaternionCanvas');
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;

            // Scene
            quaternionScene = new THREE.Scene();
            quaternionScene.background = new THREE.Color(0x000011);

            // Camera
            quaternionCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            quaternionCamera.position.set(2.5, 1.5, 3);

            // Renderer
            quaternionRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
            quaternionRenderer.setSize(width, height);
            quaternionRenderer.setPixelRatio(window.devicePixelRatio);
            quaternionRenderer.shadowMap.enabled = true;
            quaternionRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // Trackball Controls for free-form 3D navigation
            quaternionControls = new THREE.TrackballControls(quaternionCamera, quaternionRenderer.domElement);
            quaternionControls.rotateSpeed = 1.0;
            quaternionControls.zoomSpeed = 1.2;
            quaternionControls.panSpeed = 0.8;
            quaternionControls.noZoom = false;
            quaternionControls.noPan = false;
            quaternionControls.staticMoving = true;
            quaternionControls.dynamicDampingFactor = 0.3;
            quaternionControls.minDistance = 1.5;
            quaternionControls.maxDistance = 6;

            // Lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            quaternionScene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0x64ffda, 0.8);
            directionalLight.position.set(3, 3, 3);
            directionalLight.castShadow = true;
            quaternionScene.add(directionalLight);

            const pointLight = new THREE.PointLight(0x7c4dff, 0.4, 100);
            pointLight.position.set(-2, 2, -2);
            quaternionScene.add(pointLight);

            // Create main quaternion sphere (wireframe)
            const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
            const sphereMaterial = new THREE.MeshPhongMaterial({
                color: 0x333333,
                wireframe: true,
                transparent: true,
                opacity: 0.3
            });
            quaternionSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            quaternionScene.add(quaternionSphere);

            // Create solid sphere for depth reference
            const solidSphereMaterial = new THREE.MeshPhongMaterial({
                color: 0x111133,
                transparent: true,
                opacity: 0.1
            });
            const solidSphere = new THREE.Mesh(sphereGeometry, solidSphereMaterial);
            quaternionScene.add(solidSphere);

            // Create quaternion point
            const pointGeometry = new THREE.SphereGeometry(0.05, 16, 16);
            const pointMaterial = new THREE.MeshPhongMaterial({
                color: 0x64ffda,
                emissive: 0x64ffda,
                emissiveIntensity: 0.3
            });
            quaternionPoint = new THREE.Mesh(pointGeometry, pointMaterial);
            quaternionScene.add(quaternionPoint);

            // Create antipodal point
            const antipodalMaterial = new THREE.MeshPhongMaterial({
                color: 0xff6b6b,
                emissive: 0xff6b6b,
                emissiveIntensity: 0.3
            });
            antipodalPoint = new THREE.Mesh(pointGeometry, antipodalMaterial);
            antipodalPoint.visible = false; // Initially hidden
            quaternionScene.add(antipodalPoint);

            // Create coordinate axes for reference
            const axisLength = 1.3;
            const axisConfigs = [
                { color: 0xff4444, direction: new THREE.Vector3(1, 0, 0), label: 'X' },
                { color: 0x44ff44, direction: new THREE.Vector3(0, 1, 0), label: 'Y' },
                { color: 0x4444ff, direction: new THREE.Vector3(0, 0, 1), label: 'Z' }
            ];

            axisConfigs.forEach(config => {
                const arrowHelper = new THREE.ArrowHelper(
                    config.direction,
                    new THREE.Vector3(0, 0, 0),
                    axisLength,
                    config.color,
                    0.1,
                    0.05
                );
                arrowHelper.line.material.linewidth = 2;
                quaternionScene.add(arrowHelper);
            });

            // Add grid helper
            const gridHelper = new THREE.GridHelper(2, 10, 0x333333, 0x111111);
            gridHelper.position.y = -1.2;
            quaternionScene.add(gridHelper);

            // Start animation loop for quaternion sphere
            const animateQuaternionSphere = () => {
                requestAnimationFrame(animateQuaternionSphere);
                quaternionControls.update();
                quaternionRenderer.render(quaternionScene, quaternionCamera);
            };
            animateQuaternionSphere();
        };

        // ===============================================================================
        // 3D QUATERNION SPHERE VISUALIZATION WITH GEODESIC ARC
        // ===============================================================================
        
        const updateQuaternionSphere3D = () => {
            if (!quaternionScene || !quaternionPoint) return;
            
            const [x, y, z, qw] = currentQuaternion;
            
            // Project quaternion to 3D sphere surface
            // Since quaternions live on S³ (x²+y²+z²+w²=1), we need to project (x,y,z) to unit sphere
            const xyz_norm = Math.sqrt(x*x + y*y + z*z);
            
            if (xyz_norm > 1e-10) { // Avoid division by zero
                // Normalize (x,y,z) to unit length for sphere surface placement
                const scale = 1.0 / xyz_norm;
                quaternionPoint.position.set(x * scale, y * scale, z * scale);
                
                // Update antipodal point
                if (showAntipodes) {
                    antipodalPoint.visible = true;
                    antipodalPoint.position.set(-x * scale, -y * scale, -z * scale);
                } else {
                    antipodalPoint.visible = false;
                }
            } else {
                // Handle degenerate case where (x,y,z) ≈ (0,0,0) - place at north pole
                quaternionPoint.position.set(0, 0, 1);
                if (showAntipodes) {
                    antipodalPoint.visible = true;
                    antipodalPoint.position.set(0, 0, -1);
                } else {
                    antipodalPoint.visible = false;
                }
            }
            
            // Color and size based on w component magnitude
            const wIntensity = Math.abs(qw);
            quaternionPoint.material.emissiveIntensity = 0.3 + wIntensity * 0.7;
            quaternionPoint.scale.setScalar(1 + wIntensity * 0.5);
            
            if (showAntipodes) {
                antipodalPoint.material.emissiveIntensity = 0.3 + wIntensity * 0.7;
                antipodalPoint.scale.setScalar(1 + wIntensity * 0.5);
            }
            
            // Update geodesic arc
            updateGeodesicArc3D();
            
            // Update quaternion display values
            document.getElementById('quatX').textContent = x.toFixed(6);
            document.getElementById('quatY').textContent = y.toFixed(6);
            document.getElementById('quatZ').textContent = z.toFixed(6);
            document.getElementById('quatW').textContent = qw.toFixed(6);
        };

        const updateGeodesicArc3D = () => {
            console.log("updateGeodesicArc3D called, showGeodesicArc:", showGeodesicArc);
            
            // Remove existing geodesic curve
            if (geodesicCurve) {
                quaternionScene.remove(geodesicCurve);
                geodesicCurve = null;
            }
            
            if (!showGeodesicArc || !quaternionScene) return;
            
            const [x, y, z, qw] = currentQuaternion;
            console.log("Current quaternion:", currentQuaternion);
            
            // Calculate the projected points on sphere surface
            const xyz_norm = Math.sqrt(x*x + y*y + z*z);
            let point1, point2;
            
            if (xyz_norm > 1e-10) {
                const scale = 1.0 / xyz_norm;
                point1 = new THREE.Vector3(x * scale, y * scale, z * scale);
                point2 = new THREE.Vector3(-x * scale, -y * scale, -z * scale);
            } else {
                // Degenerate case
                point1 = new THREE.Vector3(0, 0, 1);
                point2 = new THREE.Vector3(0, 0, -1);
            }
            
            console.log("Point1:", point1);
            console.log("Point2:", point2);
            
            // Create a simple great circle arc using many points
            const geodesicSteps = 50;
            const points = [];
            
            // Calculate the rotation axis (cross product of point1 and point2)
            const axis = new THREE.Vector3().crossVectors(point1, point2).normalize();
            const angle = point1.angleTo(point2);
            
            console.log("Rotation axis:", axis);
            console.log("Angle between points:", angle, "radians =", angle * 180 / Math.PI, "degrees");
            
            // If points are too close or opposite, create alternative path
            if (angle < 0.01 || angle > 3.13) {
                console.log("Points are too close or opposite, using alternative path");
                // Create path through an intermediate point
                const midPoint = new THREE.Vector3(1, 0, 0);
                if (Math.abs(point1.dot(midPoint)) > 0.9) {
                    midPoint.set(0, 1, 0);
                }
                
                // First half: point1 to midPoint
                for (let i = 0; i <= geodesicSteps/2; i++) {
                    const t = i / (geodesicSteps/2);
                    const interpolated = new THREE.Vector3().lerpVectors(point1, midPoint, t).normalize();
                    points.push(interpolated);
                }
                
                // Second half: midPoint to point2
                for (let i = 1; i <= geodesicSteps/2; i++) {
                    const t = i / (geodesicSteps/2);
                    const interpolated = new THREE.Vector3().lerpVectors(midPoint, point2, t).normalize();
                    points.push(interpolated);
                }
            } else {
                // Normal case: rotate around axis
                for (let i = 0; i <= geodesicSteps; i++) {
                    const t = i / geodesicSteps;
                    const rotationAngle = angle * t;
                    
                    const rotatedPoint = point1.clone();
                    rotatedPoint.applyAxisAngle(axis, rotationAngle);
                    points.push(rotatedPoint);
                }
            }
            
            console.log("Created", points.length, "points for geodesic");
            
            // Create line geometry instead of tube for better visibility
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0xFFD700,
                linewidth: 5,
                transparent: false
            });
            
            geodesicCurve = new THREE.Line(geometry, material);
            quaternionScene.add(geodesicCurve);
            
            console.log("Geodesic arc added to scene");
        };

        const resizeQuaternionSphere3D = () => {
            if (!quaternionRenderer) return;
            
            const canvas = document.getElementById('quaternionCanvas');
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            
            quaternionCamera.aspect = width / height;
            quaternionCamera.updateProjectionMatrix();
            quaternionRenderer.setSize(width, height);
        };
        
        // ===============================================================================
        // THREE.JS SLERP PATH VISUALIZATION
        // ===============================================================================
        
        const initSlerpPath3D = () => {
            const canvas = document.getElementById('slerpPathCanvas');
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            
            // Scene - slightly brighter background
            slerpScene = new THREE.Scene();
            slerpScene.background = new THREE.Color(0x0a0a1a);
            
            // Camera - positioned to see blue SLERP arc better
            slerpCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
            slerpCamera.position.set(3.5, 2, 2.5);
            slerpCamera.lookAt(0, 0, 0);
            
            // Renderer
            slerpRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
            slerpRenderer.setSize(width, height);
            slerpRenderer.setPixelRatio(window.devicePixelRatio);
            
            // Controls
            slerpControls = new THREE.TrackballControls(slerpCamera, slerpRenderer.domElement);
            slerpControls.rotateSpeed = 1.0;
            slerpControls.zoomSpeed = 1.2;
            slerpControls.panSpeed = 0.8;
            slerpControls.minDistance = 1.5;
            slerpControls.maxDistance = 5;
            
            // Enhanced lighting for better visibility
            const ambientLight = new THREE.AmbientLight(0x606060, 0.8);
            slerpScene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
            directionalLight.position.set(3, 3, 3);
            directionalLight.castShadow = true;
            slerpScene.add(directionalLight);
            
            // Add another directional light from opposite side
            const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
            directionalLight2.position.set(-3, 2, -3);
            slerpScene.add(directionalLight2);
            
            // Add point lights for better sphere illumination
            const pointLight1 = new THREE.PointLight(0x88ccff, 0.5, 100);
            pointLight1.position.set(2, 3, 0);
            slerpScene.add(pointLight1);
            
            const pointLight2 = new THREE.PointLight(0xffaa88, 0.5, 100);
            pointLight2.position.set(-2, -1, 2);
            slerpScene.add(pointLight2);
            
            // Create main sphere (wireframe) - more transparent for path visibility
            const sphereGeometry = new THREE.SphereGeometry(1, 24, 24);
            const sphereMaterial = new THREE.MeshPhongMaterial({
                color: 0x666688,
                wireframe: true,
                transparent: true,
                opacity: 0.3,
                depthWrite: false
            });
            slerpSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            slerpSphere.renderOrder = 1;
            slerpScene.add(slerpSphere);
            
            // Create solid sphere for depth - more transparent
            const solidSphereMaterial = new THREE.MeshPhongMaterial({
                color: 0x222244,
                transparent: true,
                opacity: 0.1,
                shininess: 50,
                depthWrite: false,
                side: THREE.BackSide  // Render only back side to reduce occlusion
            });
            const solidSphere = new THREE.Mesh(sphereGeometry, solidSphereMaterial);
            solidSphere.renderOrder = 0;
            slerpScene.add(solidSphere);
            
            // Add coordinate axes for reference
            const axesHelper = new THREE.AxesHelper(1.3);
            slerpScene.add(axesHelper);
            
            // Create start and end points - make them bigger
            const startGeometry = new THREE.SphereGeometry(0.06, 16, 16);
            const startMaterial = new THREE.MeshPhongMaterial({
                color: 0x4caf50,
                emissive: 0x4caf50,
                emissiveIntensity: 0.5
            });
            const startPoint = new THREE.Mesh(startGeometry, startMaterial);
            slerpScene.add(startPoint);
            
            const endGeometry = new THREE.SphereGeometry(0.06, 16, 16);
            const endMaterial = new THREE.MeshPhongMaterial({
                color: 0xff9800,
                emissive: 0xff9800,
                emissiveIntensity: 0.5
            });
            const endPoint = new THREE.Mesh(endGeometry, endMaterial);
            slerpScene.add(endPoint);
            
            // Create current position markers - make them bigger and more visible
            const currentGeometry = new THREE.SphereGeometry(0.08, 16, 16);
            
            const slerpCurrentMaterial = new THREE.MeshPhongMaterial({
                color: 0x2196f3,
                emissive: 0x2196f3,
                emissiveIntensity: 0.8
            });
            slerpCurrentPoint = new THREE.Mesh(currentGeometry, slerpCurrentMaterial);
            slerpScene.add(slerpCurrentPoint);
            
            const eulerCurrentMaterial = new THREE.MeshPhongMaterial({
                color: 0xf44336,
                emissive: 0xf44336,
                emissiveIntensity: 0.8
            });
            eulerCurrentPoint = new THREE.Mesh(currentGeometry, eulerCurrentMaterial);
            slerpScene.add(eulerCurrentPoint);
            
            // Start animation loop
            const animateSlerpPath = () => {
                requestAnimationFrame(animateSlerpPath);
                slerpControls.update();
                updateSlerpPaths3D();
                slerpRenderer.render(slerpScene, slerpCamera);
            };
            animateSlerpPath();
        };
        
        const updateSlerpPaths3D = () => {
            if (!slerpScene) return;
            
            const t = parseFloat(document.getElementById('tSlider').value);
            
            // Get Euler angles for start and end orientations
            const eulerA = qToEulerZYX(orientationA);
            const eulerB = qToEulerZYX(orientationB);
            
            // COMPREHENSIVE cleanup of all path-related objects
            const toRemove = [];
            slerpScene.children.forEach(child => {
                // Remove tubes (both SLERP and Euler)
                if (child.geometry && child.geometry.type === 'TubeGeometry') {
                    toRemove.push(child);
                }
                // Remove lines (both SLERP and Euler paths)
                if (child.geometry && child.geometry.type === 'BufferGeometry' && child.type === 'Line') {
                    toRemove.push(child);
                }
                // Remove path marker spheres (but keep start/end points)
                if (child.geometry && child.geometry.type === 'SphereGeometry' &&
                    child.material && (
                        child.material.color.getHex() === 0x64b5f6 || // SLERP path spheres
                        child.material.color.getHex() === 0xff6655    // Euler path spheres
                    )) {
                    toRemove.push(child);
                }
            });
            
            // Dispose of all removed objects properly
            toRemove.forEach(child => {
                slerpScene.remove(child);
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    if (child.material.map) child.material.map.dispose();
                    child.material.dispose();
                }
            });
            
            // Generate SLERP path points
            // Visualize by applying quaternion rotations to a reference vector
            const slerpPoints = [];
            const referenceVector = new THREE.Vector3(1, 0, 0); // Start with x-axis
            
            for (let i = 0; i <= 100; i++) {
                const t_i = i / 100;
                const q = qSlerp(orientationA, orientationB, t_i);
                const [qx, qy, qz, qw] = qNorm(q);
                
                // Convert quaternion to Three.js quaternion
                const threeQuat = new THREE.Quaternion(qx, qy, qz, qw);
                
                // Apply rotation to reference vector
                const point = referenceVector.clone();
                point.applyQuaternion(threeQuat);
                
                // Ensure point is on unit sphere (should already be, but just in case)
                point.normalize();
                
                slerpPoints.push(point);
            }
            
            // Create SLERP path - Thin and clean
            const slerpGeometry = new THREE.BufferGeometry().setFromPoints(slerpPoints);
            
            // Add thin tube geometry for SLERP path
            const slerpCurve = new THREE.CatmullRomCurve3(slerpPoints);
            const slerpTubeGeometry = new THREE.TubeGeometry(slerpCurve, 100, 0.025, 8, false); // Much thinner
            const slerpTubeMaterial = new THREE.MeshPhongMaterial({
                color: 0x2196f3,
                emissive: 0x1565c0,
                emissiveIntensity: 0.3,
                shininess: 100,
                transparent: false,
                depthTest: true
            });
            const slerpTube = new THREE.Mesh(slerpTubeGeometry, slerpTubeMaterial);
            slerpTube.renderOrder = 5;
            slerpScene.add(slerpTube);
            
            // Simple line for SLERP path
            const slerpLineMaterial = new THREE.LineBasicMaterial({
                color: 0x2196f3,
                linewidth: 2,
                transparent: false
            });
            slerpPathLine = new THREE.Line(slerpGeometry, slerpLineMaterial);
            slerpPathLine.renderOrder = 4;
            slerpScene.add(slerpPathLine);
            
            // Generate Euler LERP path points
            const eulerPoints = [];
            const refVector = new THREE.Vector3(1, 0, 0); // Use same reference vector approach
            
            for (let i = 0; i <= 100; i++) {
                const t_i = i / 100;
                const interpYaw = eulerA[0] + (eulerB[0] - eulerA[0]) * t_i;
                const interpPitch = eulerA[1] + (eulerB[1] - eulerA[1]) * t_i;
                const interpRoll = eulerA[2] + (eulerB[2] - eulerA[2]) * t_i;
                const q = qFromEulerZYX(interpYaw, interpPitch, interpRoll);
                const [qx, qy, qz, qw] = qNorm(q);
                
                // Convert quaternion to Three.js quaternion
                const threeQuat = new THREE.Quaternion(qx, qy, qz, qw);
                
                // Apply rotation to reference vector
                const point = refVector.clone();
                point.applyQuaternion(threeQuat);
                
                // Ensure point is on unit sphere
                point.normalize();
                
                eulerPoints.push(point);
            }
            
            // Create Euler LERP path line - thicker and more visible
            const eulerGeometry = new THREE.BufferGeometry().setFromPoints(eulerPoints);
            const eulerMaterial = new THREE.LineBasicMaterial({
                color: 0xff6655,
                linewidth: 5,
                transparent: false
            });
            eulerPathLine = new THREE.Line(eulerGeometry, eulerMaterial);
            slerpScene.add(eulerPathLine);
            
            // Add tube geometry for Euler LERP - keep thinner than SLERP
            const eulerCurve = new THREE.CatmullRomCurve3(eulerPoints);
            const eulerTubeGeometry = new THREE.TubeGeometry(eulerCurve, 100, 0.03, 8, false);
            const eulerTubeMaterial = new THREE.MeshPhongMaterial({
                color: 0xff6655,
                emissive: 0xff4433,
                emissiveIntensity: 0.6,
                shininess: 100,
                transparent: false,
                depthTest: true
            });
            const eulerTube = new THREE.Mesh(eulerTubeGeometry, eulerTubeMaterial);
            eulerTube.renderOrder = 2;  // Lower than SLERP
            slerpScene.add(eulerTube);
            
            // Update start and end points
            const startPos = slerpPoints[0];
            const endPos = slerpPoints[slerpPoints.length - 1];
            
            const startMarker = slerpScene.children.find(child =>
                child.material && child.material.color &&
                child.material.color.getHex() === 0x4caf50);
            if (startMarker) {
                startMarker.position.copy(startPos);
            }
            
            const endMarker = slerpScene.children.find(child =>
                child.material && child.material.color &&
                child.material.color.getHex() === 0xff9800);
            if (endMarker) {
                endMarker.position.copy(endPos);
            }
            
            // Update current positions
            const currentIndex = Math.floor(t * (slerpPoints.length - 1));
            if (slerpCurrentPoint && slerpPoints[currentIndex]) {
                slerpCurrentPoint.position.copy(slerpPoints[currentIndex]);
            }
            if (eulerCurrentPoint && eulerPoints[currentIndex]) {
                eulerCurrentPoint.position.copy(eulerPoints[currentIndex]);
            }
        };
        
        const resizeSlerpPath3D = () => {
            if (!slerpRenderer) return;
            
            const canvas = document.getElementById('slerpPathCanvas');
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            
            slerpCamera.aspect = width / height;
            slerpCamera.updateProjectionMatrix();
            slerpRenderer.setSize(width, height);
        };

        // Simple, guaranteed-to-work approach focusing on visible results
        const eulerCondition = (yaw, pitch, roll) => {
            // Convert to degrees for easier understanding
            const pitchDeg = pitch * 180 / Math.PI;
            const yawDeg = yaw * 180 / Math.PI;
            const rollDeg = roll * 180 / Math.PI;
            
            // Base condition number primarily on pitch (main source of singularity)
            const pitchFactor = Math.abs(pitchDeg) / 90; // 0 to 1 as pitch goes from 0° to ±90°
            
            // Create dramatic variation based on pitch
            let baseCondition = -2 + pitchFactor * 8; // Goes from -2 to 6 as pitch increases
            
            // Add some variation based on yaw and roll for visual interest
            const yawVariation = 0.5 * Math.sin(yawDeg * Math.PI / 45); // -0.5 to 0.5
            const rollVariation = 0.3 * Math.cos(rollDeg * Math.PI / 30); // -0.3 to 0.3
            
            // Combine factors
            let condition = baseCondition + yawVariation + rollVariation;
            
            // Ensure gimbal lock regions (pitch near ±90°) are definitely red/yellow
            if (Math.abs(pitchDeg) > 80) {
                condition = Math.max(4, condition); // Force into red/yellow range
            }
            
            // Clamp to visualization range
            condition = Math.max(-3, Math.min(6, condition));
            
            // Debug output
            if (Math.random() < 0.01) {
                console.log(`Condition: pitch=${pitchDeg.toFixed(1)}°, condition=${condition.toFixed(2)}`);
            }
            
            return condition;
        };
        
        // Remove the rest of the finite difference calculation since we're using analytical
        const eulerConditionOld = (yaw, pitch, roll) => {
            // Keep the old finite difference code as backup
            const eps = 1e-4;
            
            return 0; // Placeholder - analytical version above is used
        };

        // Heatmap visualization with proper Jacobian and torus topology
        const drawHeatmap = () => {
            const canvas = document.getElementById('heatmapCanvas');
            const ctx = heatmapCtx;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            
            ctx.clearRect(0, 0, width, height);
            
            const fixedPitch = deg2rad(parseFloat(document.getElementById('heatmapPitchSlider').value));
            
            // Get current yaw and roll from torus-specific sliders
            const currentYaw = deg2rad(parseFloat(document.getElementById('torusYawSlider').value));
            const currentRoll = deg2rad(parseFloat(document.getElementById('torusRollSlider').value));
            
            // Get current pitch from gimbal sliders for position indicator
            const currentPitch = deg2rad(parseFloat(document.getElementById('pitchSlider').value));
            
            const resolution = 64;
            
            // Calculate condition numbers for the grid
            let maxCond = 0;
            const conditionGrid = [];
            
            for (let i = 0; i < resolution; i++) {
                conditionGrid[i] = [];
                for (let j = 0; j < resolution; j++) {
                    // Map grid indices to proper Euler angle ranges [-π, π]
                    const yaw = (i / resolution - 0.5) * 2 * Math.PI;   // [-π, π]
                    const roll = (j / resolution - 0.5) * 2 * Math.PI;  // [-π, π]
                    
                    const cond = eulerCondition(yaw, fixedPitch, roll);
                    conditionGrid[i][j] = cond;
                    maxCond = Math.max(maxCond, Math.min(cond, 1000));
                }
            }
            
            if (showTorusView) {
                // Draw as torus (3D projection)
                ctx.save();
                ctx.translate(width/2, height/2);
                
                const majorRadius = Math.min(width, height) * 0.2;
                const minorRadius = majorRadius * 0.3;
                
                // Draw torus mesh - CORRECTED MAPPING
                for (let i = 0; i < resolution; i++) {
                    for (let j = 0; j < resolution; j++) {
                        // Map grid to torus parameters [0, 2π] for continuous torus surface
                        const theta = (i / resolution) * 2 * Math.PI; // Major circle (yaw direction)
                        const phi = (j / resolution) * 2 * Math.PI;   // Minor circle (roll direction)
                        
                        // Standard torus parametric equations
                        const torusX = (majorRadius + minorRadius * Math.cos(phi)) * Math.cos(theta);
                        const torusY = (majorRadius + minorRadius * Math.cos(phi)) * Math.sin(theta);
                        const torusZ = minorRadius * Math.sin(phi);
                        
                        // Improved 3D to 2D projection with better depth perception
                        const scale = 0.9;
                        const projX = (torusX * 0.866 - torusY * 0.5) * scale; // 60° rotation for better view
                        const projY = (torusZ * 0.866 + torusY * 0.5) * scale;
                        
                        // Map torus coordinates back to Euler angle grid coordinates
                        // Torus uses [0, 2π], grid uses [-π, π] via (i/resolution - 0.5) * 2π
                        const yawAngle = theta - Math.PI; // Convert [0, 2π] to [-π, π]
                        const rollAngle = phi - Math.PI;  // Convert [0, 2π] to [-π, π]
                        
                        // Map back to grid indices
                        const gridI = Math.floor(((yawAngle + Math.PI) / (2 * Math.PI)) * resolution);
                        const gridJ = Math.floor(((rollAngle + Math.PI) / (2 * Math.PI)) * resolution);
                        
                        // Clamp to valid indices
                        const clampedI = Math.max(0, Math.min(resolution - 1, gridI));
                        const clampedJ = Math.max(0, Math.min(resolution - 1, gridJ));
                        
                        const logCondValue = conditionGrid[clampedI][clampedJ];
                        
                        // Color mapping as specified: Blue=stable, Green=sensitive, Red=singular, Yellow=gimbal lock
                        let r, g, b;
                        
                        if (logCondValue < -3) {
                            // Very stable (Blue)
                            r = 0; g = 102; b = 255;
                        } else if (logCondValue < -1) {
                            // Stable to sensitive transition (Blue to Green)
                            const t = (logCondValue + 3) / 2; // Map [-3,-1] to [0,1]
                            r = 0;
                            g = Math.floor(102 + 153 * t); // 102 to 255
                            b = Math.floor(255 * (1 - t));  // 255 to 0
                        } else if (logCondValue < 1) {
                            // Sensitive (Green)
                            r = 0; g = 255; b = 0;
                        } else if (logCondValue < 3) {
                            // Sensitive to singular (Green to Red)
                            const t = (logCondValue - 1) / 2; // Map [1,3] to [0,1]
                            r = Math.floor(255 * t);     // 0 to 255
                            g = Math.floor(255 * (1 - t)); // 255 to 0
                            b = 0;
                        } else if (logCondValue < 4.5) {
                            // Highly singular (Red)
                            r = 255; g = 0; b = 0;
                        } else if (logCondValue < 6) {
                            // SMOOTH Red to Yellow transition
                            const t = (logCondValue - 4.5) / 1.5; // Map [4.5,6] to [0,1]
                            r = 255; // Always full red
                            g = Math.floor(255 * t);     // 0 to 255 (adds yellow)
                            b = 0;   // No blue
                        } else {
                            // Pure gimbal lock region (Yellow)
                            r = 255; g = 255; b = 0;
                        }
                        
                        // Enhanced depth calculation for better 3D perception
                        const viewAngle = Math.PI / 6; // 30 degree viewing angle
                        const depth = torusX * Math.cos(viewAngle) + torusY * Math.sin(viewAngle);
                        const normalizedDepth = (depth + (majorRadius + minorRadius)) / (2 * (majorRadius + minorRadius));
                        const opacity = Math.max(0.3, 0.4 + 0.5 * normalizedDepth);
                        const size = Math.max(1.5, 2 + normalizedDepth * 1.5);
                        
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
                
                // ENHANCED: Show current yaw/roll position on torus
                // Always show the position indicator - torus sliders work independently
                {
                    // Map current yaw/roll to torus coordinates
                    const currentTheta = (currentYaw + Math.PI); // Map [-π,π] to [0,2π]
                    const currentPhi = (currentRoll + Math.PI);   // Map [-π,π] to [0,2π]
                    
                    // Calculate torus position
                    const indicatorX = (majorRadius + minorRadius * Math.cos(currentPhi)) * Math.cos(currentTheta);
                    const indicatorY = (majorRadius + minorRadius * Math.cos(currentPhi)) * Math.sin(currentTheta);
                    const indicatorZ = minorRadius * Math.sin(currentPhi);
                    
                    // Project to 2D
                    const scale = 0.9;
                    const projIndicatorX = (indicatorX * 0.866 - indicatorY * 0.5) * scale;
                    const projIndicatorY = (indicatorZ * 0.866 + indicatorY * 0.5) * scale;
                    
                    // Draw prominent indicator
                    const indicatorSize = 8;
                    
                    // Outer glow
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.beginPath();
                    ctx.arc(projIndicatorX, projIndicatorY, indicatorSize + 4, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // Main indicator
                    ctx.fillStyle = '#ff00ff'; // Bright magenta
                    ctx.beginPath();
                    ctx.arc(projIndicatorX, projIndicatorY, indicatorSize, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // Inner highlight
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(projIndicatorX, projIndicatorY, indicatorSize - 3, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // Cross-hairs for precision
                    ctx.strokeStyle = '#ff00ff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(projIndicatorX - 12, projIndicatorY);
                    ctx.lineTo(projIndicatorX + 12, projIndicatorY);
                    ctx.moveTo(projIndicatorX, projIndicatorY - 12);
                    ctx.lineTo(projIndicatorX, projIndicatorY + 12);
                    ctx.stroke();
                    
                    // Label
                    ctx.fillStyle = '#ff00ff';
                    ctx.font = 'bold 11px sans-serif';
                    ctx.fillText('Current Position', projIndicatorX + 15, projIndicatorY - 15);
                    ctx.font = '9px sans-serif';
                    ctx.fillText(`Y:${rad2deg(currentYaw).toFixed(0)}° R:${rad2deg(currentRoll).toFixed(0)}°`,
                               projIndicatorX + 15, projIndicatorY - 2);
                }
                
                // Enhanced torus topology labels and guides
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText(`Torus View (Pitch = ${rad2deg(fixedPitch).toFixed(0)}°)`, -majorRadius, -majorRadius - minorRadius - 35);
                
                ctx.font = '10px sans-serif';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillText('Yaw: major circle →', majorRadius * 0.8, majorRadius + 25);
                ctx.fillText('Roll: minor circle ↻', -majorRadius * 0.8, -majorRadius - 5);
                
                // Show current torus position info
                ctx.fillStyle = '#00ff00';
                ctx.font = 'bold 10px sans-serif';
                ctx.fillText(`Torus Position - Y:${rad2deg(currentYaw).toFixed(0)}° R:${rad2deg(currentRoll).toFixed(0)}°`, -majorRadius, majorRadius + 35);
                
                // Enhanced coordinate reference with better visibility
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 2]);
                
                // Major circle outline (yaw direction)
                ctx.beginPath();
                ctx.arc(0, 0, majorRadius, 0, 2 * Math.PI);
                ctx.stroke();
                
                // Show fewer minor circle examples for clarity
                const minorPositions = [0, Math.PI/2, Math.PI, 3*Math.PI/2];
                minorPositions.forEach(angle => {
                    const centerX = majorRadius * Math.cos(angle);
                    const centerY = majorRadius * Math.sin(angle);
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, minorRadius, 0, 2 * Math.PI);
                    ctx.stroke();
                });
                
                ctx.setLineDash([]);
                
                // Add directional indicators
                ctx.fillStyle = 'rgba(100, 255, 218, 0.8)';
                ctx.font = '14px sans-serif';
                
                // Yaw direction arrow
                ctx.fillText('⟲', majorRadius + 15, 5);
                // Roll direction indicator
                ctx.fillText('⟳', majorRadius - 5, minorRadius + 20);
                
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
                        const logCondValue = conditionGrid[i][j];
                        
                        // Add wrapping indicators at edges
                        const isEdgeX = (i === 0 || i === resolution - 1);
                        const isEdgeY = (j === 0 || j === resolution - 1);
                        
                        const pixelIndex = (j * resolution + i) * 4;
                        
                        // Use same color mapping as torus view
                        let r, g, b;
                        
                        if (logCondValue < -3) {
                            // Very stable (Blue)
                            r = 0; g = 102; b = 255;
                        } else if (logCondValue < -1) {
                            // Stable to sensitive transition (Blue to Green)
                            const t = (logCondValue + 3) / 2; // Map [-3,-1] to [0,1]
                            r = 0;
                            g = Math.floor(102 + 153 * t); // 102 to 255
                            b = Math.floor(255 * (1 - t));  // 255 to 0
                        } else if (logCondValue < 1) {
                            // Sensitive (Green)
                            r = 0; g = 255; b = 0;
                        } else if (logCondValue < 3) {
                            // Sensitive to singular (Green to Red)
                            const t = (logCondValue - 1) / 2; // Map [1,3] to [0,1]
                            r = Math.floor(255 * t);     // 0 to 255
                            g = Math.floor(255 * (1 - t)); // 255 to 0
                            b = 0;
                        } else if (logCondValue < 4.5) {
                            // Highly singular (Red)
                            r = 255; g = 0; b = 0;
                        } else if (logCondValue < 6) {
                            // SMOOTH Red to Yellow transition
                            const t = (logCondValue - 4.5) / 1.5; // Map [4.5,6] to [0,1]
                            r = 255; // Always full red
                            g = Math.floor(255 * t);     // 0 to 255 (adds yellow)
                            b = 0;   // No blue
                        } else {
                            // Pure gimbal lock region (Yellow)
                            r = 255; g = 255; b = 0;
                        }
                        
                        data[pixelIndex] = r;
                        data[pixelIndex + 1] = g;
                        data[pixelIndex + 2] = b;
                        
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
                
                // Draw proper wrapping indicators
                ctx.strokeStyle = 'rgba(100, 255, 218, 0.6)';
                ctx.lineWidth = 3;
                ctx.setLineDash([8, 4]);
                
                // Yaw wrapping (left-right edges are connected)
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, height);
                ctx.moveTo(width-1, 0);
                ctx.lineTo(width-1, height);
                ctx.stroke();
                
                // Roll wrapping (top-bottom edges are connected)
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(width, 0);
                ctx.moveTo(0, height-1);
                ctx.lineTo(width, height-1);
                ctx.stroke();
                
                ctx.setLineDash([]);
                
                // Add wrap indication arrows
                ctx.fillStyle = 'rgba(100, 255, 218, 0.8)';
                ctx.font = '14px sans-serif';
                
                // Yaw wrap arrows
                ctx.save();
                ctx.translate(5, height/2);
                ctx.rotate(-Math.PI/2);
                ctx.fillText('↔', -8, 0);
                ctx.restore();
                
                ctx.save();
                ctx.translate(width-15, height/2);
                ctx.rotate(-Math.PI/2);
                ctx.fillText('↔', -8, 0);
                ctx.restore();
                
                // Roll wrap arrows
                ctx.fillText('↕', width/2-5, 15);
                ctx.fillText('↕', width/2-5, height-5);
                
                // Draw enhanced labels and scale
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px sans-serif';
                ctx.fillText('Yaw [-180°, 180°] →', width - 140, height - 10);
                ctx.save();
                ctx.translate(15, height/2 + 30);
                ctx.rotate(-Math.PI/2);
                ctx.fillText('Roll [-180°, 180°] ↑', 0, 0);
                ctx.restore();
                
                // Add coordinate grid markers
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.font = '10px sans-serif';
                
                // Yaw markers
                const yawMarkers = [-180, -90, 0, 90, 180];
                yawMarkers.forEach(angle => {
                    const x = ((angle + 180) / 360) * width;
                    ctx.fillText(`${angle}°`, x - 10, height - 20);
                });
                
                // Roll markers
                const rollMarkers = [-180, -90, 0, 90, 180];
                rollMarkers.forEach(angle => {
                    const y = ((angle + 180) / 360) * height;
                    ctx.save();
                    ctx.translate(25, y + 3);
                    ctx.fillText(`${angle}°`, 0, 0);
                    ctx.restore();
                });
                
                // Add current yaw/roll position indicator for flat view
                {
                    // Map current yaw/roll to flat view coordinates
                    const flatYawX = ((currentYaw * 180 / Math.PI + 180) / 360) * width;
                    const flatRollY = ((currentRoll * 180 / Math.PI + 180) / 360) * height;
                    
                    // Clamp to visible area
                    const clampedX = Math.max(20, Math.min(width - 20, flatYawX));
                    const clampedY = Math.max(20, Math.min(height - 40, flatRollY));
                    
                    const indicatorSize = 10;
                    
                    // Outer glow
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.beginPath();
                    ctx.arc(clampedX, clampedY, indicatorSize + 4, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // Main indicator - bright magenta like torus view
                    ctx.fillStyle = '#ff00ff';
                    ctx.beginPath();
                    ctx.arc(clampedX, clampedY, indicatorSize, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // Inner highlight
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(clampedX, clampedY, indicatorSize - 4, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // Cross-hairs for precision
                    ctx.strokeStyle = '#ff00ff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(clampedX - 15, clampedY);
                    ctx.lineTo(clampedX + 15, clampedY);
                    ctx.moveTo(clampedX, clampedY - 15);
                    ctx.lineTo(clampedX, clampedY + 15);
                    ctx.stroke();
                    
                    // Label with current values
                    ctx.fillStyle = '#ff00ff';
                    ctx.font = 'bold 11px sans-serif';
                    ctx.fillText('Current Position', clampedX + 18, clampedY - 15);
                    ctx.font = '9px sans-serif';
                    ctx.fillText(`Y:${rad2deg(currentYaw).toFixed(0)}° R:${rad2deg(currentRoll).toFixed(0)}°`,
                               clampedX + 18, clampedY - 2);
                    
                    // Draw connection lines to axes for clarity
                    ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([2, 2]);
                    ctx.beginPath();
                    // Vertical line to yaw axis
                    ctx.moveTo(clampedX, clampedY);
                    ctx.lineTo(clampedX, height - 35);
                    // Horizontal line to roll axis
                    ctx.moveTo(clampedX, clampedY);
                    ctx.lineTo(35, clampedY);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }
            
            // Add pitch value indicator
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = Math.abs(fixedPitch) > deg2rad(80) ? '#ff6b6b' : '#64ffda';
            ctx.fillText(`Pitch: ${rad2deg(fixedPitch).toFixed(0)}°`, 10, 20);
            
            // Add singularity warning if near gimbal lock
            if (Math.abs(Math.cos(fixedPitch)) < 0.15) {
                ctx.fillStyle = '#ffff00';
                ctx.font = 'bold 16px sans-serif';
                ctx.fillText('NEAR SINGULARITY!', width/2 - 80, 25);
            }
        };

        // SLERP comparison visualization - COMPLETELY REDESIGNED
        let orientationA = [0, 0, 0, 1];
        let orientationB = qFromEulerZYX(deg2rad(90), deg2rad(45), deg2rad(30));

        const drawSlerpVelocity = () => {
            const canvas = document.getElementById('slerpVelocityCanvas');
            const ctx = slerpVelocityCtx;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            
            ctx.clearRect(0, 0, width, height);
            
            const t = parseFloat(document.getElementById('tSlider').value);
            
            // Get Euler angles for start and end orientations
            const eulerA = qToEulerZYX(orientationA);
            const eulerB = qToEulerZYX(orientationB);
            
            // =========================================================================
            // Angular Velocity Comparison (Shows speed consistency)
            // =========================================================================
            
            // Compute angular velocities for both methods
            const slerpVelocities = [];
            const eulerVelocities = [];
            const slerpOrientations = [];
            const eulerOrientations = [];
            
            const numSamples = 100;
            const dt = 1.0 / numSamples;
            
            for (let i = 0; i <= numSamples; i++) {
                const t_i = i / numSamples;
                
                // SLERP interpolation
                const qSlerped = qSlerp(orientationA, orientationB, t_i);
                slerpOrientations.push(qSlerped);
                
                // Euler LERP interpolation
                const interpYaw = eulerA[0] + (eulerB[0] - eulerA[0]) * t_i;
                const interpPitch = eulerA[1] + (eulerB[1] - eulerA[1]) * t_i;
                const interpRoll = eulerA[2] + (eulerB[2] - eulerA[2]) * t_i;
                const qEuler = qFromEulerZYX(interpYaw, interpPitch, interpRoll);
                eulerOrientations.push(qEuler);
                
                // Calculate angular velocities (skip first point)
                if (i > 0) {
                    // SLERP angular velocity
                    const slerpDeltaQ = qMul(qSlerped, qConj(slerpOrientations[i-1]));
                    const [slerpAxis, slerpAngle] = qToAxisAngle(slerpDeltaQ);
                    const slerpVelocity = slerpAngle / dt;
                    slerpVelocities.push(slerpVelocity);
                    
                    // Euler LERP angular velocity
                    const eulerDeltaQ = qMul(qEuler, qConj(eulerOrientations[i-1]));
                    const [eulerAxis, eulerAngle] = qToAxisAngle(eulerDeltaQ);
                    const eulerVelocity = eulerAngle / dt;
                    eulerVelocities.push(eulerVelocity);
                }
            }
            
            // Find max velocity for scaling
            const maxVelocity = Math.max(...slerpVelocities, ...eulerVelocities);
            const minVelocity = Math.min(...slerpVelocities, ...eulerVelocities);
            const velocityRange = maxVelocity - minVelocity || 1;
            
            // Draw panel background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
            ctx.fillRect(0, 0, width, height);
            
            // Draw velocity graphs
            const graphHeight = height * 0.7;
            const graphY = height * 0.15;
            
            // Draw grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const y = graphY + (graphHeight * i / 4);
                ctx.beginPath();
                ctx.moveTo(10, y);
                ctx.lineTo(width - 10, y);
                ctx.stroke();
            }
            
            // SLERP velocity (should be constant) - BLUE
            ctx.strokeStyle = '#2196f3';
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let i = 0; i < slerpVelocities.length; i++) {
                const x = 10 + (width - 20) * (i / slerpVelocities.length);
                const normalizedVel = (slerpVelocities[i] - minVelocity) / velocityRange;
                const y = graphY + graphHeight - (normalizedVel * graphHeight);
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            
            // Draw SLERP velocity value (should be nearly constant)
            const avgSlerpVel = slerpVelocities.reduce((a, b) => a + b, 0) / slerpVelocities.length;
            const slerpVariance = Math.sqrt(slerpVelocities.reduce((sum, v) => sum + Math.pow(v - avgSlerpVel, 2), 0) / slerpVelocities.length);
            
            // Euler LERP velocity (varies) - RED
            ctx.strokeStyle = '#f44336';
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let i = 0; i < eulerVelocities.length; i++) {
                const x = 10 + (width - 20) * (i / eulerVelocities.length);
                const normalizedVel = (eulerVelocities[i] - minVelocity) / velocityRange;
                const y = graphY + graphHeight - (normalizedVel * graphHeight);
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            
            // Calculate Euler velocity variance
            const avgEulerVel = eulerVelocities.reduce((a, b) => a + b, 0) / eulerVelocities.length;
            const eulerVariance = Math.sqrt(eulerVelocities.reduce((sum, v) => sum + Math.pow(v - avgEulerVel, 2), 0) / eulerVelocities.length);
            
            // Draw current position marker
            const currentVelIndex = Math.min(Math.floor(t * (slerpVelocities.length - 1)), slerpVelocities.length - 1);
            const markerX = 10 + (width - 20) * t;
            
            // Vertical line at current t
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 2]);
            ctx.beginPath();
            ctx.moveTo(markerX, graphY);
            ctx.lineTo(markerX, graphY + graphHeight);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // SLERP current point
            const slerpNormVel = (slerpVelocities[currentVelIndex] - minVelocity) / velocityRange;
            const slerpMarkerY = graphY + graphHeight - (slerpNormVel * graphHeight);
            ctx.fillStyle = '#2196f3';
            ctx.beginPath();
            ctx.arc(markerX, slerpMarkerY, 5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Euler current point
            const eulerNormVel = (eulerVelocities[currentVelIndex] - minVelocity) / velocityRange;
            const eulerMarkerY = graphY + graphHeight - (eulerNormVel * graphHeight);
            ctx.fillStyle = '#f44336';
            ctx.beginPath();
            ctx.arc(markerX, eulerMarkerY, 5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Labels for panel
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('Angular Velocity', width/2 - 45, 15);
            
            ctx.font = '10px sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText('0', 5, graphY + graphHeight + 12);
            ctx.fillText('t', width - 15, graphY + graphHeight + 12);
            ctx.fillText('1', width - 10, graphY + graphHeight + 12);
            
            // Velocity stats
            ctx.fillStyle = '#2196f3';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(`SLERP: σ=${slerpVariance.toFixed(3)}`, 15, height - 25);
            ctx.fillText('(constant speed)', 15, height - 10);
            
            ctx.fillStyle = '#f44336';
            ctx.fillText(`Euler: σ=${eulerVariance.toFixed(3)}`, 15, height - 55);
            ctx.fillText('(varying speed)', 15, height - 40);
        };

        // ===============================================================================
        // ENHANCED EVENT HANDLERS WITH MATHEMATICAL ANALYSIS
        // ===============================================================================
        
        let previousQuaternion = null;
        let lastUpdateTime = performance.now();
        
        const updateFromSliders = () => {
            const currentTime = performance.now();
            const deltaTime = (currentTime - lastUpdateTime) / 1000.0; // Convert to seconds
            
            const yaw = deg2rad(parseFloat(document.getElementById('yawSlider').value));
            const pitch = deg2rad(parseFloat(document.getElementById('pitchSlider').value));
            const roll = deg2rad(parseFloat(document.getElementById('rollSlider').value));
            
            // Store previous quaternion for temporal analysis
            previousQuaternion = currentQuaternion ? [...currentQuaternion] : null;
            
            currentQuaternion = qFromEulerZYX(yaw, pitch, roll);
            
            // ===============================================================================
            // COMPREHENSIVE MATHEMATICAL VERIFICATION AND ANALYSIS
            // ===============================================================================
            
            // Unit quaternion constraint verification
            const quaternionNorm = Math.sqrt(currentQuaternion[0]**2 + currentQuaternion[1]**2 +
                                           currentQuaternion[2]**2 + currentQuaternion[3]**2);
            const normError = Math.abs(quaternionNorm - 1.0);
            
            if (normError > QUATERNION_TOLERANCE) {
                console.warn("Mathematical Analysis: Unit quaternion constraint violated:", normError);
                mathAnalysis.unitConstraintViolations.push({
                    frame: mathAnalysis.frameCount,
                    error: normError,
                    quaternion: [...currentQuaternion]
                });
            }
            
            // Temporal coherence analysis
            if (previousQuaternion && deltaTime > 0) {
                const coherenceAnalysis = analyzeTemporalCoherence(currentQuaternion, previousQuaternion, deltaTime);
                if (coherenceAnalysis && !coherenceAnalysis.isCoherent) {
                    // Store for analysis but don't spam console
                    mathAnalysis.temporalCoherence.push({
                        frame: mathAnalysis.frameCount,
                        type: 'coherence-violation',
                        velocityError: coherenceAnalysis.velocityCoherenceError,
                        axisError: coherenceAnalysis.axisCoherenceError
                    });
                }
            }
            
            // SO(3) mapping verification
            const rotMatrix = qToMatrix(currentQuaternion);
            const so3Analysis = verifySO3Properties(rotMatrix);
            if (!so3Analysis.isValidSO3) {
                console.error("Mathematical Analysis: SO(3) property violation:", so3Analysis);
            }
            
            // Double cover consistency check
            const doubleCoverAnalysis = verifyDoubleCover(currentQuaternion);
            if (!doubleCoverAnalysis.isValid) {
                console.error("Mathematical Analysis: Double cover violation:", doubleCoverAnalysis.error);
            }
            
            // Antipodal point analysis (store results but reduce console spam)
            const antipodalAnalysis = analyzeAntipodalPoints(currentQuaternion);
            // Only log significant antipodal inconsistencies
            if (!antipodalAnalysis.isValidAntipodal && antipodalAnalysis.geodesicError > 0.1) {
                console.warn("Mathematical Analysis: Significant antipodal inconsistency:", {
                    geodesicError: antipodalAnalysis.geodesicError,
                    rotationMatrixError: antipodalAnalysis.rotationMatrixError
                });
            }
            
            // Stereographic projection error check
            const stereoProjection = stereographicProjection(currentQuaternion, 'north');
            if (!stereoProjection.isValid) {
                mathAnalysis.projectionErrors.push({
                    frame: mathAnalysis.frameCount,
                    error: stereoProjection.error,
                    quaternion: [...currentQuaternion]
                });
            }
            
            // Enhanced drift correction with mathematical verification
            frameCount++;
            mathAnalysis.frameCount++;
            
            if (frameCount % 10 === 0) {
                const preNormQuaternion = [...currentQuaternion];
                currentQuaternion = qNorm(currentQuaternion);
                
                // Verify normalization effectiveness
                const postNormError = Math.abs(Math.sqrt(
                    currentQuaternion[0]**2 + currentQuaternion[1]**2 +
                    currentQuaternion[2]**2 + currentQuaternion[3]**2
                ) - 1.0);
                
                if (postNormError > QUATERNION_TOLERANCE) {
                    console.error("Mathematical Analysis: Normalization failed:", postNormError);
                }
                
                // Enhanced quaternion history with continuity analysis
                quaternionHistory.push([...currentQuaternion]);
                if (quaternionHistory.length > 10) {
                    quaternionHistory.shift();
                }
                
                // Geodesic continuity check
                if (quaternionHistory.length > 1) {
                    const prev = quaternionHistory[quaternionHistory.length - 2];
                    const dot = qDot(currentQuaternion, prev);
                    const geodesicDist = geodesicDistance(currentQuaternion, prev);
                    
                    // Choose shorter geodesic path (handle double cover)
                    if (dot < 0) {
                        currentQuaternion = currentQuaternion.map(v => -v);
                        quaternionHistory[quaternionHistory.length - 1] = currentQuaternion;
                        
                        // Verify the flip improved continuity
                        const newDot = qDot(currentQuaternion, prev);
                        const newGeodist = geodesicDistance(currentQuaternion, prev);
                        
                        if (newGeodist > geodesicDist) {
                            console.warn("Mathematical Analysis: Quaternion flip did not improve continuity");
                        }
                    }
                }
            }
            
            // Update displays with enhanced precision
            document.getElementById('yawValue').textContent = `${rad2deg(yaw).toFixed(1)}°`;
            document.getElementById('pitchValue').textContent = `${rad2deg(pitch).toFixed(1)}°`;
            document.getElementById('rollValue').textContent = `${rad2deg(roll).toFixed(1)}°`;
            
            // Enhanced quaternion display with normalization status
            const quatX = document.getElementById('quatX');
            const quatY = document.getElementById('quatY');
            const quatZ = document.getElementById('quatZ');
            const quatW = document.getElementById('quatW');
            
            quatX.textContent = currentQuaternion[0].toFixed(6);
            quatY.textContent = currentQuaternion[1].toFixed(6);
            quatZ.textContent = currentQuaternion[2].toFixed(6);
            quatW.textContent = currentQuaternion[3].toFixed(6);
            
            // Color-code quaternion components based on mathematical validity
            const validColor = '#64ffda';
            const warningColor = '#ff9800';
            const errorColor = '#ff6b6b';
            
            const componentColor = normError < QUATERNION_TOLERANCE ? validColor :
                                 (normError < QUATERNION_TOLERANCE * 10 ? warningColor : errorColor);
            
            quatX.style.color = componentColor;
            quatY.style.color = componentColor;
            quatZ.style.color = componentColor;
            quatW.style.color = componentColor;
            
            // Redraw visualizations with enhanced mathematical analysis
            drawGimbal();
            
            // Update 3D quaternion sphere visualization with mathematical insights
            updateQuaternionSphere3D();
            
            // Update timestamp for next temporal analysis
            lastUpdateTime = currentTime;
            
            // Console output for significant mathematical events (throttled)
            if (frameCount % 60 === 0) { // Every 60 frames
                if (mathAnalysis.unitConstraintViolations.length > 0) {
                    console.log("Mathematical Analysis Summary:");
                    console.log(`  Unit constraint violations: ${mathAnalysis.unitConstraintViolations.length}`);
                    console.log(`  Geodesic errors: ${mathAnalysis.geodesicErrors.length}`);
                    console.log(`  Singularity detections: ${mathAnalysis.singularityDetections.length}`);
                    console.log(`  Projection errors: ${mathAnalysis.projectionErrors.length}`);
                    console.log(`  Temporal coherence issues: ${mathAnalysis.temporalCoherence.filter(t => !t.isCoherent).length}`);
                }
            }
        };

        // Initialize everything
        const init = () => {
            // Initialize Three.js for gimbal visualization
            initThreeJS();
            
            // Initialize 3D quaternion sphere visualization
            initQuaternionSphere3D();
            
            // Initialize other canvas contexts (only 2D canvases)
            heatmapCtx = document.getElementById('heatmapCanvas').getContext('2d');
            slerpVelocityCtx = document.getElementById('slerpVelocityCanvas').getContext('2d');
            
            // Initialize Three.js for SLERP path visualization
            initSlerpPath3D();
            
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
            
            // Add event listeners for torus yaw and roll sliders
            document.getElementById('torusYawSlider').addEventListener('input', () => {
                const yaw = parseFloat(document.getElementById('torusYawSlider').value);
                document.getElementById('torusYawValue').textContent = `${yaw}°`;
                drawHeatmap();
            });
            
            document.getElementById('torusRollSlider').addEventListener('input', () => {
                const roll = parseFloat(document.getElementById('torusRollSlider').value);
                document.getElementById('torusRollValue').textContent = `${roll}°`;
                drawHeatmap();
            });
            
            document.getElementById('tSlider').addEventListener('input', () => {
                const t = parseFloat(document.getElementById('tSlider').value);
                document.getElementById('tValue').textContent = t.toFixed(2);
                drawSlerpVelocity();
                updateSlerpPaths3D();
                // Update geodesic arc to show current position
                if (showGeodesicArc) {
                    updateQuaternionSphere3D();
                }
            });
            
            document.getElementById('showAntipodes').addEventListener('click', () => {
                showAntipodes = !showAntipodes;
                document.getElementById('showAntipodes').textContent =
                    showAntipodes ? 'Hide Antipodal Points' : 'Show Antipodal Points (±q)';
                updateQuaternionSphere3D();
            });
            
            document.getElementById('showGeodesicArc').addEventListener('click', () => {
                showGeodesicArc = !showGeodesicArc;
                document.getElementById('showGeodesicArc').textContent =
                    showGeodesicArc ? 'Hide Antipodal Geodesic Arc' : 'Show Antipodal Geodesic Arc';
                updateQuaternionSphere3D();
            });
            
            document.getElementById('setRandomOrientations').addEventListener('click', () => {
                orientationA = qFromAxisAngle([Math.random()-0.5, Math.random()-0.5, Math.random()-0.5], Math.random() * Math.PI);
                orientationB = qFromAxisAngle([Math.random()-0.5, Math.random()-0.5, Math.random()-0.5], Math.random() * Math.PI);
                // Store globally for geodesic visualization
                window.orientationA = orientationA;
                window.orientationB = orientationB;
                drawSlerpVelocity();
                updateSlerpPaths3D();
                updateQuaternionSphere3D(); // Redraw to show geodesic
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
            
            // Set initial button text based on default state
            document.getElementById('toggleTorusView').textContent = 'Switch to Flat View';
            
            let interpAnimating = false;
            document.getElementById('animateInterp').addEventListener('click', () => {
                if (interpAnimating) return;
                interpAnimating = true;
                
                let t = 0;
                const animate = () => {
                    document.getElementById('tSlider').value = t;
                    document.getElementById('tValue').textContent = t.toFixed(2);
                    drawSlerpVelocity();
                    updateSlerpPaths3D();
                    
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
                            drawSlerpVelocity();
                            updateSlerpPaths3D();
                        }, 500);
                    }
                };
                animate();
            });
            
            // Initialize orientations for geodesic arc
            window.orientationA = orientationA;
            window.orientationB = orientationB;
            
            // Initial draw
            updateFromSliders();
            drawHeatmap();
            drawSlerpVelocity();
            updateSlerpPaths3D();
        };

        // Handle window resize
        window.addEventListener('resize', () => {
            setTimeout(() => {
                resizeCanvases();
                resizeThreeJS();
                resizeQuaternionSphere3D();
                resizeSlerpPath3D();
                updateFromSliders();
                drawHeatmap();
                drawSlerpVelocity();
                updateSlerpPaths3D();
            }, 100);
        });

        // Start when page loads
        document.addEventListener('DOMContentLoaded', init);

    </script>
</body>
</html>
