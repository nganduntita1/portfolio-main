/**
 * ribbon3d.js — Scroll-based 3D model
 * Single scrubbed timeline drives all position/scale changes smoothly.
 */
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("ribbon-canvas");
    if (!canvas || typeof THREE === "undefined") return;

    const isMobile = window.innerWidth < 768;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // ── Scene & Camera ────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 10);

    // ── Lights ────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    const rimTeal = new THREE.PointLight(0x64ffda, 0, 25);
    rimTeal.position.set(5, 3, 6);
    scene.add(rimTeal);

    const rimPurple = new THREE.PointLight(0xbd34fe, 3, 25);
    rimPurple.position.set(-5, -3, 6);
    scene.add(rimPurple);

    const fill = new THREE.DirectionalLight(0xffffff, 0.8);
    fill.position.set(0, 6, 8);
    scene.add(fill);

    // ── Tween target — single object GSAP writes to, render loop reads ───
    const T = { x: 0, y: 0, camZ: 10, opacity: 1 };

    // ── Mouse parallax ────────────────────────────────────────────────────
    const mouse = { nx: 0, ny: 0, sx: 0, sy: 0 };
    if (!isMobile) {
        window.addEventListener("mousemove", (e) => {
            mouse.nx = (e.clientX / window.innerWidth)  * 2 - 1;
            mouse.ny = (e.clientY / window.innerHeight) * 2 - 1;
        });
    }

    // ── Model ─────────────────────────────────────────────────────────────
    let model = null;
    let materials = [];
    let baseRotY = 0;

    const loaderScript = document.createElement("script");
    loaderScript.src = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js";
    loaderScript.onload = () => {
        const loader = new THREE.GLTFLoader();
        loader.load("abstract/scene.gltf", (gltf) => {
            model = gltf.scene;

            const box  = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const ctr  = box.getCenter(new THREE.Vector3());
            const s    = (isMobile ? 2.5 : 3.8) / Math.max(size.x, size.y, size.z);
            model.scale.setScalar(s);
            model.position.copy(ctr.multiplyScalar(-s));

            model.traverse((c) => {
                if (!c.isMesh) return;
                const mats = Array.isArray(c.material) ? c.material : [c.material];
                mats.forEach((m) => {
                    if (m.emissive) m.emissiveIntensity = 0.35;
                    m.transparent = true;
                    materials.push(m);
                });
            });

            scene.add(model);
            setupScrollAnimations();
        }, undefined, (e) => console.warn("GLTF error:", e));
    };
    document.head.appendChild(loaderScript);

    // ── Render loop ───────────────────────────────────────────────────────
    const clock = new THREE.Clock();

    (function animate() {
        requestAnimationFrame(animate);
        const dt = clock.getDelta();

        mouse.sx += (mouse.nx - mouse.sx) * 0.05;
        mouse.sy += (mouse.ny - mouse.sy) * 0.05;

        if (model) {
            baseRotY += dt * 0.45;

            model.position.x = T.x;
            model.position.y = T.y;

            model.rotation.y = baseRotY + mouse.sx * 0.2;
            model.rotation.x = mouse.sy * 0.15;

            materials.forEach((m) => { m.opacity = T.opacity; });
        }

        camera.position.z = T.camZ;
        renderer.render(scene, camera);
    })();

    // ── Resize ────────────────────────────────────────────────────────────
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ── Hide during story section ─────────────────────────────────────────
    if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.create({
            trigger: "#story",
            start: "top 5%",
            end: "bottom 5%",
            onEnter:     () => canvas.classList.add("hidden"),
            onLeave:     () => canvas.classList.remove("hidden"),
            onEnterBack: () => canvas.classList.add("hidden"),
            onLeaveBack: () => canvas.classList.remove("hidden")
        });

        // Overlay fades in as user leaves hero — dims model so text is readable
        const overlay = document.getElementById("ribbon-overlay");
        if (overlay) {
            gsap.to(overlay, {
                opacity: 0.78,
                ease: "none",
                scrollTrigger: {
                    trigger: ".hero",
                    start: "bottom 85%",
                    end: "bottom 30%",
                    scrub: true
                }
            });
        }
    }

    // ── Scroll animations — one timeline per section, no conflicts ────────
    function setupScrollAnimations() {
        if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

        // Positions scale down on mobile so model stays centered & visible
        const farLeft  = isMobile ? -1.2 : -3.8;
        const farRight = isMobile ?  1.2 :  3.8;
        const center   = 0;
        const scrub    = 2; // higher = smoother/slower catch-up

        // Set hero start state
        gsap.set(T, {
            x: isMobile ? 0 : 2.0,
            y: isMobile ? 1.8 : 0,
            camZ: isMobile ? 12 : 6,
            opacity: 1
        });

        // METRICS — drift toward center, pull back slightly
        gsap.to(T, {
            x: center, y: 0, camZ: isMobile ? 14 : 8, opacity: 0.6,
            ease: "power1.inOut",
            scrollTrigger: {
                trigger: ".metrics-section",
                start: "top 90%",
                end: "bottom 10%",
                scrub
            }
        });

        // ABOUT — far left
        gsap.to(T, {
            x: farLeft, y: 0, camZ: isMobile ? 13 : 7, opacity: 0.65,
            ease: "power1.inOut",
            scrollTrigger: {
                trigger: ".about",
                start: "top 90%",
                end: "bottom 10%",
                scrub
            }
        });

        // EXPERIENCE — far right
        gsap.to(T, {
            x: farRight, y: 0, camZ: isMobile ? 13 : 7, opacity: 0.65,
            ease: "power1.inOut",
            scrollTrigger: {
                trigger: ".experience",
                start: "top 90%",
                end: "bottom 10%",
                scrub
            }
        });

        // PROJECTS — center, zoomed out small
        gsap.to(T, {
            x: center, y: 0, camZ: isMobile ? 22 : 14, opacity: 0.5,
            ease: "power1.inOut",
            scrollTrigger: {
                trigger: ".projects",
                start: "top 90%",
                end: "bottom 10%",
                scrub
            }
        });

        // CONTACT — far right, small
        gsap.to(T, {
            x: isMobile ? 1.0 : farRight + 1.2,
            y: 0,
            camZ: isMobile ? 24 : 16,
            opacity: 0.4,
            ease: "power1.inOut",
            scrollTrigger: {
                trigger: ".contact",
                start: "top 90%",
                end: "bottom 10%",
                scrub
            }
        });
    }
});
