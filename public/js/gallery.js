// Gallery Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeDropdown();
    initializeCart();
    initializeToast();
    initializeGallery();
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

// Gallery functionality
function initializeGallery() {
    const gallery = new Gallery();
    window.gallery = gallery; // Make it globally accessible
}

class Gallery {
    constructor() {
        this.artworks = [];
        this.filteredArtworks = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.isLoading = false;
        this.currentView = 'grid';
        this.filters = {
            search: '',
            category: '',
            sortBy: 'newest'
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadArtworks();
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

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
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
            loadMoreBtn.addEventListener('click', () => this.loadMoreArtworks());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                searchInput?.focus();
            }
        });
    }

    async loadArtworks() {
        this.showLoading(true);
        
        try {
            // Simulate API call - replace with actual API endpoint
            const response = await this.fetchArtworks();
            this.artworks = response;
            this.applyFilters();
        } catch (error) {
            console.error('Error loading artworks:', error);
            this.showError('Failed to load artworks. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async fetchArtworks() {
        // Simulate API call with sample data
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.generateSampleArtworks());
            }, 1000);
        });
    }

    generateSampleArtworks() {
        const categories = ['digital', 'traditional', 'photography', 'abstract', 'portrait', 'landscape'];
        const artists = ['Priya Sharma', 'Rahul Thapa', 'Anita Gurung', 'Deepak Rai', 'Sita Karki', 'Manoj Singh'];
        const artworks = [];

        for (let i = 1; i <= 48; i++) {
            artworks.push({
                unique_id: `art_${i}`,
                art_name: `Artwork ${i}`,
                artist_name: artists[Math.floor(Math.random() * artists.length)],
                art_category: categories[Math.floor(Math.random() * categories.length)],
                cost: Math.floor(Math.random() * 5000) + 500,
                art_image: `artwork_${i}.jpg`,
                art_description: `Beautiful artwork description ${i}`,
                uploaded_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                work_hours: Math.floor(Math.random() * 50) + 5,
                size_of_art: `${Math.floor(Math.random() * 20) + 10}" x ${Math.floor(Math.random() * 20) + 10}"`,
                color_type: Math.random() > 0.5 ? 'color' : 'black_and_white'
            });
        }

        return artworks;
    }

    applyFilters() {
        let filtered = [...this.artworks];

        // Apply search filter
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            filtered = filtered.filter(artwork => 
                artwork.art_name.toLowerCase().includes(search) ||
                artwork.artist_name.toLowerCase().includes(search) ||
                artwork.art_category.toLowerCase().includes(search)
            );
        }

        // Apply category filter
        if (this.filters.category) {
            filtered = filtered.filter(artwork => 
                artwork.art_category === this.filters.category
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.filters.sortBy) {
                case 'newest':
                    return new Date(b.uploaded_at) - new Date(a.uploaded_at);
                case 'oldest':
                    return new Date(a.uploaded_at) - new Date(b.uploaded_at);
                case 'price-low':
                    return a.cost - b.cost;
                case 'price-high':
                    return b.cost - a.cost;
                case 'popular':
                    return Math.random() - 0.5; // Random for demo
                default:
                    return 0;
            }
        });

        this.filteredArtworks = filtered;
        this.currentPage = 1;
        this.renderArtworks();
        this.updateResultsCount();
    }

    renderArtworks() {
        const galleryGrid = document.getElementById('galleryGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (this.filteredArtworks.length === 0) {
            galleryGrid.innerHTML = '';
            emptyState.style.display = 'block';
            this.updateLoadMoreButton(false);
            return;
        }

        emptyState.style.display = 'none';
        
        const startIndex = 0;
        const endIndex = this.currentPage * this.itemsPerPage;
        const artworksToShow = this.filteredArtworks.slice(startIndex, endIndex);
        
        galleryGrid.innerHTML = artworksToShow.map(artwork => this.createArtworkCard(artwork)).join('');
        
        // Bind events to new cards
        this.bindArtworkEvents();
        
        // Update load more button
        const hasMore = endIndex < this.filteredArtworks.length;
        this.updateLoadMoreButton(hasMore);
    }

    createArtworkCard(artwork) {
        const imageUrl = this.getImageUrl(artwork.art_image);
        const timeAgo = this.getRelativeTime(artwork.uploaded_at);
        const price = this.formatPrice(artwork.cost);
        
        return `
            <div class="artwork-card" data-artwork-id="${artwork.unique_id}">
                <div class="artwork-image">
                    <img src="${imageUrl}" alt="${this.escapeHtml(artwork.art_name)}" 
                         onerror="this.onerror=null; this.style.display='none'; this.parentNode.innerHTML='<div class=\\"image-placeholder\\"><i class=\\"fas fa-image\\"></i></div>';">
                    <div class="artwork-overlay"></div>
                    <div class="artwork-actions">
                        <button class="action-btn add-to-cart-btn" title="Add to cart">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                        <button class="action-btn view-details-btn" title="View details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn favorite-btn" title="Add to favorites">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
                
                <div class="artwork-info">
                    <h3 class="artwork-title">${this.escapeHtml(artwork.art_name)}</h3>
                    <p class="artwork-artist">
                        <i class="fas fa-user"></i>
                        ${this.escapeHtml(artwork.artist_name)}
                    </p>
                    
                    <div class="artwork-meta">
                        <span class="artwork-category">${this.escapeHtml(artwork.art_category)}</span>
                        <span class="artwork-date">${timeAgo}</span>
                    </div>
                    
                    <div class="artwork-price">
                        <span class="currency">₹</span>${price}
                    </div>
                </div>
            </div>
        `;
    }

    bindArtworkEvents() {
        // Add to cart buttons
        const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const artworkCard = btn.closest('.artwork-card');
                const artworkId = artworkCard.dataset.artworkId;
                this.addToCart(artworkId);
            });
        });

        // View details buttons
        const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
        viewDetailsBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const artworkCard = btn.closest('.artwork-card');
                const artworkId = artworkCard.dataset.artworkId;
                window.location.href = `/artwork/${artworkId}`;
            });
        });

        // Favorite buttons
        const favoriteBtns = document.querySelectorAll('.favorite-btn');
        favoriteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite(btn);
            });
        });

        // Card click to view details
        const artworkCards = document.querySelectorAll('.artwork-card');
        artworkCards.forEach(card => {
            card.addEventListener('click', () => {
                const artworkId = card.dataset.artworkId;
                window.location.href = `/artwork/${artworkId}`;
            });
        });
    }

    addToCart(artworkId) {
        const artwork = this.filteredArtworks.find(a => a.unique_id === artworkId);
        if (!artwork) return;

        const cartData = {
            unique_id: artwork.unique_id,
            art_name: artwork.art_name,
            artist_name: artwork.artist_name,
            cost: artwork.cost,
            art_image: artwork.art_image,
            added_at: new Date().toISOString()
        };

        let cart = getCart();
        
        // Check if item already exists
        if (cart.find(item => item.unique_id === artworkId)) {
            showToast('Item already in cart', 'warning');
            return;
        }

        cart.push(cartData);
        saveCart(cart);
        updateCartCount();
        showToast('Added to cart successfully!', 'success');
    }

    toggleFavorite(btn) {
        const icon = btn.querySelector('i');
        const isFavorited = icon.classList.contains('fas');
        
        if (isFavorited) {
            icon.classList.remove('fas');
            icon.classList.add('far');
            showToast('Removed from favorites', 'success');
        } else {
            icon.classList.remove('far');
            icon.classList.add('fas');
            showToast('Added to favorites', 'success');
        }
    }

    loadMoreArtworks() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentPage++;
        
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        const btnText = loadMoreBtn.querySelector('.btn-text');
        const btnLoader = loadMoreBtn.querySelector('.btn-loader');
        
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        
        setTimeout(() => {
            this.renderArtworks();
            this.isLoading = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }, 800);
    }

    setView(view) {
        this.currentView = view;
        const galleryGrid = document.getElementById('galleryGrid');
        
        if (view === 'list') {
            galleryGrid.classList.add('list-view');
        } else {
            galleryGrid.classList.remove('list-view');
        }
    }

    updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = this.filteredArtworks.length;
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
        const galleryGrid = document.getElementById('galleryGrid');
        
        if (show) {
            loadingState.style.display = 'flex';
            galleryGrid.innerHTML = '';
        } else {
            loadingState.style.display = 'none';
        }
    }

    showError(message) {
        showToast(message, 'error');
    }

    getImageUrl(imagePath) {
        if (!imagePath) return '/images/placeholder-artwork.jpg';
        
        if (imagePath.startsWith('http')) {
            return imagePath;
        } else if (imagePath.startsWith('/')) {
            return imagePath;
        } else {
            return `/uploads/artworks/${imagePath}`;
        }
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

    formatPrice(price) {
        return parseFloat(price || 0).toLocaleString('en-IN');
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

// Export functions for global access
window.addToCart = function(artworkData) {
    if (window.gallery) {
        return window.gallery.addToCart(artworkData.unique_id);
    }
    return false;
};
