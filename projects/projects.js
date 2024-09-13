document.addEventListener('DOMContentLoaded', function() {
    const projectItems = document.querySelectorAll('.project-item');

    projectItems.forEach(item => {
        const title = item.querySelector('.project-title');
        const link = item.querySelector('a.project-title');
        
        if (title && !link) {
            title.addEventListener('click', function(e) {
                e.preventDefault();
                item.classList.toggle('active');
            });
        }
    });
});