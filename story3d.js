// A breath-taking, premium progressive WebGL Story Globe
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('story-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030305, 0.022); // Keep distant stars visible

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Expensive colored rim lights
    const light1 = new THREE.PointLight(0xbd34fe, 3, 50); // Purple
    light1.position.set(6, 6, 4);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x64ffda, 3, 50); // Teal
    light2.position.set(-6, -6, 4);
    scene.add(light2);

    const light3 = new THREE.PointLight(0xffffff, 1.5, 50);
    light3.position.set(0, 0, 8);
    scene.add(light3);

    // --- GLOBE 1: Solid Dark Metallic Core ---
    const coreGeo = new THREE.SphereGeometry(1.6, 64, 64);
    const coreMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a14,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.95
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    
    // --- GLOBE 2: Wireframe Halo ---
    const wireGeo = new THREE.SphereGeometry(1.85, 32, 32);
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x64ffda,
        wireframe: true,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);

    // --- GLOBE 3: Progressive Particle Sphere ---
    const particleCount = 6000;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pOrigPos = new Float32Array(particleCount * 3);
    const pRand = new Float32Array(particleCount);

    for(let i=0; i<particleCount; i++) {
        // distribute uniformly on sphere surface
        const phi = Math.acos( -1 + ( 2 * i ) / particleCount );
        const theta = Math.sqrt( particleCount * Math.PI ) * phi;
        const r = 2.0;

        const x = r * Math.cos(theta) * Math.sin(phi);
        const y = r * Math.sin(theta) * Math.sin(phi);
        const z = r * Math.cos(phi);

        pPos[i*3]     = x; pPos[i*3+1]   = y; pPos[i*3+2]   = z;
        pOrigPos[i*3] = x; pOrigPos[i*3+1] = y; pOrigPos[i*3+2] = z;
        pRand[i] = Math.random();
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('originalPosition', new THREE.BufferAttribute(pOrigPos, 3));
    pGeo.setAttribute('aRandom', new THREE.BufferAttribute(pRand, 1));

    const pMat = new THREE.PointsMaterial({
        size: 0.03,
        color: 0xbd34fe,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });
    const particleSphere = new THREE.Points(pGeo, pMat);

    // Global Group
    const globeGroup = new THREE.Group();
    globeGroup.add(coreMesh);
    globeGroup.add(wireMesh);
    globeGroup.add(particleSphere);
    scene.add(globeGroup);

    // --- BACKGROUND STARS (Always visible) ---
    const starsGeo = new THREE.BufferGeometry();
    const starsPos = new Float32Array(3000 * 3);
    for(let i=0; i<3000*3; i++) {
        starsPos[i] = (Math.random() - 0.5) * 60; 
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
    const starsMat = new THREE.PointsMaterial({
        size: 0.04,
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });
    const backgroundStars = new THREE.Points(starsGeo, starsMat);
    scene.add(backgroundStars);

    // --- ORBITING NODES (Builder Mode) ---
    const nodeGroup = new THREE.Group();
    for(let i=0; i<3; i++) {
        const nGeo = new THREE.SphereGeometry(0.2, 32, 32);
        const nMat = new THREE.MeshStandardMaterial({color: 0xffffff, emissive: 0xbd34fe, emissiveIntensity: 0.8});
        const nMesh = new THREE.Mesh(nGeo, nMat);
        nMesh.position.set( Math.cos((i/3)*Math.PI*2)*3.5, Math.sin((i/3)*Math.PI*2)*3.5, 0 );
        nodeGroup.add(nMesh);
    }
    nodeGroup.scale.set(0,0,0);
    globeGroup.add(nodeGroup);

    // GSAP Managed State for extremely smooth transitions
    const state = {
        noiseStrength: 0,
        particleExplode: 0,
        wireOpacity: 0.05,
        coreOpacity: 0.95,
        starSpeed: 0.0016,
        starOpacity: 0.62,
        starPulse: 0.14,
        globeRotationSpeed: 0.0036,
        flare: 0,
        flarePulse: 0,
        flareFloor: 0.08
    };

    // Initial scale for Intro
    globeGroup.scale.set(0.01, 0.01, 0.01);

    // Render loop
    const clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // 1. Sleek Rotations
        globeGroup.rotation.y += state.globeRotationSpeed;
        globeGroup.rotation.x += state.globeRotationSpeed * 0.5;
        nodeGroup.rotation.z -= 0.01;

        // Background stars constantly rotate smoothly
        backgroundStars.rotation.y += state.starSpeed;
        backgroundStars.rotation.x += state.starSpeed * 0.5;
        // Keep starfield alive with twinkle instead of fading to static
        starsMat.opacity = Math.max(0.35, Math.min(0.95, state.starOpacity + Math.sin(time * 2.1) * state.starPulse));

        // Cinematic micro flare system for milestone moments (S5/S8)
        const flareWave = Math.sin(time * 18) * 0.25 + 0.75;
        const flareValue = (state.flareFloor + state.flare + state.flarePulse * flareWave);
        light1.intensity = 3 + flareValue * 6.2;
        light2.intensity = 3 + flareValue * 6.2;
        light3.intensity = 1.5 + flareValue * 2.2;
        wireMat.opacity = Math.min(0.98, state.wireOpacity + flareValue * 0.3);

        // 2. Liquid / Morphing effect on the particle sphere
        const curPositions = particleSphere.geometry.attributes.position.array;
        const origPositions = particleSphere.geometry.attributes.originalPosition.array;
        const rand = particleSphere.geometry.attributes.aRandom.array;

        for(let i=0; i<particleCount; i++) {
            const ix = i*3, iy = i*3+1, iz = i*3+2;
            
            const origX = origPositions[ix];
            const origY = origPositions[iy];
            const origZ = origPositions[iz];

            const length = Math.sqrt(origX*origX + origY*origY + origZ*origZ);
            const dirX = origX/length;
            const dirY = origY/length;
            const dirZ = origZ/length;

            // Liquid breathing based on spherical position mapping
            const wave = Math.sin(time * 2 + origX * 1.5 + origY * 1.5) * state.noiseStrength;
            
            // Explosive turbulent deformation
            const explode = state.particleExplode * rand[i] * 3.0;

            const displacement = wave + explode;

            curPositions[ix] = origX + dirX * displacement;
            curPositions[iy] = origY + dirY * displacement;
            curPositions[iz] = origZ + dirZ * displacement;
        }
        particleSphere.geometry.attributes.position.needsUpdate = true;

        // Apply smooth opacities
        coreMat.opacity = state.coreOpacity;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // GSAP Scroll Animations Pipeline
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        
        // Intro (S1) - Globe gracefully emerges inside the permanent starfield
        const tl1 = gsap.timeline({ scrollTrigger: { trigger: "#s1", start: "top center", end: "bottom center", scrub: 1 } });
        tl1.to(globeGroup.scale, { x: 1, y: 1, z: 1, duration: 1 })
           .to(state, { wireOpacity: 0.15, duration: 1 }, 0);

        // First Build (S2) - Subtle wireframe pulse & slight distortion
        const tl2 = gsap.timeline({ scrollTrigger: { trigger: "#s2", start: "top center", end: "bottom center", scrub: 1 } });
        tl2.to(state, { wireOpacity: 0.5, noiseStrength: 0.08, duration: 1 })
           .to(globeGroup.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 1 }, 0)
           .to(wireMat.color, { r: 100/255, g: 255/255, b: 218/255, duration: 1 }, 0);

        // Learning (S3) - Speed shifts, immense particle glow
        const tl3 = gsap.timeline({ scrollTrigger: { trigger: "#s3", start: "top center", end: "bottom center", scrub: 1 } });
        tl3.to(globeGroup.rotation, { z: Math.PI * 0.5, duration: 1 })
           .to(state, { globeRotationSpeed: 0.008, starSpeed: 0.003, noiseStrength: 0.2, duration: 1 }, 0)
           .to(pMat, { size: 0.05, opacity: 0.9, duration: 1 }, 0);

        // Freelance (S4) - Chaotic turbulence
        const tl4 = gsap.timeline({ scrollTrigger: { trigger: "#s4", start: "top center", end: "bottom center", scrub: 1 } });
        tl4.to(globeGroup.rotation, { x: "+=2", y: "+=2", duration: 1 })
           .to(state, { noiseStrength: 0.4, duration: 1 }, 0)
           .to(camera.position, { z: 8, duration: 1 }, 0); 

        // Professional (S5) - High energy, controlled power (no visual drop-off)
        const tl5 = gsap.timeline({ scrollTrigger: { trigger: "#s5", start: "top center", end: "bottom center", scrub: 1 } });
        tl5.to(state, {
            noiseStrength: 0.24,
            particleExplode: 0,
            wireOpacity: 0.62,
            coreOpacity: 0.96,
            starSpeed: 0.003,
            starOpacity: 0.8,
            starPulse: 0.28,
            globeRotationSpeed: 0.006,
            duration: 1
            })
           .to(pMat, { color: 0x64ffda, size: 0.045, opacity: 0.95, duration: 1 }, 0)
           .to(camera.position, { z: 8.3, duration: 1 }, 0)
           .to(light1, { intensity: 5.4, duration: 1 }, 0)
           .to(light2, { intensity: 5.4, duration: 1 }, 0);

        // S5 milestone burst (single energetic flare pulse)
        ScrollTrigger.create({
            trigger: "#s5",
            start: "top 55%",
            onEnter: () => {
                gsap.killTweensOf(state, "flare flarePulse");
                gsap.fromTo(state, { flare: 0, flarePulse: 0 }, {
                    flare: 1.45,
                    flarePulse: 0.95,
                    duration: 0.85,
                    ease: "power3.out",
                    yoyo: true,
                    repeat: 1
                });
                gsap.to(state, { flare: 0.32, flarePulse: 0.24, duration: 1.7, delay: 1.1, ease: "power2.out" });
            },
            onEnterBack: () => {
                gsap.killTweensOf(state, "flare flarePulse");
                gsap.fromTo(state, { flare: 0, flarePulse: 0 }, {
                    flare: 1.25,
                    flarePulse: 0.7,
                    duration: 0.75,
                    ease: "power2.out",
                    yoyo: true,
                    repeat: 1
                });
                gsap.to(state, { flare: 0.28, flarePulse: 0.2, duration: 1.4, delay: 1.0, ease: "power2.out" });
            }
        });

        // Failure (S6) - elegant particle dispersion breaking logic 
        const tl6 = gsap.timeline({ scrollTrigger: { trigger: "#s6", start: "top center", end: "bottom center", scrub: 1 } });
        tl6.to(state, { particleExplode: 0.6, coreOpacity: 0.3, wireOpacity: 0.4, noiseStrength: 0.0, starSpeed: 0.0028, starOpacity: 0.68, starPulse: 0.24, duration: 1 })
           .to(pMat, { color: 0xbd34fe, size: 0.04, duration: 1 }, 0);

        // Builder Mode (S7) - Particles snap back, nodes arise
        const tl7 = gsap.timeline({ scrollTrigger: { trigger: "#s7", start: "top center", end: "bottom center", scrub: 1 } });
        tl7.to(state, { particleExplode: 0, noiseStrength: 0.15, coreOpacity: 0.9, starSpeed: 0.0025, starOpacity: 0.7, starPulse: 0.2, duration: 1 })
           .to(wireMat.color, { r: 189/255, g: 52/255, b: 254/255, duration: 1 }, 0)
           .to(nodeGroup.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "back.out(1.5)" }, 0.5);

        // Final (S8) - Dimensional Pulse Expanding outward
        const tl8 = gsap.timeline({ scrollTrigger: { trigger: "#s8", start: "top center", end: "bottom center", scrub: 1 } });
        tl8.to(globeGroup.scale, { x: 0.8, y: 0.8, z: 0.8, duration: 0.3 })
           .to(globeGroup.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.7 }, 0.3)
               .to(state, { noiseStrength: 0.58, wireOpacity: 0.9, starSpeed: 0.0034, starOpacity: 0.88, starPulse: 0.34, globeRotationSpeed: 0.0075, duration: 0.7 }, 0.3)
           .to(light1, { intensity: 6, duration: 0.7 }, 0.3)
           .to(light2, { intensity: 6, duration: 0.7 }, 0.3);

            // S8 milestone burst (stronger finale flare)
            ScrollTrigger.create({
                trigger: "#s8",
                start: "top 60%",
                onEnter: () => {
                    gsap.killTweensOf(state, "flare flarePulse");
                    gsap.fromTo(state, { flare: 0.2, flarePulse: 0 }, {
                        flare: 2.0,
                        flarePulse: 1.2,
                        duration: 1.05,
                        ease: "power4.out",
                        yoyo: true,
                        repeat: 1
                    });
                    gsap.to(state, { flare: 0.45, flarePulse: 0.32, duration: 2.2, delay: 1.3, ease: "power1.out" });
                },
                onEnterBack: () => {
                    gsap.killTweensOf(state, "flare flarePulse");
                    gsap.fromTo(state, { flare: 0.2, flarePulse: 0 }, {
                        flare: 1.6,
                        flarePulse: 0.95,
                        duration: 0.9,
                        ease: "power3.out",
                        yoyo: true,
                        repeat: 1
                    });
                    gsap.to(state, { flare: 0.36, flarePulse: 0.26, duration: 1.9, delay: 1.2, ease: "power1.out" });
                }
            });
    }
});
