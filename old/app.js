// Smooth scroll and snap
document.documentElement.style.scrollBehavior = 'smooth';
document.documentElement.style.scrollSnapType = 'y mandatory';

const sections = document.querySelectorAll('section');
sections.forEach(section => {
    section.style.scrollSnapAlign = 'start';
});

// Update last modified date
document.getElementById('last-updated').textContent = 'LAST UPDATED: ' + new Date(document.lastModified).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
});