// CONFIGURATION
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const formMessages = document.getElementById('form-messages');

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

// VALIDATION DU FORMULAIRE
const validators = {
    // Validation du nom
    name: (value) => {
        const trimmed = value.trim();
        if (!trimmed) {
            return 'Le nom est obligatoire.';
        }
        if (trimmed.length < 2) {
            return 'Le nom doit contenir au moins 2 caractères.';
        }
        if (!/^[a-zA-ZÀ-ÿ\s-']+$/.test(trimmed)) {
            return 'Le nom ne peut contenir que des lettres, espaces, traits d\'union et apostrophes.';
        }
        return null;
    },

    // Validation de l'email
    email: (value) => {
        const trimmed = value.trim();
        if (!trimmed) {
            return 'L\'adresse e-mail est obligatoire.';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
            return 'Veuillez saisir une adresse e-mail valide.';
        }
        return null;
    },

    // Validation du téléphone (optionnel mais format vérifié si présent)
    phone: (value) => {
        const trimmed = value.trim();
        if (trimmed && !/^[\d\s\-\.\+\(\)]+$/.test(trimmed)) {
            return 'Le numéro de téléphone n\'est pas valide.';
        }
        return null;
    },

    // Validation du message
    message: (value) => {
        const trimmed = value.trim();
        if (!trimmed) {
            return 'Le message est obligatoire.';
        }
        if (trimmed.length < 10) {
            return 'Le message doit contenir au moins 10 caractères.';
        }
        if (trimmed.length > 1000) {
            return 'Le message ne peut pas dépasser 1000 caractères.';
        }
        return null;
    },

    // Validation du consentement
    consent: (checked) => {
        if (!checked) {
            return 'Vous devez accepter d\'être recontacté pour envoyer votre message.';
        }
        return null;
    }
};

// Fonction pour afficher une erreur sur un champ
const showFieldError = (fieldName, message) => {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName);

    if (errorElement && inputElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        inputElement.classList.add('error');
        inputElement.setAttribute('aria-invalid', 'true');
    }
};

// Fonction pour effacer l'erreur sur un champ
const clearFieldError = (fieldName) => {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName);

    if (errorElement && inputElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        inputElement.classList.remove('error');
        inputElement.setAttribute('aria-invalid', 'false');
    }
};

// Validation d'un champ individuel
const validateField = (fieldName, value, isCheckbox = false) => {
    const validator = validators[fieldName];
    if (!validator) return true;

    const error = validator(isCheckbox ? value : (value || ''));

    if (error) {
        showFieldError(fieldName, error);
        return false;
    } else {
        clearFieldError(fieldName);
        return true;
    }
};

// Validation complète du formulaire
const validateForm = () => {
    const formData = new FormData(contactForm);
    let isValid = true;

    // Valider chaque champ
    const nameValid = validateField('name', formData.get('name'));
    const emailValid = validateField('email', formData.get('email'));
    const phoneValid = validateField('phone', formData.get('phone'));
    const messageValid = validateField('message', formData.get('message'));
    const consentValid = validateField('consent', formData.has('consent'), true);

    isValid = nameValid && emailValid && phoneValid && messageValid && consentValid;

    return isValid;
};

// Affichage des messages de statut du formulaire
const showFormMessage = (message, type = 'success') => {
    if (!formMessages) return;

    formMessages.className = `form-messages ${type}`;
    formMessages.textContent = message;
    formMessages.style.display = 'block';

    // Faire défiler vers le message
    formMessages.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Masquer automatiquement après 5 secondes pour les succès
    if (type === 'success') {
        setTimeout(() => {
            formMessages.style.display = 'none';
        }, 5000);
    }
};

// Simulation d'envoi du formulaire
const submitForm = async (formData) => {
    // Simulation d'une requête réseau
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simuler un succès dans 90% des cas
            const success = Math.random() > 0.1;
            resolve({ success });
        }, 1500);
    });
};

// Gestion de la soumission du formulaire
const handleFormSubmit = async (event) => {
    event.preventDefault();

    // Validation
    if (!validateForm()) {
        showFormMessage('Veuillez corriger les erreurs ci-dessous.', 'error');
        return;
    }

    // État de chargement
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';

    try {
        const formData = new FormData(contactForm);
        const result = await submitForm(formData);

        if (result.success) {
            showFormMessage(
                'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.',
                'success'
            );
            contactForm.reset();

            // Effacer toutes les erreurs
            ['name', 'email', 'phone', 'message', 'consent'].forEach(clearFieldError);

        } else {
            showFormMessage(
                'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.',
                'error'
            );
        }

    } catch (error) {
        console.error('Erreur lors de l\'envoi:', error);
        showFormMessage(
            'Une erreur technique est survenue. Veuillez réessayer plus tard.',
            'error'
        );
    } finally {
        // Restaurer l'état du bouton
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
};

// VALIDATION EN TEMPS RÉEL
const initRealTimeValidation = () => {
    if (!contactForm) return;

    const fields = ['name', 'email', 'phone', 'message'];

    fields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            // Validation à la perte de focus
            field.addEventListener('blur', () => {
                validateField(fieldName, field.value);
            });

            // Effacer l'erreur lors de la saisie
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    clearFieldError(fieldName);
                }
            });
        }
    });

    // Validation de la checkbox de consentement
    const consentField = document.getElementById('consent');
    if (consentField) {
        consentField.addEventListener('change', () => {
            validateField('consent', consentField.checked, true);
        });
    }
};

// COMPTEUR DE CARACTÈRES POUR LE MESSAGE
const initCharacterCounter = () => {
    const messageField = document.getElementById('message');
    if (!messageField) return;

    const counterElement = document.createElement('div');
    counterElement.className = 'character-counter';
    counterElement.setAttribute('aria-live', 'polite');

    messageField.parentNode.appendChild(counterElement);

    const updateCounter = () => {
        const current = messageField.value.length;
        const max = 1000;
        counterElement.textContent = `${current}/${max} caractères`;

        if (current > max * 0.9) {
            counterElement.classList.add('warning');
        } else {
            counterElement.classList.remove('warning');
        }
    };

    messageField.addEventListener('input', updateCounter);
    updateCounter(); // Initialiser
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
    const animatedElements = document.querySelectorAll('.contact-info, .form-container, .contact-item');

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

    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.animationDelay = `${index * 0.1}s`;
        observer.observe(element);
    });
};

// INITIALISATION
const init = () => {
    console.log('Initialisation de la page Contact...');

    // Initialiser les composants
    initMobileMenu();
    initSmoothScroll();
    initRealTimeValidation();
    initCharacterCounter();
    initScrollAnimations();

    // Gestionnaire de soumission du formulaire
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    console.log('Page Contact initialisée avec succès');
};

// DÉMARRAGE
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}