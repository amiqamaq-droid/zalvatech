/* script.js */

// --- THEME TOGGLE (Event Listener Only) ---
var themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
var themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
var themeToggleBtn = document.getElementById('theme-toggle');

// Initial state check for icon visibility
if (document.documentElement.classList.contains('dark')) {
    themeToggleLightIcon.classList.remove('hidden');
} else {
    themeToggleDarkIcon.classList.remove('hidden');
}

themeToggleBtn.addEventListener('click', function() {
    themeToggleDarkIcon.classList.toggle('hidden');
    themeToggleLightIcon.classList.toggle('hidden');

    if (localStorage.getItem('color-theme')) {
        if (localStorage.getItem('color-theme') === 'light') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        }
    } else {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    }
});

// --- PRICING TABS LOGIC ---
function switchPricing(tabName) {
    const allContents = document.querySelectorAll('.pricing-content');
    allContents.forEach(content => {
        content.classList.add('hidden');
    });

    const selectedContent = document.getElementById('content-' + tabName);
    if(selectedContent) {
        selectedContent.classList.remove('hidden');
        selectedContent.classList.add('animate-fade-in');
    }

    const allButtons = document.querySelectorAll('.pricing-tab-btn');
    allButtons.forEach(btn => {
        btn.className = "pricing-tab-btn snap-center whitespace-nowrap px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100";
    });

    const activeBtn = document.getElementById('tab-' + tabName);
    if(activeBtn) {
        activeBtn.className = "pricing-tab-btn snap-center whitespace-nowrap px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 bg-slate-900 text-white shadow-lg ring-2 ring-slate-900";
    }
}

// --- MODAL LOGIC ---
function openPricingModal() {
    const modal = document.getElementById('pricingModal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closePricingModal() {
    const modal = document.getElementById('pricingModal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// --- PORTFOLIO SLIDER LOGIC ---
const track = document.getElementById('workspaceTrack');
const dotsContainer = document.getElementById('portfolioDots'); 
let autoScrollTimer;
let isScrolling = false;
let cards;
let singleSetWidth = 0;

function setupInfiniteLoop() {
    if(!track) return;
    const originals = Array.from(track.children);
    track.innerHTML = '';

    originals.forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
    });
    originals.forEach(card => {
        track.appendChild(card);
    });
    originals.forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
    });
    
    cards = track.getElementsByClassName('workspace-card');
}

function calculateDimensions() {
    if(!track) return;
    singleSetWidth = track.scrollWidth / 3;
}

function setupDots() {
    if(!cards) return;
    const originalCount = cards.length / 3; 
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < originalCount; i++) {
        const dot = document.createElement('button');
        dot.className = 'w-3 h-3 rounded-full bg-slate-700 transition-all duration-300 hover:bg-slate-500 cursor-pointer border-none p-0 mx-1';
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        
        dot.onclick = () => {
            clearInterval(autoScrollTimer);
            const cardWidth = singleSetWidth / originalCount;
            const targetPos = singleSetWidth + (i * cardWidth);
            
            track.scrollTo({ left: targetPos, behavior: 'smooth' });
            updateActiveDotManual(i);
            setTimeout(startAutoScroll, 4000); 
        };

        dotsContainer.appendChild(dot);
    }
    updateActiveDot();
}

function updateActiveDotManual(activeIndex) {
    Array.from(dotsContainer.children).forEach((dot, index) => {
        if (index === activeIndex) {
            dot.className = 'w-3 h-3 rounded-full bg-cyan-400 scale-125 transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.8)] border-none p-0 mx-1';
        } else {
            dot.className = 'w-3 h-3 rounded-full bg-slate-700 transition-all duration-300 hover:bg-slate-500 border-none p-0 mx-1';
        }
    });
}

function updateActiveDot() {
    if(!cards) return;
    const originalCount = cards.length / 3;
    if(originalCount === 0) return;

    const cardWidth = singleSetWidth / originalCount;
    const currentScroll = track.scrollLeft;
    
    let globalIndex = Math.round(currentScroll / cardWidth);
    let activeIndex = globalIndex % originalCount;

    if(isNaN(activeIndex)) activeIndex = 0;
    updateActiveDotManual(activeIndex);
}

function updateWorkspaceEffect() {
    if(!track) return;
    calculateDimensions();
    updateActiveDot();

    const center = track.scrollLeft + track.clientWidth / 2;

    if (track.scrollLeft <= 50) {
        track.style.scrollBehavior = 'auto';
        track.scrollLeft += singleSetWidth;
        track.style.scrollBehavior = 'smooth';
    } 
    else if (track.scrollLeft >= (singleSetWidth * 2) - 50) {
        track.style.scrollBehavior = 'auto';
        track.scrollLeft -= singleSetWidth;
        track.style.scrollBehavior = 'smooth';
    }

    Array.from(cards).forEach((card) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(center - cardCenter);
        const maxDistance = track.clientWidth / 1.5;
        
        let scale = 1.05 - (distance / maxDistance) * 0.2;
        scale = Math.max(0.85, Math.min(1.05, scale));
        
        let opacity = 1 - (distance / maxDistance) * 0.8;
        opacity = Math.max(0.4, Math.min(1, opacity));
        
        card.style.transform = `scale(${scale})`;
        card.style.opacity = opacity;
        
        if (distance < card.offsetWidth / 2) {
            card.classList.add('active');
            card.style.zIndex = '50';
        } else {
            card.classList.remove('active');
            card.style.zIndex = '10';
        }
    });
}

function startAutoScroll() {
    if (autoScrollTimer) clearInterval(autoScrollTimer);

    autoScrollTimer = setInterval(() => {
        if(!cards) return;
        const firstCard = cards[0];
        const gap = window.innerWidth < 768 ? 32 : 64; 
        const scrollStep = firstCard.offsetWidth + gap;

        track.scrollBy({
            left: scrollStep,
            behavior: 'smooth'
        });
    }, 3000);
}

window.onload = () => {
    if(document.getElementById('workspaceTrack')) {
        setupInfiniteLoop();
        calculateDimensions();
        track.scrollLeft = singleSetWidth;
        setupDots();
        updateWorkspaceEffect();
        startAutoScroll();

        track.addEventListener('scroll', () => {
            if (!isScrolling) {
                window.requestAnimationFrame(() => {
                    updateWorkspaceEffect();
                    isScrolling = false;
                });
                isScrolling = true;
            }
        });

        track.addEventListener('touchstart', () => clearInterval(autoScrollTimer));
        track.addEventListener('mouseenter', () => clearInterval(autoScrollTimer));
        track.addEventListener('touchend', startAutoScroll);
        track.addEventListener('mouseleave', startAutoScroll);
    }
};

window.addEventListener('resize', () => {
    calculateDimensions();
    updateWorkspaceEffect();
    setupDots();
});