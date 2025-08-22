// Enhanced Interactive Effects for Professional Website
// Performance optimized with reduced motion support

document.addEventListener('DOMContentLoaded', function() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Delay non-critical animations for faster initial load
    setTimeout(() => initializeEffects(prefersReducedMotion), 100);
});

function initializeEffects(prefersReducedMotion = false) {
    const body = document.body;
    
    // Only add floating shapes if motion is not reduced and user prefers animations
    if (!prefersReducedMotion) {
        // Create subtle floating shapes - reduced count for better performance
        const shapesContainer = document.createElement('div');
        const shapeTypes = ['circle', 'square'];
        shapesContainer.className = 'floating-shapes';
        for (let i = 0; i < 3; i++) {
            const shape = document.createElement('div');
            const type = shapeTypes[i % shapeTypes.length];
            shape.className = `shape ${type}`;
            shape.style.left = Math.random() * 100 + '%';
            shape.style.top = Math.random() * 100 + '%';
            shape.style.animationDuration = 25 + Math.random() * 10 + 's';
            shape.style.animationDelay = Math.random() * 3 + 's';
            shapesContainer.appendChild(shape);
        }
        body.appendChild(shapesContainer);
    }
    
    // Create subtle static background accents (optional)
    const createBackgroundAccents = false; // Set to true if you want very subtle accents
    if (createBackgroundAccents) {
        const accent1 = document.createElement('div');
        accent1.className = 'background-accent accent1';
        body.appendChild(accent1);
        
        const accent2 = document.createElement('div');
        accent2.className = 'background-accent accent2';
        body.appendChild(accent2);
    }
    
    // Scroll Progress Indicator
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.width = '0%';
    document.body.appendChild(progressBar);
    
    // Debounced scroll handler for better performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(() => {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.scrollY / windowHeight) * 100;
            progressBar.style.width = scrolled + '%';
            scrollTimeout = null;
        }, 5);
    }, { passive: true });
    
    // Optimized parallax effect with throttling
    const parallaxElements = document.querySelectorAll('.profile img, .card');
    let parallaxTimeout;
    
    window.addEventListener('scroll', () => {
        if (parallaxTimeout) return;
        parallaxTimeout = setTimeout(() => {
            const scrolled = window.pageYOffset;
            parallaxElements.forEach(el => {
                const speed = el.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                el.style.transform = `translateY(${yPos * 0.1}px)`;
            });
            parallaxTimeout = null;
        }, 20);
    }, { passive: true });
    
    // Add reveal animations on scroll
    const revealElements = document.querySelectorAll('.publications li, .projects .card, .news li, .timeline li');
    
    const revealOnScroll = () => {
        revealElements.forEach(el => {
            if (!el.classList.contains('reveal')) {
                el.classList.add('reveal');
            }
            
            const elementTop = el.getBoundingClientRect().top;
            const elementBottom = el.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100 && elementBottom > 0) {
                el.classList.add('active');
            }
        });
    };
    
    // Throttled scroll reveal
    let revealTimeout;
    window.addEventListener('scroll', () => {
        if (revealTimeout) return;
        revealTimeout = setTimeout(() => {
            revealOnScroll();
            revealTimeout = null;
        }, 50);
    }, { passive: true });
    
    // Delay initial reveal for faster page load
    setTimeout(revealOnScroll, 200);
    
    // Typing effect for main title
    const title = document.querySelector('h1');
    if (title && !title.classList.contains('typing-effect')) {
        const text = title.textContent;
        title.setAttribute('data-text', text);
        title.classList.add('glitch');
    }
    
    // Rainbow text for special elements
    const specialElements = document.querySelectorAll('.navbar-brand, .footer a');
    specialElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.classList.add('rainbow-text');
        });
        el.addEventListener('mouseleave', () => {
            setTimeout(() => {
                el.classList.remove('rainbow-text');
            }, 1000);
        });
    });
    
    // Magnetic button effect (excluding publication buttons)
    const magneticButtons = document.querySelectorAll('.btn:not(.btn-sm), button:not([data-toggle]), .nav-link');
    
    magneticButtons.forEach(btn => {
        // Skip publication-related buttons
        if (btn.textContent.trim() === 'Abs' ||
            btn.textContent.trim() === 'Bib' ||
            btn.textContent.trim() === 'PDF' ||
            btn.textContent.trim() === 'HTML' ||
            btn.textContent.trim() === 'Supp' ||
            btn.classList.contains('btn-sm')) {
            return;
        }
        
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.05)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0) scale(1)';
        });
    });
    
    // Add spotlight effect to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('spotlight');
    });
    
    // Particle effect (lightweight version)
    const createParticle = () => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = Math.random() * 20 + 10 + 's';
        particle.style.animationDelay = Math.random() * 10 + 's';
        
        const particlesContainer = document.querySelector('.particles');
        if (particlesContainer) {
            particlesContainer.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                particle.remove();
            }, 30000);
        }
    };
    
    // Simplified particle system - only if motion is preferred
    if (!prefersReducedMotion) {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        body.appendChild(particlesContainer);
        
        // Create minimal particles for better performance
        for (let i = 0; i < 5; i++) {
            setTimeout(() => createParticle(), i * 2000);
        }
        
        // Create particles less frequently
        setInterval(createParticle, 8000);
    }
    
    // Mouse trail effect - disabled by default for better performance
    // Can be enabled for special occasions or high-end devices
    const mouseTrailEnabled = false;
    
    if (mouseTrailEnabled && !prefersReducedMotion) {
        const trail = document.createElement('div');
        trail.className = 'mouse-trail';
        body.appendChild(trail);
        
        let mouseX = 0, mouseY = 0;
        let trailX = 0, trailY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        const animateTrail = () => {
            trailX += (mouseX - trailX) * 0.1;
            trailY += (mouseY - trailY) * 0.1;
            
            trail.style.left = trailX + 'px';
            trail.style.top = trailY + 'px';
            
            requestAnimationFrame(animateTrail);
        };
        animateTrail();
    }
    
    // Add liquid fill effect to buttons on hover
    const liquidButtons = document.querySelectorAll('.btn');
    liquidButtons.forEach(btn => {
        if (!btn.classList.contains('liquid-fill')) {
            btn.classList.add('liquid-fill');
        }
    });
    
    // Enhanced scroll animations with stagger
    const staggerElements = document.querySelectorAll('.publications li, .projects .card');
    staggerElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Smooth page load animation - only if motion is preferred
    if (!prefersReducedMotion) {
        document.body.style.opacity = '0';
        requestAnimationFrame(() => {
            document.body.style.transition = 'opacity 0.3s ease';
            document.body.style.opacity = '1';
        });
    }
    
    // Add loading indicator
    addLoadingEnhancements();
    
    // Fun interactive features
    addFunInteractions();
    
    // Console Easter Egg
    console.log('%c Welcome to Saeed Ghorbani\'s Website! 🚀',
                'font-size: 20px; font-weight: bold; color: #6C63FF; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);');
    console.log('%c Built with ❤️ and modern web technologies',
                'font-size: 14px; color: #4ECDC4;');
    console.log('%c Try clicking around for some surprises! 😉',
                'font-size: 12px; color: #FF6B6B;');
}

// Fun interactive features
function addFunInteractions() {
    // Interactive particle burst on click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('a, button, .btn')) {
            createClickBurst(e.clientX, e.clientY);
        }
    });
    
    // Konami Code Easter Egg
    let konamiCode = [];
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.code);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            triggerKonamiEasterEgg();
            konamiCode = [];
        }
    });
    
    // Fun name hover effect
    const nameElement = document.querySelector('h1');
    if (nameElement) {
        let hoverCount = 0;
        nameElement.addEventListener('mouseenter', () => {
            hoverCount++;
            if (hoverCount % 5 === 0) {
                nameElement.style.transform = 'rotate(5deg)';
                setTimeout(() => {
                    nameElement.style.transform = 'rotate(0deg)';
                }, 200);
            }
        });
    }
}

// Show temporary message
function showTemporaryMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.textContent = message;
    msgDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--global-theme-color);
        color: white;
        padding: 10px 20px;
        border-radius: 25px;
        font-size: 14px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(msgDiv);
    
    setTimeout(() => {
        msgDiv.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => msgDiv.remove(), 300);
    }, 2000);
}


// Click burst effect
function createClickBurst(x, y) {
    const colors = ['#6C63FF', '#4ECDC4', '#FF6B6B', '#FFE66D', '#A8E6CF'];
    
    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${x}px;
            top: ${y}px;
        `;
        
        const angle = (Math.PI * 2 * i) / 6;
        const velocity = 50 + Math.random() * 50;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        document.body.appendChild(particle);
        
        let posX = x;
        let posY = y;
        let opacity = 1;
        
        const animate = () => {
            posX += vx * 0.02;
            posY += vy * 0.02;
            opacity -= 0.02;
            
            particle.style.left = posX + 'px';
            particle.style.top = posY + 'px';
            particle.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
}


// Konami code easter egg
function triggerKonamiEasterEgg() {
    showTemporaryMessage('🎮 Konami Code activated! You are a true gamer!');
    
    // Add matrix rain effect for a few seconds
    createMatrixRain();
    
    // Play a fun sound effect (if audio is enabled)
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBjiS1/LNeSs=');
    audio.volume = 0.1;
    audio.play().catch(() => {}); // Ignore errors if audio can't play
}

// Matrix rain effect
function createMatrixRain() {
    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const columns = Math.floor(window.innerWidth / 20);
    
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9998;
        pointer-events: none;
        background: rgba(0, 0, 0, 0.8);
    `;
    
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    const drops = Array(columns).fill(1);
    
    const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#0F0';
        ctx.font = '15px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length));
            ctx.fillText(text, i * 20, drops[i] * 20);
            
            if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    };
    
    const interval = setInterval(draw, 33);
    
    setTimeout(() => {
        clearInterval(interval);
        canvas.style.opacity = '0';
        canvas.style.transition = 'opacity 1s';
        setTimeout(() => canvas.remove(), 1000);
    }, 3000);
}

// Loading enhancements for better user experience
function addLoadingEnhancements() {
    // Add intersection observer for lazy loading images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                }
            });
        });

        // Observe all lazy images
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Add loading states for dynamic content
    const dynamicElements = document.querySelectorAll('.publications, .projects');
    dynamicElements.forEach(element => {
        element.classList.add('loaded');
    });

    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            if (loadTime > 3000) {
                console.warn('Page load time is slower than optimal:', loadTime + 'ms');
            }
        });
    }
}
