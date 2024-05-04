// Get the current date and calculate the time since November 29, 2012
window.onload = function() {
  const today = new Date();
  const birthday = new Date('November 29, 2012');
  birthday.setHours(0);
  birthday.setMinutes(0);
  birthday.setSeconds(0);

  const timeDiff = today.getTime() - birthday.getTime();

  // Calculate years, months, days, and hours from the time difference
  const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365.25));
  const months = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30));
  const days = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  // Update the timer display
  document.getElementById('timer').innerHTML = `${years} years, ${months} months, ${days} days, and ${hours} hours`;

  // Get the image container element
  const imageContainer = document.getElementById('imageContainer');

  // Function to create an image element
  function createImageElement(src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Gallery Image';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    return img;
  }

  // Function to fetch and display images
  function displayImages() {
    // Replace 'Kunu/Gallery/' with the actual path to your Gallery folder
    const galleryPath = 'Kunu/Gallery/';

    // Use fetch to get a list of files in the Gallery folder
    fetch(galleryPath)
      .then(response => {
        // Check if the response is successful
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(data => {
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(data, 'text/html');
        const links = htmlDoc.querySelectorAll('a');

        // Filter out non-image files
        const imageFiles = Array.from(links)
          .map(link => link.href)
          .filter(href => /\.(jpe?g|png|gif|bmp)$/i.test(href));

        // Create image elements and append them to the container
        imageFiles.forEach(imageFile => {
          const img = createImageElement(`${galleryPath}${imageFile.split('/').pop()}`);
          imageContainer.appendChild(img);
        });
      })
      .catch(error => {
        console.error('Error fetching images:', error);
        // Display an error message or handle the error in some other way
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Failed to load images. Please try again later.';
        imageContainer.appendChild(errorMessage);
      });
  }

  // Call the displayImages function when the page loads
  displayImages();
};
