document.addEventListener('scroll', function() {
    const navbar = document.getElementById('myNavbar');
    if (window.scrollY > 0) {
        navbar.classList.add('scroll');
    } else {
        navbar.classList.remove('scroll');
    }
});

// Smooth scroll and snap
document.documentElement.style.scrollBehavior = 'smooth';
document.documentElement.style.scrollSnapType = 'y mandatory';

const sections = document.querySelectorAll('section');
sections.forEach(section => {
    section.style.scrollSnapAlign = 'start';
});
