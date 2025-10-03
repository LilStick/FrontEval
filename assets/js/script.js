// CONFIGURATION ET CONSTANTES
const API_URL = 'https://gabistam.github.io/Demo_API/data/projects.json';

// Éléments DOM
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const retryButton = document.getElementById('retry-button');
const filtersSection = document.querySelector('.filters');
const filterButtonsContainer = document.getElementById('filter-buttons');
const projectsGrid = document.getElementById('projects-grid');
const modal = document.getElementById('project-modal');
const modalClose = document.querySelector('.modal-close');
const modalOverlay = document.querySelector('.modal-overlay');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

// Variables globales
let allProjects = [];
let allTechnologies = [];
let currentFilter = 'all';

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

// GESTION DE L'API
const showLoader = () => {
    loader.style.display = 'block';
    errorMessage.style.display = 'none';
    filtersSection.style.display = 'none';
    projectsGrid.style.display = 'none';
};

const hideLoader = () => {
    loader.style.display = 'none';
};

const showError = () => {
    errorMessage.style.display = 'block';
    hideLoader();
    filtersSection.style.display = 'none';
    projectsGrid.style.display = 'none';
};

const showContent = () => {
    hideLoader();
    errorMessage.style.display = 'none';
    filtersSection.style.display = 'block';
    projectsGrid.style.display = 'grid';
};

// Chargement des données depuis l'API
const fetchProjects = async () => {
    showLoader();

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (!data.projects || !Array.isArray(data.projects)) {
            throw new Error('Format de données invalide');
        }

        allProjects = data.projects;
        allTechnologies = data.technologies || [];

        initFilters();
        displayProjects(allProjects);
        showContent();

    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        showError();
    }
};

// SYSTÈME DE FILTRAGE
const initFilters = () => {
    if (!filterButtonsContainer) return;

    // Bouton "Toutes"
    const allButton = filterButtonsContainer.querySelector('[data-technology="all"]');

    // Ajouter les boutons pour chaque technologie
    allTechnologies.forEach(tech => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.dataset.technology = tech;
        button.textContent = tech;
        button.addEventListener('click', () => filterProjects(tech));
        filterButtonsContainer.appendChild(button);
    });

    // Gestionnaire pour le bouton "Toutes"
    if (allButton) {
        allButton.addEventListener('click', () => filterProjects('all'));
    }
};

const filterProjects = (technology) => {
    currentFilter = technology;

    // Mettre à jour les boutons actifs
    const filterButtons = filterButtonsContainer.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.technology === technology) {
            btn.classList.add('active');
        }
    });

    // Filtrer et afficher les projets
    let filteredProjects;
    if (technology === 'all') {
        filteredProjects = allProjects;
    } else {
        filteredProjects = allProjects.filter(project =>
            project.technologies && project.technologies.includes(technology)
        );
    }

    displayProjects(filteredProjects);
};

// AFFICHAGE DES PROJETS
const displayProjects = (projects) => {
    if (!projectsGrid) return;

    if (projects.length === 0) {
        projectsGrid.innerHTML = `
            <div class="no-projects">
                <p>Aucun projet trouvé pour cette technologie.</p>
            </div>
        `;
        return;
    }

    projectsGrid.innerHTML = '';

    projects.forEach((project, index) => {
        const projectCard = createProjectCard(project, index);
        projectsGrid.appendChild(projectCard);
    });
};

const createProjectCard = (project, index) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.animationDelay = `${index * 0.1}s`;

    const technologies = project.technologies || [];
    const technologiesHTML = technologies.map(tech =>
        `<span class="tech-badge">${tech}</span>`
    ).join('');

    card.innerHTML = `
        <div class="project-image" style="background-image: url('${project.image || ''}')" role="img" aria-label="Image du projet ${project.title}"></div>
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-client">Client: ${project.client}</p>
            <div class="project-technologies">
                ${technologiesHTML}
            </div>
            <div class="project-actions">
                <button class="btn-details" data-project-id="${project.id}" aria-label="Voir les détails de ${project.title}">
                    Voir détails
                </button>
                <span class="project-year">${project.year}</span>
            </div>
        </div>
    `;

    // Ajouter l'événement pour ouvrir le modal
    const detailsButton = card.querySelector('.btn-details');
    detailsButton.addEventListener('click', () => openModal(project));

    return card;
};

// GESTION DU MODAL
const openModal = (project) => {
    if (!modal) return;

    const modalBody = modal.querySelector('.modal-body');

    const features = project.features || [];
    const featuresHTML = features.map(feature =>
        `<li>${feature}</li>`
    ).join('');

    const technologies = project.technologies || [];
    const technologiesHTML = technologies.map(tech =>
        `<span class="tech-badge">${tech}</span>`
    ).join('');

    modalBody.innerHTML = `
        <div class="modal-project">
            <div class="modal-image" style="background-image: url('${project.image || ''}')" role="img" aria-label="Image du projet ${project.title}"></div>
            <div class="modal-info">
                <h2 id="modal-title">${project.title}</h2>
                <div class="modal-meta">
                    <p><strong>Client:</strong> ${project.client}</p>
                    <p><strong>Catégorie:</strong> ${project.category || 'Non spécifiée'}</p>
                    <p><strong>Année:</strong> ${project.year}</p>
                    <p><strong>Durée:</strong> ${project.duration || 'Non spécifiée'}</p>
                </div>

                <div class="modal-technologies">
                    <h4>Technologies utilisées:</h4>
                    <div class="tech-list">${technologiesHTML}</div>
                </div>

                <div class="modal-description">
                    <h4>Description:</h4>
                    <p>${project.description || 'Description non disponible'}</p>
                </div>

                ${features.length > 0 ? `
                    <div class="modal-features">
                        <h4>Fonctionnalités principales:</h4>
                        <ul>${featuresHTML}</ul>
                    </div>
                ` : ''}

                ${project.url ? `
                    <div class="modal-link">
                        <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="project-link">
                            Visiter le site
                        </a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    // Styles pour le modal
    const style = document.createElement('style');
    style.textContent = `
        .modal-project {
            display: grid;
            gap: 2rem;
        }

        .modal-image {
            height: 250px;
            background-color: var(--bg-light);
            background-size: cover;
            background-position: center;
            border-radius: var(--radius-md);
        }

        .modal-meta p {
            margin-bottom: 0.5rem;
            color: var(--text-light);
        }

        .modal-technologies,
        .modal-description,
        .modal-features {
            margin-top: 1.5rem;
        }

        .modal-technologies h4,
        .modal-description h4,
        .modal-features h4 {
            color: var(--primary-color);
            margin-bottom: 1rem;
        }

        .tech-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .modal-features ul {
            padding-left: 1.5rem;
        }

        .modal-features li {
            margin-bottom: 0.5rem;
            color: var(--text-light);
        }

        .modal-link {
            margin-top: 2rem;
            text-align: center;
        }

        .project-link {
            display: inline-block;
            background-color: var(--primary-color);
            color: white;
            padding: 1rem 2rem;
            text-decoration: none;
            border-radius: var(--radius-md);
            font-weight: 600;
            transition: all var(--transition-fast);
        }

        .project-link:hover {
            background-color: var(--primary-dark);
            transform: translateY(-2px);
        }

        @media screen and (max-width: 767px) {
            .modal-project {
                gap: 1rem;
            }

            .modal-image {
                height: 200px;
            }
        }
    `;

    if (!document.querySelector('style[data-modal-styles]')) {
        style.setAttribute('data-modal-styles', 'true');
        document.head.appendChild(style);
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus sur le modal pour l'accessibilité
    modal.focus();
};

const closeModal = () => {
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
};

const initModalEvents = () => {
    if (!modal) return;

    // Fermeture par le bouton X
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Fermeture par clic sur l'overlay
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }

    // Fermeture par la touche Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
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

// GESTION DES ERREURS
const initRetryButton = () => {
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            console.log('Tentative de rechargement des projets...');
            fetchProjects();
        });
    }
};

// INITIALISATION
const init = () => {
    console.log('Initialisation de l\'application...');

    // Initialiser les composants
    initMobileMenu();
    initModalEvents();
    initSmoothScroll();
    initRetryButton();

    // Charger les données
    fetchProjects();

    console.log('Application initialisée avec succès');
};

// DÉMARRAGE DE L'APPLICATION
// Attendre que le DOM soit entièrement chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}