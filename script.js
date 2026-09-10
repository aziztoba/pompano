const intro = document.querySelector("#intro");
const invitation = document.querySelector("#invitation");
const openInvitation = document.querySelector("#openInvitation");
const openLabel = document.querySelector("#openLabel");
const petalField = document.querySelector(".petal-field");
const yesButton = document.querySelector("#yesButton");
const noButton = document.querySelector("#noButton");
const answerArea = document.querySelector("#answerArea");
const accepted = document.querySelector("#accepted");
const noTease = document.querySelector("#noTease");
const addCalendar = document.querySelector("#addCalendar");

let invitationOpened = false;
let noAttempts = 0;

function scatterPetals(amount = 24) {
  for (let index = 0; index < amount; index += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty("--fall-duration", `${3.5 + Math.random() * 3}s`);
    petal.style.setProperty("--drift", `${-90 + Math.random() * 180}px`);
    petal.style.animationDelay = `${Math.random() * 0.9}s`;
    petal.style.transform = `rotate(${Math.random() * 180}deg)`;
    petalField.append(petal);
    window.setTimeout(() => petal.remove(), 7500);
  }
}

function openCard() {
  if (invitationOpened) return;
  invitationOpened = true;
  intro.classList.add("opening");
  scatterPetals(18);

  window.setTimeout(() => {
    intro.classList.add("opened");
    invitation.classList.add("visible");
    invitation.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "auto";
  }, 1100);
}

openInvitation.addEventListener("click", openCard);
openLabel.addEventListener("click", openCard);

const teaseMessages = [
  "Nice try! The heart says yes.",
  "That button is a little shy…",
  "Rahma and Aziz are waiting for a yes!",
  "It knows you didn’t mean that.",
  "Okay, we’ll make this easier: choose yes!",
];

function moveNoButton(event) {
  event.preventDefault();
  noAttempts += 1;

  const bounds = answerArea.getBoundingClientRect();
  const buttonBounds = noButton.getBoundingClientRect();
  const maxX = Math.max(0, bounds.width - buttonBounds.width - 8);
  const maxY = Math.max(0, bounds.height - buttonBounds.height - 8);

  noButton.style.left = `${8 + Math.random() * Math.max(0, maxX - 8)}px`;
  noButton.style.top = `${8 + Math.random() * Math.max(0, maxY - 8)}px`;
  noButton.style.transform = `rotate(${-8 + Math.random() * 16}deg)`;
  noTease.textContent = teaseMessages[Math.min(noAttempts - 1, teaseMessages.length - 1)];
}

noButton.addEventListener("pointerenter", moveNoButton);
noButton.addEventListener("pointerdown", moveNoButton);

yesButton.addEventListener("click", () => {
  yesButton.hidden = true;
  noButton.hidden = true;
  noTease.textContent = "";
  accepted.classList.add("show");
  scatterPetals(60);
});

const eventDate = new Date("2026-09-19T18:00:00+03:00");

function updateCountdown() {
  const remaining = Math.max(0, eventDate.getTime() - Date.now());
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1_000);

  document.querySelector("#days").textContent = String(days).padStart(3, "0");
  document.querySelector("#hours").textContent = String(hours).padStart(2, "0");
  document.querySelector("#minutes").textContent = String(minutes).padStart(2, "0");
  document.querySelector("#seconds").textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

addCalendar.addEventListener("click", () => {
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Aziz and Rahma//Engagement//EN",
    "BEGIN:VEVENT",
    "UID:aziz-rahma-engagement-20260919@example.com",
    "DTSTAMP:20260919T150000Z",
    "DTSTART:20260919T150000Z",
    "SUMMARY:Aziz & Rahma's Engagement",
    "LOCATION:Viola Hall, Port Said",
    "DESCRIPTION:Come celebrate the beginning of Aziz and Rahma's most beautiful chapter.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([calendar], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "aziz-and-rahma-engagement.ics";
  link.click();
  URL.revokeObjectURL(link.href);
});
