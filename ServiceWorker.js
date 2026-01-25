const cacheName = "Saltvision-Papadatos-1.0.0";
const contentToCache = [
    "Build/WebGl_Build.loader.js",
    "Build/WebGl_Build.framework.js",
    "Build/WebGl_Build.data",
    "Build/WebGl_Build.wasm",
    "TemplateData/style.css"
];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('fetch', function (e) {
    // 🔥 FIX: Add safety filters to prevent Firebase/external URL caching issues
    const requestUrl = e.request.url;
    
    // Skip caching for problematic URLs that cause infinite loops
    if (shouldSkipCaching(requestUrl)) {
        console.log(`[Service Worker] Skipping problematic URL: ${requestUrl}`);
        e.respondWith(fetch(e.request));
        return;
    }
    
    e.respondWith((async function () {
        try {
            let response = await caches.match(e.request);
            console.log(`[Service Worker] Fetching resource: ${requestUrl}`);
            
            if (response) { 
                return response; 
            }
            
            // Fetch with timeout to prevent hanging
            response = await fetchWithTimeout(e.request, 10000); // 10 second timeout
            
            // Only cache successful responses for our domain
            if (response.status === 200 && isSameDomain(requestUrl)) {
                const cache = await caches.open(cacheName);
                console.log(`[Service Worker] Caching new resource: ${requestUrl}`);
                cache.put(e.request, response.clone());
            }
            
            return response;
        } catch (error) {
            console.error(`[Service Worker] Fetch failed for ${requestUrl}:`, error);
            // Return a basic response instead of crashing
            return new Response('Network error', { 
                status: 503, 
                statusText: 'Service Unavailable' 
            });
        }
    })());
});

// 🔥 NEW: Function to identify problematic URLs that should not be cached
function shouldSkipCaching(url) {
    const problematicPatterns = [
        // Firebase URLs that cause infinite loops
        'firebasejs',
        'firebase-app.js',
        'firebase-database.js',
        'firebase-auth.js',
        'firebase-firestore.js',
        'gstatic.com/firebasejs',
        'googleapis.com',
        'google.com',
        
        // Chrome extension URLs that cause errors
        'chrome-extension://',
        'moz-extension://',
        
        // Other external services that might cause issues
        'analytics.google.com',
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        
        // Skip very large files that might timeout
        '.wasm?',
        '.data?'
    ];
    
    return problematicPatterns.some(pattern => url.includes(pattern));
}

// 🔥 NEW: Check if URL is from same domain (safe to cache)
function isSameDomain(url) {
    try {
        const requestDomain = new URL(url).hostname;
        const currentDomain = self.location.hostname;
        return requestDomain === currentDomain || requestDomain === 'localhost';
    } catch (e) {
        return false;
    }
}

// 🔥 NEW: Fetch with timeout to prevent hanging requests
function fetchWithTimeout(request, timeout = 10000) {
    return Promise.race([
        fetch(request),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Fetch timeout')), timeout)
        )
    ]);
}
