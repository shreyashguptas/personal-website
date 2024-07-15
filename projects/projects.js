document.addEventListener('DOMContentLoaded', function() {
    const projectTitles = document.querySelectorAll('.project-title');
    
    projectTitles.forEach(title => {
        title.addEventListener('click', function(e) {
            const projectItem = this.closest('.project-item');
            const details = projectItem.querySelector('.project-details');
            
            if (details) {
                e.preventDefault();
                if (details.style.display === 'none' || details.style.display === '') {
                    details.style.display = 'block';
                } else {
                    details.style.display = 'none';
                }
            }
        });
    });
});