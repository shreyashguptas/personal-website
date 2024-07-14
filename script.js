document.addEventListener('DOMContentLoaded', function() {
    fetch('projects/projects.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const projects = doc.querySelectorAll('.projects-list li');
            const previewList = document.getElementById('projects-preview');
            
            for (let i = 0; i < Math.min(5, projects.length); i++) {
                const li = document.createElement('li');
                const title = projects[i].querySelector('h2 a').textContent;
                const date = projects[i].querySelector('.project-date').textContent;
                li.innerHTML = `<a href="#"><span class="title">${title}</span><span class="date">${date}</span></a>`;
                previewList.appendChild(li);
            }
        });
});