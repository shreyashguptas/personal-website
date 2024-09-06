document.addEventListener('DOMContentLoaded', function() {
    const navbar = `
        <div class="logo">
            <a href="/index.html">SHREYASH GUPTA</a>
        </div>
        <nav>
            <a href="/index.html">Home</a>
            <a href="/projects/projects.html">Projects</a>
            <a href="/readings/readings.html">Readings</a>
            <a href="/blogs/blogs.html">Blog</a>
            <a href="/about/about.html">About</a>
        </nav>
    `;

    document.querySelector('header').innerHTML = navbar;
});

function createNavbar() {
    const nav = document.createElement('nav');
    nav.innerHTML = `
        <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="projects/projects.html">Projects</a></li>
            <li><a href="readings/readings.html">Reading</a></li>
            <li><a href="blogs/blogs.html">Blogs</a></li>
            <li><a href="about.html">About</a></li>
        </ul>
    `;
    return nav;
}