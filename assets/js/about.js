// CONFIGURATION
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

// GESTION DU MENU MOBILE
const initMobileMenu = () => {
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';

            menuToggle.setAttribute('aria-expanded', !isExpanded);
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
        });

        // Fermer le menu lors du clic sur un lien
        const navLinks = nav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
};

// ANIMATION DES STATISTIQUES
const animateCounter = (element, target) => {
    const duration = 2000; // 2 secondes
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const updateCounter = () => {
        current += increment;

        if (current >= target) {
            element.textContent = target;
        } else {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        }
    };

    requestAnimationFrame(updateCounter);
};

const initStatsAnimation = () => {
    const statNumbers = document.querySelectorAll('.stat-number');

    // Observer pour détecter quand les stats sont visibles
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseInt(element.dataset.count);

                // Lancer l'animation une seule fois
                if (!element.classList.contains('animated')) {
                    element.classList.add('animated');
                    animateCounter(element, target);
                }
            }
        });
    }, {
        threshold: 0.5 // L'élément doit être visible à 50%
    });

    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
};

// GESTION DU SCROLL SMOOTH
const initSmoothScroll = () => {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
};

// ANIMATIONS D'APPARITION
const initScrollAnimations = () => {
    const animatedElements = document.querySelectorAll('.about-text, .value-item, .stat-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        observer.observe(element);
    });
};

// INITIALISATION
const init = () => {
    console.log('Initialisation de la page À propos...');

    // Initialiser les composants
    initMobileMenu();
    initSmoothScroll();
    initStatsAnimation();
    initScrollAnimations();

    console.log('Page À propos initialisée avec succès');
};

// DÉMARRAGE
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}