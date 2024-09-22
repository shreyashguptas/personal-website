// Set the target date (July 5, 2000)
const targetDate = new Date("July 5, 2000").getTime();

// Check if the timer has been stopped
const timerStopped = localStorage.getItem('timerStopped') === 'true';

let countdownTimer;
if (!timerStopped) {
  // Update the countdown every second
  countdownTimer = setInterval(function() {
    // Get the current date and time
    const now = new Date().getTime();

    // Calculate the time difference
    const timeDiff = now - targetDate;

    // Calculate years, months, days, hours, minutes, and seconds
    const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    // Display the countdown timer
    document.getElementById("years").innerHTML = years;
    document.getElementById("months").innerHTML = months;
    document.getElementById("days").innerHTML = days;
    document.getElementById("hours").innerHTML = hours;
    document.getElementById("minutes").innerHTML = minutes;
    document.getElementById("seconds").innerHTML = seconds;
  }, 1000);
}

document.getElementById("toggleSwitch").addEventListener("change", function() {
  if (this.checked) {
    const password = prompt("Enter the password to stop the timer:");
    if (password === '205090') {
      clearInterval(countdownTimer);
      localStorage.setItem('timerStopped', 'true');
    } else {
      this.checked = false;
    }
  } else {
    localStorage.setItem('timerStopped', 'false');
    startTimer(); // Start the timer
  }
});