# Image Handling System - Chitram UI

This document describes the comprehensive image handling system implemented in Chitram UI to prevent broken images and provide graceful fallbacks throughout the application.

## Overview

The image handling system consists of:

1. **Client-side JavaScript** (`image-handler.js`) - Handles runtime image errors, lazy loading, and dynamic fallbacks
2. **Server-side utilities** (`utils/image-handler.js`) - Validates image paths and provides safe fallbacks before rendering
3. **CSS styling** - Provides loading states, error states, and responsive image containers
4. **EJS template helpers** - Simplifies safe image usage in templates

## Features

### ✅ Automatic Fallbacks
- Invalid image paths automatically fall back to appropriate placeholders
- Retry mechanism for temporary network issues
- Type-specific placeholders (artwork, profile, gallery, artist, general)

### ✅ Loading States
- Skeleton loading animations while images load
- Progressive image loading with fade-in effects
- Lazy loading for performance optimization

### ✅ Error Handling
- Graceful degradation when images fail to load
- Visual indicators for failed images
- Automatic placeholder generation

### ✅ Performance Optimization
- Intersection Observer for lazy loading
- Debounced retry mechanisms
- Preloading for critical images

### ✅ Responsive Design
- Aspect ratio containers prevent layout shifts
- Object-fit for consistent image sizing
- Mobile-optimized loading strategies

## Implementation

### Server-side Usage

```javascript
// In your route handler
app.get('/', (req, res) => {
    const processedArtworks = imageHandler.processArtworkData(artworks);
    res.render('home', { latestArtworks: processedArtworks });
});
```

### Template Usage

#### Option 1: Using processed data
```html
<img src="<%= artwork.safe_image_path %>" 
     alt="<%= artwork.art_name %>" 
     data-type="artwork"
     loading="lazy">
```

#### Option 2: Using template helper
```html
<%- include('partials/safe-image', { 
    src: '/uploads/artworks/' + artwork.art_image, 
    alt: artwork.art_name, 
    type: 'artwork',
    loading: 'lazy'
}) %>
```

#### Option 3: Using server-side function
```html
<img src="<%= getSafeImagePath('/uploads/artworks/' + artwork.art_image, 'artwork') %>" 
     alt="<%= artwork.art_name %>" 
     data-type="artwork">
```

### CSS Classes

```css
/* Loading state */
.artwork-image img.loading {
    background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-hover) 50%, var(--bg-tertiary) 75%);
    animation: imageLoading 1.5s infinite;
}

/* Loaded state */
.artwork-image img.loaded {
    filter: none;
    opacity: 1;
}

/* Error/placeholder state */
.artwork-image img.placeholder {
    opacity: 0.6;
    filter: grayscale(1);
}
```

## Image Types and Placeholders

### Artwork Images
- **Path**: `/uploads/artworks/`
- **Placeholder**: Dynamic SVG with art easel design
- **Container**: `.artwork-image`
- **Aspect Ratio**: 3:2 (400x300)

### Profile Images
- **Path**: `/uploads/profiles/`
- **Placeholder**: User silhouette SVG
- **Container**: `.profile-image`
- **Aspect Ratio**: 1:1 (200x200)

### Gallery Images
- **Path**: `/uploads/gallery/`
- **Placeholder**: Gallery grid SVG
- **Container**: `.gallery-image`
- **Aspect Ratio**: 1:1 (400x400)

### Artist Images
- **Path**: `/uploads/artists/`
- **Placeholder**: Artist profile SVG
- **Container**: `.artist-image`
- **Aspect Ratio**: 1:1 (300x300)

## JavaScript API

### ImageHandler Class

```javascript
// Check if image exists
const exists = await imageHandler.checkImageExists('/path/to/image.jpg');

// Generate custom placeholder
const placeholder = imageHandler.generatePlaceholder(400, 300, 'artwork', 'Custom Text');

// Preload critical images
imageHandler.preloadImages(['/image1.jpg', '/image2.jpg']);

// Handle image error manually
imageHandler.handleImageError(imgElement, 'artwork');
```

### Global Event Handling

The system automatically handles:
- New images added to DOM (via MutationObserver)
- Existing images on page load
- Lazy loading with Intersection Observer
- Retry mechanisms for failed loads

## Directory Structure

```
public/
├── images/
│   └── placeholders/          # Generated placeholder SVGs
│       ├── artwork-placeholder.svg
│       ├── profile-placeholder.svg
│       ├── gallery-placeholder.svg
│       ├── artist-placeholder.svg
│       └── general-placeholder.svg
├── uploads/
│   ├── artworks/             # User uploaded artwork images
│   ├── profiles/             # User profile pictures
│   └── applications/         # Application images
└── js/
    └── image-handler.js      # Client-side image handling
```

## Error Scenarios Handled

1. **Image file doesn't exist**: Falls back to appropriate placeholder
2. **Network timeout**: Retries with exponential backoff
3. **Invalid image format**: Shows error placeholder with visual indicators
4. **Permission denied**: Graceful fallback to placeholder
5. **Large image loading**: Shows loading animation until complete

## Performance Features

### Lazy Loading
- Images load only when entering viewport
- 50px margin for preloading
- Intersection Observer API for modern browsers

### Loading Optimization
- Skeleton animations prevent layout shift
- Progressive enhancement approach
- Fallback for older browsers

### Memory Management
- Cleanup of event listeners
- Garbage collection of retry attempts
- Efficient placeholder caching

## Browser Support

- **Modern browsers**: Full feature support including Intersection Observer
- **Legacy browsers**: Graceful degradation with basic fallbacks
- **Mobile browsers**: Optimized loading for slower connections

## Configuration

### Server Configuration
```javascript
// In server.js
const imageHandler = new ServerImageHandler();
app.use(imageHandler.createMiddleware());
```

### Client Configuration
```javascript
// Custom configuration
window.imageHandler.maxRetries = 3;
window.imageHandler.retryDelay = 1000;
```

## Testing

### Manual Testing
1. Load page with valid images - should display normally
2. Replace image with invalid path - should show placeholder
3. Temporarily disable network - should retry and show placeholder
4. Test with slow network - should show loading animation

### Automated Testing
```javascript
// Test image existence
const exists = imageHandler.imageExists('/test-image.jpg');
console.assert(exists === false, 'Non-existent image should return false');

// Test safe path generation
const safePath = imageHandler.getSafeImagePath('/invalid/path.jpg', 'artwork');
console.assert(safePath.includes('placeholder'), 'Should return placeholder path');
```

## Future Enhancements

1. **Image Optimization**: WebP format with fallbacks
2. **CDN Integration**: Support for external image CDNs
3. **Caching**: Service worker for offline image caching
4. **Analytics**: Track image load failures and performance
5. **Compression**: Automatic image compression for uploads

## Troubleshooting

### Common Issues

**Images not loading**
- Check file permissions in uploads directory
- Verify image paths in database
- Check network connectivity

**Placeholders not showing**
- Ensure image-handler.js is loaded
- Check browser console for errors
- Verify placeholder SVGs are created

**Performance issues**
- Enable lazy loading
- Optimize image sizes
- Use appropriate image formats

### Debug Mode

Enable debug logging:
```javascript
window.imageHandler.debug = true;
```

This will log all image loading events to the console for troubleshooting.

---

**Note**: This image handling system is designed to be robust and handle all edge cases gracefully. It ensures your application never shows broken image icons and provides a professional user experience even when images fail to load.
