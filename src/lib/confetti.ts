import confetti from "canvas-confetti";

export function fireBadgeConfetti() {
  // First burst - left side
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.3, y: 0.6 },
    colors: ["#00e5ff", "#ffd600", "#ff6d00", "#00e676", "#d500f9"],
  });

  // Second burst - right side (slight delay)
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.7, y: 0.6 },
      colors: ["#00e5ff", "#ffd600", "#ff6d00", "#00e676", "#d500f9"],
    });
  }, 150);

  // Star shapes falling
  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      origin: { x: 0.5, y: 0.3 },
      shapes: ["star"],
      colors: ["#ffd600", "#00e5ff"],
    });
  }, 300);
}
