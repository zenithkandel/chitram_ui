/**
 * Image Handling Utility for Chitram UI
 * Provides fallback mechanisms and error handling for images throughout the application
 */

class ImageHandler {
    constructor() {
        this.placeholders = {
            artwork: '/images/placeholders/artwork-placeholder.svg',
            profile: '/images/placeholders/profile-placeholder.svg',
            gallery: '/images/placeholders/gallery-placeholder.svg',
            artist: '/images/placeholders/artist-placeholder.svg',
            general: '/images/placeholders/general-placeholder.svg'
        };
        
        this.loadingStates = new Map();
        this.retryAttempts = new Map();
        this.maxRetries = 2;
        
        this.init();
    }
    
    init() {
        // Create placeholder SVGs if they don't exist
        this.createPlaceholderSVGs();
        
        // Set up global error handling for images
        this.setupGlobalImageErrorHandling();
        
        // Set up intersection observer for lazy loading
        this.setupLazyLoading();
    }
    
    /**
     * Create SVG placeholders programmatically
     */
    createPlaceholderSVGs() {
        const placeholders = {
            artwork: this.createArtworkPlaceholder(),
            profile: this.createProfilePlaceholder(),
            gallery: this.createGalleryPlaceholder(),
            artist: this.createArtistPlaceholder(),
            general: this.createGeneralPlaceholder()
        };
        
        // Store as data URLs for immediate use
        Object.keys(placeholders).forEach(key => {
            this.placeholders[key] = `data:image/svg+xml;base64,${btoa(placeholders[key])}`;
        });
    }
    
    createArtworkPlaceholder() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
            <rect width="400" height="300" fill="#1a1a1a"/>
            <rect x="50" y="50" width="300" height="200" fill="#2a2a2a" stroke="#444" stroke-width="2"/>
            <circle cx="120" cy="120" r="15" fill="#6366f1"/>
            <polygon points="80,180 120,140 160,160 200,120 240,140 280,100 320,120 320,200 80,200" fill="#444"/>
            <text x="200" y="240" text-anchor="middle" fill="#888" font-family="Inter, Arial, sans-serif" font-size="14">Artwork Preview</text>
        </svg>`;
    }
    
    createProfilePlaceholder() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#1a1a1a"/>
            <circle cx="100" cy="80" r="30" fill="#444"/>
            <path d="M60 140 Q100 120 140 140 L140 180 L60 180 Z" fill="#444"/>
            <text x="100" y="195" text-anchor="middle" fill="#888" font-family="Inter, Arial, sans-serif" font-size="10">Profile</text>
        </svg>`;
    }
    
    createGalleryPlaceholder() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
            <rect width="400" height="400" fill="#1a1a1a"/>
            <rect x="50" y="50" width="120" height="90" fill="#2a2a2a" stroke="#444"/>
            <rect x="190" y="50" width="120" height="90" fill="#2a2a2a" stroke="#444"/>
            <rect x="50" y="160" width="120" height="90" fill="#2a2a2a" stroke="#444"/>
            <rect x="190" y="160" width="120" height="90" fill="#2a2a2a" stroke="#444"/>
            <circle cx="90" cy="85" r="8" fill="#6366f1"/>
            <circle cx="230" cy="85" r="8" fill="#6366f1"/>
            <circle cx="90" cy="195" r="8" fill="#6366f1"/>
            <circle cx="230" cy="195" r="8" fill="#6366f1"/>
            <text x="200" y="300" text-anchor="middle" fill="#888" font-family="Inter, Arial, sans-serif" font-size="14">Gallery Preview</text>
        </svg>`;
    }
    
    createArtistPlaceholder() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
            <rect width="300" height="300" fill="#1a1a1a"/>
            <circle cx="150" cy="100" r="40" fill="#444"/>
            <path d="M90 160 Q150 140 210 160 L210 220 L90 220 Z" fill="#444"/>
            <rect x="120" y="180" width="60" height="4" fill="#6366f1"/>
            <rect x="130" y="190" width="40" height="3" fill="#888"/>
            <text x="150" y="260" text-anchor="middle" fill="#888" font-family="Inter, Arial, sans-serif" font-size="12">Artist Profile</text>
        </svg>`;
    }
    
    createGeneralPlaceholder() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200">
            <rect width="300" height="200" fill="#1a1a1a"/>
            <circle cx="150" cy="100" r="30" fill="#444"/>
            <text x="150" y="150" text-anchor="middle" fill="#888" font-family="Inter, Arial, sans-serif" font-size="12">Image Not Found</text>
        </svg>`;
    }
    
    /**
     * Handle image errors with smart fallbacks
     */
    handleImageError(img, type = 'general', retryOriginal = true) {
        const originalSrc = img.src;
        const retryKey = originalSrc;
        const currentRetries = this.retryAttempts.get(retryKey) || 0;
        
        // Remove any loading states
        img.classList.remove('loading');
        this.loadingStates.delete(img);
        
        // Try to retry the original source first (in case it was a temporary network issue)
        if (retryOriginal && currentRetries < this.maxRetries) {
            this.retryAttempts.set(retryKey, currentRetries + 1);
            
            setTimeout(() => {
                const newImg = new Image();
                newImg.onload = () => {
                    img.src = originalSrc;
                    img.classList.add('loaded');
                    this.retryAttempts.delete(retryKey);
                };
                newImg.onerror = () => {
                    this.setPlaceholder(img, type);
                };
                newImg.src = originalSrc;
            }, 1000 * (currentRetries + 1)); // Exponential backoff
            
            return;
        }
        
        // Set placeholder if retries failed
        this.setPlaceholder(img, type);
    }
    
    /**
     * Set appropriate placeholder based on type
     */
    setPlaceholder(img, type = 'general') {
        const placeholder = this.placeholders[type] || this.placeholders.general;
        img.src = placeholder;
        img.classList.add('placeholder');
        img.setAttribute('data-failed', 'true');
        
        // Add error state styling
        img.style.filter = 'grayscale(1) opacity(0.6)';
    }
    
    /**
     * Setup global image error handling
     */
    setupGlobalImageErrorHandling() {
        // Handle existing images
        document.addEventListener('DOMContentLoaded', () => {
            this.processExistingImages();
        });
        
        // Handle dynamically added images
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        if (node.tagName === 'IMG') {
                            this.setupImageHandling(node);
                        } else {
                            const images = node.querySelectorAll && node.querySelectorAll('img');
                            if (images) {
                                images.forEach(img => this.setupImageHandling(img));
                            }
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Process existing images on page load
     */
    processExistingImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => this.setupImageHandling(img));
    }
    
    /**
     * Setup handling for individual image
     */
    setupImageHandling(img) {
        // Skip if already handled
        if (img.hasAttribute('data-image-handled')) return;
        
        img.setAttribute('data-image-handled', 'true');
        
        // Determine image type from classes or data attributes
        const type = this.getImageType(img);
        
        // Add loading state
        if (!img.complete) {
            img.classList.add('loading');
            this.loadingStates.set(img, true);
        }
        
        // Setup error handling
        img.addEventListener('error', (e) => {
            this.handleImageError(e.target, type);
        });
        
        // Setup load success
        img.addEventListener('load', (e) => {
            e.target.classList.remove('loading', 'placeholder');
            e.target.classList.add('loaded');
            e.target.style.filter = '';
            this.loadingStates.delete(e.target);
        });
        
        // If image is already complete but may have failed
        if (img.complete && img.naturalWidth === 0) {
            this.handleImageError(img, type, false);
        }
    }
    
    /**
     * Determine image type from element attributes
     */
    getImageType(img) {
        // Check data attribute first
        if (img.dataset.type) {
            return img.dataset.type;
        }
        
        // Check classes
        if (img.classList.contains('artwork-image') || img.closest('.artwork-card')) {
            return 'artwork';
        }
        if (img.classList.contains('profile-image') || img.closest('.profile-card')) {
            return 'profile';
        }
        if (img.classList.contains('gallery-image') || img.closest('.gallery-item')) {
            return 'gallery';
        }
        if (img.classList.contains('artist-image') || img.closest('.artist-card')) {
            return 'artist';
        }
        
        // Check src path
        const src = img.src || img.dataset.src || '';
        if (src.includes('artwork')) return 'artwork';
        if (src.includes('profile')) return 'profile';
        if (src.includes('gallery')) return 'gallery';
        if (src.includes('artist')) return 'artist';
        
        return 'general';
    }
    
    /**
     * Setup intersection observer for lazy loading
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.dataset.src;
                        
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                            lazyObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            // Observe images with data-src attribute
            document.addEventListener('DOMContentLoaded', () => {
                const lazyImages = document.querySelectorAll('img[data-src]');
                lazyImages.forEach(img => lazyObserver.observe(img));
            });
        }
    }
    
    /**
     * Preload critical images
     */
    preloadImages(urls) {
        urls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }
    
    /**
     * Check if image exists before using it
     */
    async checkImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }
    
    /**
     * Generate placeholder data URL for specific dimensions
     */
    generatePlaceholder(width, height, type = 'general', text = '') {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
            <rect width="${width}" height="${height}" fill="#1a1a1a"/>
            <rect x="10%" y="10%" width="80%" height="80%" fill="#2a2a2a" stroke="#444" stroke-width="2"/>
            <circle cx="50%" cy="40%" r="8%" fill="#6366f1"/>
            ${text ? `<text x="50%" y="85%" text-anchor="middle" fill="#888" font-family="Inter, Arial, sans-serif" font-size="12">${text}</text>` : ''}
        </svg>`;
        
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }
}

// Initialize the image handler
const imageHandler = new ImageHandler();

// Export for use in other scripts
window.ImageHandler = ImageHandler;
window.imageHandler = imageHandler;
