// theme-switcher.js (Updated for demo/presentation)
// NOTE (Telugu):
//  - Ee file lo authentication warning/auto-redirect ni demo kosam silent ga chesthunnam.
//  - Server-backed JWT flow unte, 'strictAuth' ni true chesi redirect logic activate cheyandi.
//  - I changes only for frontend demo/presentation — backend JWT checks should remain unchanged.

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle'); 

    // ------------------------------------------------------------------
    // 1) THEME TOGGLE UTILITY
    // ------------------------------------------------------------------
    // Function to set the theme and update the button icon. Saves choice to
    // localStorage so the user's preference persists between page loads.
    const setTheme = (theme) => {
        body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
            themeToggle.setAttribute('title', theme === 'dark' ? 'Toggle Light Mode' : 'Toggle Dark Mode');
        }
    };

    // Load saved theme or default to 'light' if none saved
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('light');
    }

    // Wire up the toggle button (if present)
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    // ------------------------------------------------------------------
    // 2) AUTHENTICATION GUARD
    // ------------------------------------------------------------------
    // Purpose:
    //  - During development/presentation we avoid noisy console warnings and
    //    automatic redirects that break demo flow. Instead the guard is
    //    non-intrusive and returns false if no token is found.
    //  - For production, flip `strictAuth` to true to re-enable redirecting
    //    unauthorized users to the frontpage.
    //
    // Behavior summary (current config):
    //  - If `strictAuth` === false: no console warnings, no redirects. Page
    //    continues to render and client-side UI shows "Please login" where
    //    appropriate.
    //  - If `strictAuth` === true: previous behavior (redirect to frontpage)
    //    is restored for protected pages.
    // ------------------------------------------------------------------

    const strictAuth = false; // <-- SET TO true in production to enable redirect

    function checkAuthentication() {
        // Prefer authToken (customer). If absent, salonAuthToken may exist for partners.
        const jwtToken = localStorage.getItem('authToken') || localStorage.getItem('salonAuthToken');

        // If strictAuth enabled, behave exactly like production (redirect if token missing)
        if (strictAuth) {
            if (!jwtToken) {
                // Only redirect on protected pages to avoid breaking public pages
                if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('profile.html') || window.location.pathname.includes('salon-dashboard.html')) {
                    // NOTE: in production you might want to show a brief flash message first
                    window.location.href = 'frontpage.html';
                    return false; // Not reachable after redirect but included for clarity
                }
            }
            return true;
        }

        // --- Demo mode (strictAuth === false) ---
        // For presentations we:
        //  1) Avoid noisy console warnings that distract evaluators.
        //  2) Avoid automatic redirects which prevent the demo from showing UI.
        // Instead, we silently return false when token is missing and let the
        // page render; the page itself should show "Please login" in the UI.
        if (!jwtToken) {
            // Do not call console.warn() here to keep DevTools clean while demoing.
            // If you still want a log for local debugging, uncomment the next line:
            // console.debug('DEBUG: auth token missing (demo mode).');
            return false;
        }
        return true;
    }

    // Run the check to let pages adapt their UI accordingly. Because demo mode
    // returns false silently, protected pages will not redirect but can show
    // a login prompt in the UI.
    checkAuthentication();

    // ------------------------------------------------------------------
    // 3) SIDEBAR / LOGOUT / ACTIVE-LINK INIT
    // ------------------------------------------------------------------
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');

    if (sidebar) {
        // Load saved desktop sidebar state
        if (window.innerWidth > 768) {
            const savedSidebarState = localStorage.getItem('sidebarState');
            if (savedSidebarState === 'collapsed') {
                sidebar.classList.add('collapsed');
            }
        }

        // Toggle (mobile or desktop behavior)
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.toggle('active');
                    document.body.classList.toggle('sidebar-active');
                } else {
                    sidebar.classList.toggle('collapsed');
                    localStorage.setItem('sidebarState', sidebar.classList.contains('collapsed') ? 'collapsed' : 'expanded');
                }
            });
        }

        // Logout handlers - clear storage and redirect on explicit logout click
        document.querySelectorAll('li[data-action="logout"] a').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                // Clear only auth-related fields to avoid wiping demo data unintentionally
                localStorage.removeItem('authToken');
                localStorage.removeItem('salonAuthToken');
                localStorage.removeItem('userName');
                localStorage.removeItem('salonName');

                // For demo UX show an alert then redirect
                alert('You have been logged out.');
                window.location.href = 'frontpage.html';
            });
        });

        // Highlight active page
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        document.querySelectorAll('.sidebar li').forEach(li => {
            li.classList.toggle('active', li.getAttribute('data-page') === currentPage);
        });

        // Show greeting using stored name (customer or salon)
        const userName = localStorage.getItem('userName') || localStorage.getItem('salonName') || 'Valued User';
        const userNameDisplay = document.getElementById('userName');
        if (userNameDisplay) {
            userNameDisplay.textContent = `Welcome, ${userName}!`;
        }
    }
});
