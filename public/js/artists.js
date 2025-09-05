// Artists Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeDropdown();
    initializeCart();
    initializeToast();
    initializeArtists();
});

// Navigation functionality
function initializeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navClose = document.getElementById('navClose');
    
    function closeNavMenu() {
        navMenu.classList.remove('active');
        // Reset hamburger menu
        const spans = navToggle.querySelectorAll('span');
        spans.forEach(span => {
            span.style.transform = '';
            span.style.opacity = '';
        });
    }
    
    function openNavMenu() {
        navMenu.classList.add('active');
        // Animate hamburger menu
        const spans = navToggle.querySelectorAll('span');
        spans.forEach((span, index) => {
            if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
            if (index === 1) span.style.opacity = '0';
            if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
        });
    }
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                closeNavMenu();
            } else {
                openNavMenu();
            }
        });
        
        // Close button functionality
        if (navClose) {
            navClose.addEventListener('click', function() {
                closeNavMenu();
            });
        }
        
        // Close menu when clicking outside (only on mobile backdrop area)
        document.addEventListener('click', function(e) {
            if (navMenu.classList.contains('active') && 
                !navToggle.contains(e.target) && 
                !navMenu.contains(e.target) &&
                window.innerWidth < 768) {
                closeNavMenu();
            }
        });
        
        // Close menu when clicking on nav links and action buttons
        const navLinks = navMenu.querySelectorAll('.nav-link, .nav-cart-btn, .nav-apply-btn, .nav-track-btn');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeNavMenu();
            });
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeNavMenu();
            }
        });
    }
}

// Dropdown functionality
function initializeDropdown() {
    const dropdownBtn = document.getElementById('dropdownBtn');
    const dropdown = dropdownBtn?.closest('.dropdown');
    
    if (dropdownBtn && dropdown) {
        dropdownBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
        
        // Close dropdown when clicking on dropdown items
        const dropdownItems = dropdown.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', () => {
                dropdown.classList.remove('active');
            });
        });
        
        // Close dropdown on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
            }
        });
    }
}

// Cart functionality (for navigation display)
function initializeCart() {
    updateCartCount();
}

function getCart() {
    try {
        const cartData = localStorage.getItem('chitram_cart');
        return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
        console.error('Error reading cart:', error);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem('chitram_cart', JSON.stringify(cart));
        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'chitram_cart',
            newValue: JSON.stringify(cart)
        }));
    } catch (error) {
        console.error('Error saving cart:', error);
        showToast('Error saving cart changes', 'error');
    }
}

function updateCartCount() {
    const cart = getCart();
    const cartCountElement = document.getElementById('cartCount');
    const cartCountMobileElement = document.getElementById('cartCountMobile');
    
    // Update desktop cart count
    if (cartCountElement) {
        cartCountElement.textContent = cart.length;
    }
    
    // Update mobile cart count
    if (cartCountMobileElement) {
        cartCountMobileElement.textContent = cart.length;
    }
}

// Artists functionality
function initializeArtists() {
    const artistsPage = new ArtistsPage();
    window.artistsPage = artistsPage; // Make it globally accessible
}

class ArtistsPage {
    constructor() {
        this.artists = [];
        this.filteredArtists = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.isLoading = false;
        this.currentView = 'grid';
        this.filters = {
            search: '',
            location: '',
            experience: '',
            sortBy: 'newest'
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadArtists();
    }

    bindEvents() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filters.search = e.target.value.trim();
                    this.applyFilters();
                }, 300);
            });
        }

        // Location filter
        const locationFilter = document.getElementById('locationFilter');
        if (locationFilter) {
            locationFilter.addEventListener('change', (e) => {
                this.filters.location = e.target.value;
                this.applyFilters();
            });
        }

        // Experience filter
        const experienceFilter = document.getElementById('experienceFilter');
        if (experienceFilter) {
            experienceFilter.addEventListener('change', (e) => {
                this.filters.experience = e.target.value;
                this.applyFilters();
            });
        }

        // Sort filter
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.filters.sortBy = e.target.value;
                this.applyFilters();
            });
        }

        // View toggle
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.setView(view);
                
                // Update active state
                viewButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreArtists());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                searchInput?.focus();
            }
        });
    }

    async loadArtists() {
        this.showLoading(true);
        
        try {
            // Simulate API call - replace with actual API endpoint
            const response = await this.fetchArtists();
            this.artists = response;
            this.applyFilters();
        } catch (error) {
            console.error('Error loading artists:', error);
            this.showError('Failed to load artists. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async fetchArtists() {
        // Simulate API call with sample data
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.generateSampleArtists());
            }, 1000);
        });
    }

    generateSampleArtists() {
        const locations = ['Kathmandu', 'Pokhara', 'Chitwan', 'Lalitpur', 'Bhaktapur', 'Dharan', 'Butwal'];
        const schools = ['Kathmandu University', 'Tribhuvan University', 'Pokhara University', 'Fine Arts Academy'];
        const artists = [];

        for (let i = 1; i <= 36; i++) {
            const startedYear = 2010 + Math.floor(Math.random() * 13);
            const currentYear = new Date().getFullYear();
            const experience = currentYear - startedYear;
            const artworkCount = Math.floor(Math.random() * 50) + 5;
            const soldCount = Math.floor(artworkCount * Math.random() * 0.8);
            
            artists.push({
                unique_id: `artist_${i}`,
                full_name: `Artist ${i}`,
                age: 20 + Math.floor(Math.random() * 25),
                started_art_since: startedYear,
                college_school: schools[Math.floor(Math.random() * schools.length)],
                city: locations[Math.floor(Math.random() * locations.length)],
                district: locations[Math.floor(Math.random() * locations.length)],
                email: `artist${i}@example.com`,
                phone: `98${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
                bio: `Passionate digital artist with ${experience} years of experience creating stunning artworks. Specializes in various digital art techniques and styles.`,
                profile_picture: `artist_${i}.jpg`,
                joined_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active',
                arts_uploaded: artworkCount,
                arts_sold: soldCount,
                socials: JSON.stringify({
                    instagram: Math.random() > 0.5 ? `@artist${i}` : null,
                    facebook: Math.random() > 0.7 ? `Artist ${i}` : null,
                    website: Math.random() > 0.8 ? `https://artist${i}.com` : null
                }),
                experience_years: experience
            });
        }

        return artists;
    }

    applyFilters() {
        let filtered = [...this.artists];

        // Apply search filter
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            filtered = filtered.filter(artist => 
                artist.full_name.toLowerCase().includes(search) ||
                artist.city.toLowerCase().includes(search) ||
                artist.district.toLowerCase().includes(search) ||
                artist.college_school.toLowerCase().includes(search)
            );
        }

        // Apply location filter
        if (this.filters.location) {
            filtered = filtered.filter(artist => 
                artist.city.toLowerCase() === this.filters.location.toLowerCase() ||
                artist.district.toLowerCase() === this.filters.location.toLowerCase()
            );
        }

        // Apply experience filter
        if (this.filters.experience) {
            filtered = filtered.filter(artist => {
                const experience = artist.experience_years;
                switch (this.filters.experience) {
                    case 'beginner':
                        return experience >= 0 && experience <= 2;
                    case 'intermediate':
                        return experience >= 3 && experience <= 5;
                    case 'experienced':
                        return experience >= 6 && experience <= 10;
                    case 'expert':
                        return experience > 10;
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.filters.sortBy) {
                case 'newest':
                    return new Date(b.joined_at) - new Date(a.joined_at);
                case 'oldest':
                    return new Date(a.joined_at) - new Date(b.joined_at);
                case 'experience':
                    return b.experience_years - a.experience_years;
                case 'artworks':
                    return b.arts_uploaded - a.arts_uploaded;
                case 'popular':
                    return b.arts_sold - a.arts_sold;
                default:
                    return 0;
            }
        });

        this.filteredArtists = filtered;
        this.currentPage = 1;
        this.renderArtists();
        this.updateResultsCount();
    }

    renderArtists() {
        const artistsGrid = document.getElementById('artistsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (this.filteredArtists.length === 0) {
            artistsGrid.innerHTML = '';
            emptyState.style.display = 'block';
            this.updateLoadMoreButton(false);
            return;
        }

        emptyState.style.display = 'none';
        
        const startIndex = 0;
        const endIndex = this.currentPage * this.itemsPerPage;
        const artistsToShow = this.filteredArtists.slice(startIndex, endIndex);
        
        artistsGrid.innerHTML = artistsToShow.map(artist => this.createArtistCard(artist)).join('');
        
        // Bind events to new cards
        this.bindArtistEvents();
        
        // Update load more button
        const hasMore = endIndex < this.filteredArtists.length;
        this.updateLoadMoreButton(hasMore);
    }

    createArtistCard(artist) {
        const imageUrl = this.getImageUrl(artist.profile_picture);
        const joinedTime = this.getRelativeTime(artist.joined_at);
        const location = this.getLocation(artist);
        const socialLinks = this.getSocialLinks(artist.socials);
        const experienceLabel = this.getExperienceLabel(artist.experience_years);
        
        return `
            <div class="artist-card" data-artist-id="${artist.unique_id}">
                <div class="artist-header">
                    <div class="artist-status">Active</div>
                    <div class="artist-avatar">
                        <img src="${imageUrl}" alt="${this.escapeHtml(artist.full_name)}" 
                             onerror="this.onerror=null; this.style.display='none'; this.parentNode.innerHTML='<div class=\\"image-placeholder\\"><i class=\\"fas fa-user\\"></i></div>';">
                    </div>
                </div>
                
                <div class="artist-info">
                    <h3 class="artist-name">${this.escapeHtml(artist.full_name)}</h3>
                    <p class="artist-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${this.escapeHtml(location)}
                    </p>
                    
                    <p class="artist-bio">${this.escapeHtml(artist.bio)}</p>
                    
                    <div class="artist-experience">${experienceLabel}</div>
                    
                    <div class="artist-stats">
                        <div class="artist-stat">
                            <span class="stat-number">${artist.arts_uploaded}</span>
                            <span class="stat-label">Artworks</span>
                        </div>
                        <div class="artist-stat">
                            <span class="stat-number">${artist.arts_sold}</span>
                            <span class="stat-label">Sold</span>
                        </div>
                        <div class="artist-stat">
                            <span class="stat-number">${artist.experience_years}</span>
                            <span class="stat-label">Years</span>
                        </div>
                    </div>
                    
                    ${socialLinks.length > 0 ? `
                        <div class="artist-social">
                            ${socialLinks.map(link => `
                                <a href="${link.url}" class="social-link" target="_blank" rel="noopener">
                                    <i class="${link.icon}"></i>
                                </a>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="artist-actions">
                        <a href="/artist/${artist.unique_id}" class="action-btn primary">
                            <i class="fas fa-eye"></i>
                            View Profile
                        </a>
                        <button class="action-btn follow-btn" data-artist-id="${artist.unique_id}">
                            <i class="fas fa-heart"></i>
                            Follow
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    bindArtistEvents() {
        // Follow buttons
        const followBtns = document.querySelectorAll('.follow-btn');
        followBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFollow(btn);
            });
        });

        // Card click to view profile
        const artistCards = document.querySelectorAll('.artist-card');
        artistCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't navigate if clicking on action buttons
                if (e.target.closest('.artist-actions') || e.target.closest('.artist-social')) {
                    return;
                }
                const artistId = card.dataset.artistId;
                window.location.href = `/artist/${artistId}`;
            });
        });
    }

    toggleFollow(btn) {
        const icon = btn.querySelector('i');
        const isFollowed = btn.classList.contains('followed');
        
        if (isFollowed) {
            btn.classList.remove('followed');
            icon.classList.remove('fas');
            icon.classList.add('far');
            btn.innerHTML = '<i class="far fa-heart"></i> Follow';
            showToast('Unfollowed artist', 'success');
        } else {
            btn.classList.add('followed');
            icon.classList.remove('far');
            icon.classList.add('fas');
            btn.innerHTML = '<i class="fas fa-heart"></i> Following';
            showToast('Following artist', 'success');
        }
    }

    loadMoreArtists() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentPage++;
        
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        const btnText = loadMoreBtn.querySelector('.btn-text');
        const btnLoader = loadMoreBtn.querySelector('.btn-loader');
        
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        
        setTimeout(() => {
            this.renderArtists();
            this.isLoading = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }, 800);
    }

    setView(view) {
        this.currentView = view;
        const artistsGrid = document.getElementById('artistsGrid');
        
        if (view === 'list') {
            artistsGrid.classList.add('list-view');
        } else {
            artistsGrid.classList.remove('list-view');
        }
    }

    updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = this.filteredArtists.length;
        }
    }

    updateLoadMoreButton(show) {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = show ? 'block' : 'none';
        }
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const artistsGrid = document.getElementById('artistsGrid');
        
        if (show) {
            loadingState.style.display = 'flex';
            artistsGrid.innerHTML = '';
        } else {
            loadingState.style.display = 'none';
        }
    }

    showError(message) {
        showToast(message, 'error');
    }

    getImageUrl(imagePath) {
        if (!imagePath) return '/images/placeholder-avatar.jpg';
        
        if (imagePath.startsWith('http')) {
            return imagePath;
        } else if (imagePath.startsWith('/')) {
            return imagePath;
        } else {
            return `/uploads/profiles/${imagePath}`;
        }
    }

    getLocation(artist) {
        if (artist.city && artist.district && artist.city !== artist.district) {
            return `${artist.city}, ${artist.district}`;
        }
        return artist.city || artist.district || 'Location not specified';
    }

    getSocialLinks(socialsJson) {
        const links = [];
        try {
            const socials = typeof socialsJson === 'string' ? JSON.parse(socialsJson) : socialsJson;
            
            if (socials.instagram) {
                links.push({
                    url: `https://instagram.com/${socials.instagram.replace('@', '')}`,
                    icon: 'fab fa-instagram'
                });
            }
            if (socials.facebook) {
                links.push({
                    url: `https://facebook.com/${socials.facebook}`,
                    icon: 'fab fa-facebook'
                });
            }
            if (socials.website) {
                links.push({
                    url: socials.website,
                    icon: 'fas fa-globe'
                });
            }
        } catch (error) {
            console.error('Error parsing social links:', error);
        }
        
        return links;
    }

    getExperienceLabel(years) {
        if (years <= 2) return `${years} ${years === 1 ? 'year' : 'years'} experience - Beginner`;
        if (years <= 5) return `${years} years experience - Intermediate`;
        if (years <= 10) return `${years} years experience - Experienced`;
        return `${years} years experience - Expert`;
    }

    getRelativeTime(dateString) {
        try {
            const now = new Date();
            const date = new Date(dateString);
            const diffInSeconds = Math.floor((now - date) / 1000);

            if (diffInSeconds < 60) return 'just now';
            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
            if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
            return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
        } catch (error) {
            return 'recently';
        }
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
    }
}

// Toast notification system
function initializeToast() {
    // Create toast container if it doesn't exist
    if (!document.getElementById('toast')) {
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="toast-icon"></i>
                <span class="toast-message"></span>
            </div>
        `;
        document.body.appendChild(toast);
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    // Set message
    toastMessage.textContent = message;
    
    // Set icon and style based on type
    toast.className = `toast ${type}`;
    
    switch (type) {
        case 'success':
            toastIcon.className = 'toast-icon fas fa-check-circle';
            break;
        case 'error':
            toastIcon.className = 'toast-icon fas fa-exclamation-circle';
            break;
        case 'warning':
            toastIcon.className = 'toast-icon fas fa-exclamation-triangle';
            break;
        default:
            toastIcon.className = 'toast-icon fas fa-info-circle';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // ESC key closes mobile menu and dropdown
    if (e.key === 'Escape') {
        const navMenu = document.getElementById('navMenu');
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            
            // Reset hamburger menu
            const navToggle = document.getElementById('navToggle');
            if (navToggle) {
                const spans = navToggle.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = '';
                    span.style.opacity = '';
                });
            }
        }
        
        // Close dropdown
        const dropdown = document.querySelector('.dropdown.active');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }
});
