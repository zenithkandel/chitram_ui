const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Mock data for testing
const mockStats = {
    dailyViews: 1250,
    totalArtists: 45,
    totalArts: 320,
    totalOrders: 89
};

const mockArtworks = [
    {
        unique_id: '1',
        art_name: 'Digital Dreams',
        artist_unique_id: '101',
        artist_name: 'Maya Sharma',
        art_category: 'Digital Painting',
        cost: 2500,
        art_image: 'sample-artwork-1.jpg',
        art_description: 'A beautiful digital painting showcasing modern art techniques'
    },
    {
        unique_id: '2',
        art_name: 'Neon Nights',
        artist_unique_id: '102',
        artist_name: 'Raj Patel',
        art_category: 'Digital Art',
        cost: 3200,
        art_image: 'sample-artwork-2.jpg',
        art_description: 'Vibrant neon-inspired digital artwork with cyberpunk aesthetics'
    },
    {
        unique_id: '3',
        art_name: 'Nature\'s Harmony',
        artist_unique_id: '103',
        artist_name: 'Priya Thapa',
        art_category: 'Illustration',
        cost: 1800,
        art_image: 'sample-artwork-3.jpg',
        art_description: 'Beautiful nature illustration with intricate details'
    },
    {
        unique_id: '4',
        art_name: 'Abstract Emotions',
        artist_unique_id: '104',
        artist_name: 'Arjun Singh',
        art_category: 'Abstract',
        cost: 4500,
        art_image: 'sample-artwork-4.jpg',
        art_description: 'Emotional abstract piece expressing deep feelings through color'
    },
    {
        unique_id: '5',
        art_name: 'Cosmic Journey',
        artist_unique_id: '105',
        artist_name: 'Sita Gurung',
        art_category: 'Sci-Fi',
        cost: 3800,
        art_image: 'sample-artwork-5.jpg',
        art_description: 'Epic space-themed artwork depicting interstellar travel'
    }
];

// Routes
app.get('/', (req, res) => {
    res.render('home', {
        stats: mockStats,
        latestArtworks: mockArtworks
    });
});

app.get('/gallery', (req, res) => {
    res.render('gallery', {
        artworks: mockArtworks,
        title: 'Gallery - Chitram'
    });
});

app.get('/artists', (req, res) => {
    res.render('artists', {
        title: 'Artists - Chitram'
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About - Chitram'
    });
});

app.get('/apply', (req, res) => {
    res.render('apply', {
        title: 'Apply as Artist - Chitram'
    });
});

app.get('/cart', (req, res) => {
    res.render('cart', {
        title: 'Shopping Cart - Chitram'
    });
});

app.get('/checkout', (req, res) => {
    res.render('checkout', {
        title: 'Checkout - Chitram'
    });
});

app.get('/track-orders', (req, res) => {
    res.render('track-orders', {
        title: 'Track Orders - Chitram'
    });
});

app.get('/artist/:id', (req, res) => {
    const artistId = req.params.id;
    // Mock artist data
    const artist = {
        unique_id: artistId,
        full_name: 'Sample Artist',
        bio: 'Talented digital artist with years of experience',
        district: 'Kathmandu',
        school_college: 'Art Institute',
        profile_picture: 'sample-artist.jpg'
    };
    
    res.render('artist-profile', {
        artist: artist,
        artworks: mockArtworks.slice(0, 3),
        title: `${artist.full_name} - Chitram`
    });
});

app.get('/artwork/:id', (req, res) => {
    const artworkId = req.params.id;
    const artwork = mockArtworks.find(art => art.unique_id === artworkId) || mockArtworks[0];
    
    res.render('artwork-details', {
        artwork: artwork,
        title: `${artwork.art_name} - Chitram`
    });
});

// API Routes for AJAX requests
app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    
    // Simulate newsletter subscription
    setTimeout(() => {
        res.json({
            success: true,
            message: 'Successfully subscribed to newsletter!'
        });
    }, 1000);
});

app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    // Simulate contact form submission
    res.json({
        success: true,
        message: 'Message sent successfully!'
    });
});

// Error handling
app.use((req, res) => {
    res.status(404).render('error', {
        title: '404 - Page Not Found',
        error: 'The page you are looking for does not exist.'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: '500 - Server Error',
        error: 'Something went wrong on our end.'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎨 Chitram UI Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`🌟 Environment: ${process.env.NODE_ENV || 'development'}`);
});
