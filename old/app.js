// Smooth scroll and snap
document.documentElement.style.scrollBehavior = 'smooth';
document.documentElement.style.scrollSnapType = 'y mandatory';

const sections = document.querySelectorAll('section');
sections.forEach(section => {
    section.style.scrollSnapAlign = 'start';
});
