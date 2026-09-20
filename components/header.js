document.addEventListener("DOMContentLoaded", () => {
    // Determine relative path to header.html based on current URL directory depth
    const pathDepth = (window.location.pathname.match(/\//g) || []).length;
    const isSubfolder = window.location.pathname.includes('/components/') || pathDepth > 1;
    const fetchPath = isSubfolder ? '../header.html' : 'header.html';

    fetch(fetchPath)
        .then(response => {
            if (!response.ok) {
                // Fallback attempt to root level fetch if subfolder relative fetch fails
                return fetch('header.html');
            }
            return response;
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to load header component");
            return response.text();
        })
        .then(data => {
            const placeholder = document.getElementById('header-placeholder');
            if (!placeholder) {
                console.error("Header placeholder element (#header-placeholder) not found.");
                return;
            }

            // 1. Inject raw header content
            placeholder.innerHTML = data;

            // 2. Re-evaluate and re-execute embedded scripts (Google CSE, etc.)
            const scripts = placeholder.querySelectorAll("script");
            scripts.forEach(oldScript => {
                const newScript = document.createElement("script");
                
                // Copy all attributes (async, src, etc.)
                Array.from(oldScript.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });

                // Copy inline script contents if any
                if (oldScript.innerHTML) {
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                }

                // Replace old script node to trigger execution in DOM context
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });

            // 3. Re-initialize interactive components and event handlers
            initializeHeaderInteractions();
        })
        .catch(error => console.error("Error loading header component:", error));
});

/**
 * Initializes and binds all event handlers for interactive elements 
 * within header.html to prevent broken states across all pages.
 */
function initializeHeaderInteractions() {
    // --- 1. Dark / Light Mode Persistence & Dynamic Logo ---
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeEmoji = document.getElementById('themeEmoji');
    const logoOverlay = document.getElementById('logoOverlay');

    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            if (themeEmoji) themeEmoji.textContent = '🌙';
            if (logoOverlay) logoOverlay.src = 'images/cctwordingnophrase-orange.png';
        } else {
            document.body.classList.remove('dark-mode');
            if (themeEmoji) themeEmoji.textContent = '☀️';
            if (logoOverlay) logoOverlay.src = 'images/cctwordingnophrase-white.png';
        }
    }

    // Load saved preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    applyTheme(savedTheme === 'dark');

    if (themeToggleBtn) {
        // Clone node to drop existing click listeners if re-running
        const newThemeBtn = themeToggleBtn.cloneNode(true);
        themeToggleBtn.parentNode.replaceChild(newThemeBtn, themeToggleBtn);
        
        newThemeBtn.addEventListener('click', () => {
            const isDark = !document.body.classList.contains('dark-mode');
            applyTheme(isDark);
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    // --- 2. Dropdown Menu Toggle (Delegated & Isolated) ---
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (menuBtn && dropdownMenu) {
        // Drop old listeners via replacement
        const newMenuBtn = menuBtn.cloneNode(true);
        menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);

        newMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        // Close menu when clicking anywhere outside
        document.addEventListener('click', (e) => {
            if (!newMenuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // --- 3. Google Search Modal Trigger ---
    const openSearchBtn = document.getElementById('openSearchBtn');
    const closeSearchBtn = document.getElementById('closeSearchBtn');
    const searchModal = document.getElementById('searchModal');

    if (openSearchBtn && searchModal) {
        const newOpenBtn = openSearchBtn.cloneNode(true);
        openSearchBtn.parentNode.replaceChild(newOpenBtn, openSearchBtn);

        newOpenBtn.addEventListener('click', () => {
            searchModal.classList.add('active');
            setTimeout(() => {
                const searchInput = document.querySelector('.gsc-input input');
                if (searchInput) searchInput.focus();
            }, 200);
        });
    }

    if (closeSearchBtn && searchModal) {
        const newCloseBtn = closeSearchBtn.cloneNode(true);
        closeSearchBtn.parentNode.replaceChild(newCloseBtn, closeSearchBtn);

        newCloseBtn.addEventListener('click', () => {
            searchModal.classList.remove('active');
        });
    }

    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.classList.remove('active');
            }
        });
    }

    // --- 4. Navigation Link Highlighting ---
    function updateActiveNav() {
        const currentPath = window.location.pathname.split('/').pop().toLowerCase();
        const currentHash = window.location.hash.toLowerCase();

        const navHome = document.getElementById('navHome');
        const navRates = document.getElementById('navRates');
        const navContact = document.getElementById('navContact');

        [navHome, navRates, navContact].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });

        if (currentPath === 'rates.html' || currentPath === 'rates') {
            if (navRates) navRates.classList.add('active');
        } else if ((currentPath === '' || currentPath === 'index.html' || currentPath === 'index') && currentHash === '#contact') {
            if (navContact) navContact.classList.add('active');
        } else if (currentPath === '' || currentPath === 'index.html' || currentPath === 'index') {
            if (navHome) navHome.classList.add('active');
        }
    }

    updateActiveNav();
    window.addEventListener('hashchange', updateActiveNav);
}
