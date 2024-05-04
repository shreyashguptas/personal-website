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

};

// Client-side script
window.onload = function() {
  const imageContainer = document.getElementById('imageContainer');

  // Replace with your actual image names
  const imageNames = ['IMG_4001.JPG', 'image2.jpg', 'image3.jpg'];

  imageNames.forEach(imageName => {
    const img = document.createElement('img');
    img.src = `Kunu/Gallery/${imageName}`;
    imageContainer.appendChild(img);
  });
};