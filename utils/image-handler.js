/**
 * Server-side Image Handling Utilities for Chitram UI
 * Provides image validation, path resolution, and fallback mechanisms
 */

const fs = require('fs');
const path = require('path');

class ServerImageHandler {
    constructor() {
        this.uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
        this.placeholdersDir = path.join(__dirname, '..', 'public', 'images', 'placeholders');
        this.publicDir = path.join(__dirname, '..', 'public');
        
        this.defaultImages = {
            artwork: '/images/placeholders/artwork-placeholder.svg',
            profile: '/images/placeholders/profile-placeholder.svg',
            gallery: '/images/placeholders/gallery-placeholder.svg',
            artist: '/images/placeholders/artist-placeholder.svg',
            general: '/images/placeholders/general-placeholder.svg'
        };
        
        this.init();
    }
    
    init() {
        // Ensure directories exist
        this.ensureDirectoriesExist();
        
        // Create placeholder files if they don't exist
        this.createPlaceholderFiles();
    }
    
    /**
     * Ensure all required directories exist
     */
    ensureDirectoriesExist() {
        const dirs = [
            this.uploadsDir,
            path.join(this.uploadsDir, 'artworks'),
            path.join(this.uploadsDir, 'profiles'),
            path.join(this.uploadsDir, 'applications'),
            this.placeholdersDir
        ];
        
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        });
    }
    
    /**
     * Create SVG placeholder files
     */
    createPlaceholderFiles() {
        const placeholders = {
            'artwork-placeholder.svg': this.generateArtworkPlaceholder(),
            'profile-placeholder.svg': this.generateProfilePlaceholder(),
            'gallery-placeholder.svg': this.generateGalleryPlaceholder(),
            'artist-placeholder.svg': this.generateArtistPlaceholder(),
            'general-placeholder.svg': this.generateGeneralPlaceholder()
        };
        
        Object.entries(placeholders).forEach(([filename, content]) => {
            const filepath = path.join(this.placeholdersDir, filename);
            if (!fs.existsSync(filepath)) {
                fs.writeFileSync(filepath, content);
                console.log(`🖼️ Created placeholder: ${filename}`);
            }
        });
    }
    
    /**
     * Validate if an image file exists
     */
    imageExists(imagePath) {
        if (!imagePath) return false;
        
        // Handle both absolute and relative paths
        let fullPath;
        if (path.isAbsolute(imagePath)) {
            fullPath = imagePath;
        } else {
            // Remove leading slash if present
            const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
            fullPath = path.join(this.publicDir, cleanPath);
        }
        
        try {
            return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile();
        } catch (error) {
            console.warn(`Image validation error for ${imagePath}:`, error.message);
            return false;
        }
    }
    
    /**
     * Get safe image path with fallback
     */
    getSafeImagePath(imagePath, type = 'general') {
        if (!imagePath) {
            return this.defaultImages[type] || this.defaultImages.general;
        }
        
        // Check if the image exists
        if (this.imageExists(imagePath)) {
            return imagePath;
        }
        
        // Try with /uploads/ prefix if not already present
        if (!imagePath.startsWith('/uploads/') && !imagePath.startsWith('uploads/')) {
            const uploadsPath = `/uploads/${imagePath}`;
            if (this.imageExists(uploadsPath)) {
                return uploadsPath;
            }
        }
        
        // Return appropriate placeholder
        return this.defaultImages[type] || this.defaultImages.general;
    }
    
    /**
     * Process artwork data with safe image paths
     */
    processArtworkData(artworks) {
        if (!Array.isArray(artworks)) {
            return artworks;
        }
        
        return artworks.map(artwork => {
            if (artwork.art_image) {
                artwork.safe_image_path = this.getSafeImagePath(`/uploads/artworks/${artwork.art_image}`, 'artwork');
                artwork.image_exists = this.imageExists(`/uploads/artworks/${artwork.art_image}`);
            } else {
                artwork.safe_image_path = this.defaultImages.artwork;
                artwork.image_exists = false;
            }
            return artwork;
        });
    }
    
    /**
     * Process artist data with safe image paths
     */
    processArtistData(artists) {
        if (!Array.isArray(artists)) {
            return artists;
        }
        
        return artists.map(artist => {
            if (artist.profile_picture) {
                artist.safe_profile_path = this.getSafeImagePath(`/uploads/profiles/${artist.profile_picture}`, 'profile');
                artist.profile_exists = this.imageExists(`/uploads/profiles/${artist.profile_picture}`);
            } else {
                artist.safe_profile_path = this.defaultImages.profile;
                artist.profile_exists = false;
            }
            return artist;
        });
    }
    
    /**
     * Generate middleware for Express
     */
    createMiddleware() {
        return (req, res, next) => {
            // Add image utility methods to res.locals
            res.locals.getSafeImagePath = (imagePath, type) => this.getSafeImagePath(imagePath, type);
            res.locals.imageExists = (imagePath) => this.imageExists(imagePath);
            res.locals.defaultImages = this.defaultImages;
            
            next();
        };
    }
    
    /**
     * SVG Placeholder Generators
     */
    generateArtworkPlaceholder() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
            <rect width="400" height="300" fill="#1a1a1a"/>
            <rect x="50" y="50" width="300" height="200" fill="#2a2a2a" stroke="#444" stroke-width="2"/>
            <circle cx="120" cy="120" r="15" fill="#6366f1"/>
            <polygon points="80,180 120,140 160,160 200,120 240,140 280,100 320,120 320,200 80,200" fill="#444"/>
            <text x="200" y="240" text-anchor="middle" fill="#888" font-family="Inter, Arial, sans-serif" font-size="14">Artwork Preview</text>
        </svg>`;
    }
    
    generateProfilePlaceholder() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
            <rect width="200" height="200" fill="#1a1a1a"/>
            <circle cx="100" cy="80" r="30" fill="#444"/>
            <path d="M60 140 Q100 120 140 140 L140 180 L60 180 Z" fill="#444"/>
            <text x="100" y="195" text-anchor="middle" fill="#888" font-family="Inter, Arial, sans-serif" font-size="10">Profile</text>
        </svg>`;
    }
    
    generateGalleryPlaceholder() {
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
    
    generateArtistPlaceholder() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
            <rect width="300" height="300" fill="#1a1a1a"/>
            <circle cx="150" cy="100" r="40" fill="#444"/>
            <path d="M90 160 Q150 140 210 160 L210 220 L90 220 Z" fill="#444"/>
            <rect x="120" y="180" width="60" height="4" fill="#6366f1"/>
            <rect x="130" y="190" width="40" height="3" fill="#888"/>
            <text x="150" y="260" text-anchor="middle" fill="#888" font-family="Inter, Arial, sans-serif" font-size="12">Artist Profile</text>
        </svg>`;
    }
    
    generateGeneralPlaceholder() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200">
            <rect width="300" height="200" fill="#1a1a1a"/>
            <circle cx="150" cy="100" r="30" fill="#444"/>
            <text x="150" y="150" text-anchor="middle" fill="#888" font-family="Inter, Arial, sans-serif" font-size="12">Image Not Found</text>
        </svg>`;
    }
}

module.exports = ServerImageHandler;
