/**
 * Ngandu Kapinga Ntita - Portfolio Revision
 * Premium portfolio interactions: Custom Cursor, Lenis Smooth Scroll, GSAP
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // Remove loading class
    setTimeout(() => {
        document.body.classList.remove('loading');
    }, 500);

    /* =========================================================================
       CUSTOM CURSOR
       ========================================================================= */
    const cursor = document.getElementById("cursor");
    const cursorFollower = document.getElementById("cursor-follower");
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant cursor
        gsap.to(cursor, {
            x: mouseX,
            y: mouseY,
            duration: 0.1,
            ease: "power2.out"
        });
    });

    // Cursor Follower (lagged)
    gsap.ticker.add(() => {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        gsap.set(cursorFollower, { x: cursorX, y: cursorY });
    });

    // Hover effects on links/buttons
    const hoverElements = document.querySelectorAll("a, button, .project-card");
    hoverElements.forEach(el => {
        el.addEventListener("mouseenter", () => {
            cursor.classList.add("hover");
            cursorFollower.classList.add("hover");
        });
        el.addEventListener("mouseleave", () => {
            cursor.classList.remove("hover");
            cursorFollower.classList.remove("hover");
        });
    });


    /* =========================================================================
       LENIS SMOOTH SCROLLING
       ========================================================================= */
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        direction: 'vertical', 
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);
    
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);
    /* =========================================================================
       GSAP SCROLLTRIGGER ANIMATIONS
       ========================================================================= */
    const reveals = document.querySelectorAll('.gs-reveal');
    reveals.forEach(element => {
        gsap.fromTo(element, 
            { y: 50, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 1, 
                ease: "power3.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Slide in from Left
    const revealLeft = document.querySelectorAll('.gs-reveal-left');
    revealLeft.forEach(element => {
        gsap.fromTo(element, 
            { x: -50, opacity: 0 },
            { 
                x: 0, 
                opacity: 1, 
                duration: 1, 
                ease: "power3.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 80%"
                }
            }
        );
    });

    // Slide in from Right
    const revealRight = document.querySelectorAll('.gs-reveal-right');
    revealRight.forEach(element => {
        gsap.fromTo(element, 
            { x: 50, opacity: 0 },
            { 
                x: 0, 
                opacity: 1, 
                duration: 1, 
                ease: "power3.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 80%"
                }
            }
        );
    });

    // Story cards move right-to-left and fade in/out through the viewport
    const storyPanels = document.querySelectorAll('.story-content .panel');
    storyPanels.forEach((panel, index) => {
        const card = panel.querySelector('.panel-content');
        if (!card) return;

        const startX = 180 + (index % 2) * 40;
        const endX = -180 - (index % 2) * 40;

        const cardTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: panel,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });

        cardTimeline.fromTo(
            card,
            { x: startX, opacity: 0.15 },
            { x: 0, opacity: 1, ease: 'none', duration: 0.45 }
        );

        cardTimeline.to(card, {
            x: endX,
            opacity: 0.15,
            ease: 'none',
            duration: 0.55
        });
    });

    // Hero globe: dynamic camera orbit + pointer-reactive tilt for a richer feel
    const heroModelViewer = document.getElementById('hero-model-viewer');
    if (heroModelViewer) {
        let pointerX = 0;
        let pointerY = 0;
        let smoothX = 0;
        let smoothY = 0;
        let orbitTime = 0;

        const updatePointer = (event) => {
            const nx = (event.clientX / window.innerWidth) * 2 - 1;
            const ny = (event.clientY / window.innerHeight) * 2 - 1;
            pointerX = Math.max(-1, Math.min(1, nx));
            pointerY = Math.max(-1, Math.min(1, ny));
        };

        window.addEventListener('mousemove', updatePointer);

        gsap.ticker.add(() => {
            orbitTime += 0.0035;
            smoothX += (pointerX - smoothX) * 0.04;
            smoothY += (pointerY - smoothY) * 0.04;

            const azimuth = 36 + Math.sin(orbitTime * 2.4) * 10 + smoothX * 16;
            const polar = 74 + Math.cos(orbitTime * 1.7) * 4 + smoothY * 7;
            const radius = 103 + Math.sin(orbitTime * 2.8) * 5;
            const speed = 12 + Math.sin(orbitTime * 2.1) * 4;

            heroModelViewer.setAttribute('camera-orbit', `${azimuth.toFixed(2)}deg ${polar.toFixed(2)}deg ${radius.toFixed(2)}%`);
            heroModelViewer.setAttribute('rotation-per-second', `${speed.toFixed(2)}deg`);
        });
    }

    /* =========================================================================
       MODAL LOGIC
       ========================================================================= */
    const projectModal = document.getElementById("projectModal");
    const projectModalTitle = document.getElementById("projectModalTitle");
    const projectModalDesc = document.getElementById("projectModalDesc");
    const projectModalGallery = document.getElementById("projectModalGallery");
    const projectModalLink = document.getElementById("projectModalLink");
    const imageLightbox = document.getElementById("imageLightbox");
    const imageLightboxImg = document.getElementById("imageLightboxImg");
    
    function openProjectModal(card) {
      if (!projectModal || !card) return;
    
      const title = card.dataset.title || "Project";
      const description = card.dataset.description || "";
      const link = card.dataset.link || "#";
      const images = (card.dataset.images || "").split(",").map((item) => item.trim()).filter(Boolean);
    
      projectModalTitle.textContent = title;
      projectModalDesc.textContent = description;
      projectModalLink.href = link;
    
      projectModalGallery.innerHTML = "";
      images.forEach((src) => {
        const img = document.createElement("img");
        img.src = src;
        img.loading = "lazy";
        img.alt = `${title} preview`;
        img.addEventListener("click", () => {
          openImageLightbox(src, `${title} preview`);
        });
        projectModalGallery.appendChild(img);
      });
    
      projectModal.classList.add("is-open");
      projectModal.setAttribute("aria-hidden", "false");
      lenis.stop(); // Pause smooth scrolling while modal is open
    }
    
    function closeProjectModal() {
      if (!projectModal) return;
      projectModal.classList.remove("is-open");
      projectModal.setAttribute("aria-hidden", "true");
      lenis.start(); // Resume scrolling
    }
    
    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("click", () => openProjectModal(card));
    });
    
    document.addEventListener("click", (event) => {
      if (!projectModal || !projectModal.classList.contains("is-open")) return;
      if (imageLightbox && imageLightbox.classList.contains("is-open")) return;
      const target = event.target;
      if (target && target.getAttribute("data-close") === "true") {
        closeProjectModal();
      }
    });
    
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (imageLightbox && imageLightbox.classList.contains("is-open")) {
          closeImageLightbox();
          return;
        }
        closeProjectModal();
      }
    });

    // Lightbox for gallery images
    function openImageLightbox(src, altText) {
      if (!imageLightbox || !imageLightboxImg) return;
      imageLightboxImg.src = src;
      imageLightboxImg.alt = altText || "Project preview";
      imageLightbox.classList.add("is-open");
      imageLightbox.setAttribute("aria-hidden", "false");
    }
    
    function closeImageLightbox() {
      if (!imageLightbox || !imageLightboxImg) return;
      imageLightbox.classList.remove("is-open");
      imageLightbox.setAttribute("aria-hidden", "true");
      setTimeout(() => { imageLightboxImg.src = ""; }, 300);
    }
    
    document.addEventListener("click", (event) => {
      if (!imageLightbox || !imageLightbox.classList.contains("is-open")) return;
      const target = event.target;
      if (target && target.getAttribute("data-close") === "true") {
        event.stopPropagation();
        closeImageLightbox();
      }
    });

    // Add back to top functionality
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            lenis.scrollTo(0, { duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        });
    }

    /* =========================================================================
       PARTICLES.JS CONFIGURATION
       ========================================================================= */
    const particlesConfig = {
        "particles": {
            "number": {
                "value": 40,
                "density": { "enable": true, "value_area": 800 }
            },
            "color": { "value": ["#64ffda", "#bd34fe", "#ffffff"] },
            "shape": { "type": "circle" },
            "opacity": {
                "value": 0.5,
                "random": true,
                "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": { "enable": true, "speed": 2, "size_min": 0.1, "sync": false }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#ffffff",
                "opacity": 0.2,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 1.5,
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": { "enable": true, "mode": "grab" },
                "onclick": { "enable": false },
                "resize": true
            },
            "modes": {
                "grab": { "distance": 140, "line_linked": { "opacity": 0.5 } }
            }
        },
        "retina_detect": true
    };

    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-hero', particlesConfig);
        particlesJS('particles-contact', particlesConfig);
    }
});
