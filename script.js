"use strict";

const $ = (selector) => document.querySelector(selector);
const intro = $("#intro");
const invitation = $("#invitation");
const envelope = $("#openInvitation");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const petalField = $(".petal-field");
const noButton = $("#noButton");
const yesButton = $("#yesButton");
const answerArea = $("#answerArea");
const accepted = $("#accepted");
const rsvpInvite = $("#rsvpInvite");

let opened = false;
let opening = false;
let noAttempts = 0;
let lastDodge = -Infinity;
let isAccepted = false;
let toastTimer;
let dragOrigin = null;

document.body.classList.add("is-sealed");
invitation.inert = true;
invitation.setAttribute("aria-hidden", "true");

function scatterPetals(amount = 24) {
  if (reducedMotion.matches || document.hidden) return;
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < amount; index += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = Math.random() * 100 + "%";
    petal.style.setProperty("--duration", 3.8 + Math.random() * 2.5 + "s");
    petal.style.setProperty("--delay", Math.random() * 0.7 + "s");
    petal.style.setProperty("--drift", -110 + Math.random() * 220 + "px");
    petal.style.setProperty("--spin", 240 + Math.random() * 580 + "deg");
    petal.addEventListener("animationend", () => petal.remove(), {
      once: true,
    });
    fragment.append(petal);
  }
  petalField.append(fragment);
}

function openCard() {
  if (opened || opening) return;
  opening = true;
  startOfficialTrack();
  intro.classList.add("opening");
  setTimeout(
    () => {
      opened = true;
      opening = false;
      invitation.inert = false;
      invitation.removeAttribute("aria-hidden");
      invitation.classList.add("visible");
      intro.classList.add("opened");
      intro.inert = true;
      document.body.classList.remove("is-sealed");
      window.scrollTo({ top: 0, behavior: "instant" });
      $("#coupleNames").focus({ preventScroll: true });
      intro.setAttribute("aria-hidden", "true");
      scatterPetals(30);
      observeSections();
      startOfficialTrack();
    },
    reducedMotion.matches ? 0 : 900,
  );
}

envelope.addEventListener("click", openCard);
$("#openLabel").addEventListener("click", openCard);
envelope.addEventListener("pointerdown", (event) => {
  dragOrigin = { x: event.clientX, y: event.clientY };
  envelope.setPointerCapture(event.pointerId);
});
envelope.addEventListener("pointermove", (event) => {
  if (!dragOrigin || opening || opened) return;
  if (
    Math.hypot(event.clientX - dragOrigin.x, event.clientY - dragOrigin.y) > 45
  ) {
    dragOrigin = null;
    openCard();
  }
});
for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) {
  envelope.addEventListener(name, () => {
    dragOrigin = null;
  });
}

function reseal() {
  if (opening) return;
  resetRsvp(false);
  opened = false;
  invitation.classList.remove("visible");
  intro.removeAttribute("aria-hidden");
  intro.inert = false;
  intro.classList.remove("opening", "opened");
  document.body.classList.add("is-sealed");
  window.scrollTo({ top: 0, behavior: "instant" });
  $("#openLabel").focus({ preventScroll: true });
  invitation.inert = true;
  invitation.setAttribute("aria-hidden", "true");
  $("#readingProgress").style.transform = "scaleX(0)";
}

$("#reopenLetter").addEventListener("click", reseal);
$(".masthead .monogram").addEventListener("click", (event) => {
  if (!opened) {
    event.preventDefault();
    openCard();
  }
});

let sectionObserver;
function observeSections() {
  if (sectionObserver) return;
  if (!("IntersectionObserver" in window) || reducedMotion.matches) {
    document
      .querySelectorAll(".reveal")
      .forEach((section) => section.classList.add("in-view"));
    return;
  }
  sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          sectionObserver.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((section) => sectionObserver.observe(section));
}

let scrollQueued = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollQueued || !opened) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      const distance =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
      $("#readingProgress").style.transform = "scaleX(" + progress + ")";
      scrollQueued = false;
    });
  },
  { passive: true },
);

const teaseMessages = [
  "Oops. That one has commitment issues.",
  "Leaving us with all these butterflies?",
  "Even the button wants you there.",
  "You bring the smiles. We bring the happy tears.",
  "Plot twist: even “No” said yes. ♥",
];
const noLabels = [
  "No, sorry",
  "Really?",
  "But the love!",
  "One more try?",
  "Okay, yes ♥",
];

// Pick a safe position outside the Yes button and away from the pointer.
// Candidate selection is bounded, so the joke cannot trap the browser in a loop.
function repositionNo(pointer) {
  if (reducedMotion.matches) return;
  const area = answerArea.getBoundingClientRect();
  const no = noButton.getBoundingClientRect();
  const yes = yesButton.getBoundingClientRect();
  const padding = 6;
  const maxX = Math.max(padding, area.width - no.width - padding);
  const maxY = Math.max(padding, area.height - no.height - padding);
  const pointerX = pointer ? pointer.x - area.left : no.left - area.left;
  const pointerY = pointer ? pointer.y - area.top : no.top - area.top;
  const candidates = [];
  for (let row = 0; row <= 4; row += 1) {
    for (let column = 0; column <= 6; column += 1) {
      const x = padding + ((maxX - padding) * column) / 6;
      const y = padding + ((maxY - padding) * row) / 4;
      const overlapsYes =
        x < yes.right - area.left + 14 &&
        x + no.width > yes.left - area.left - 14 &&
        y < yes.bottom - area.top + 14 &&
        y + no.height > yes.top - area.top - 14;
      if (overlapsYes) continue;
      const distance = Math.hypot(
        x + no.width / 2 - pointerX,
        y + no.height / 2 - pointerY,
      );
      candidates.push({ x, y, distance });
    }
  }
  candidates.sort((a, b) => b.distance - a.distance);
  if (!candidates.length) return;
  const position =
    candidates[Math.floor(Math.random() * Math.min(3, candidates.length))];
  noButton.style.left = position.x + "px";
  noButton.style.top = position.y + "px";
}

function dodgeNo(event) {
  if (isAccepted || noAttempts >= teaseMessages.length) return;
  if (performance.now() - lastDodge < 200) return;
  if (event.cancelable) event.preventDefault();
  lastDodge = performance.now();
  noAttempts += 1;
  $("#noTease").textContent = teaseMessages[noAttempts - 1];
  noButton.textContent = noLabels[noAttempts - 1];
  const percent =
    noAttempts === 5 ? "100%" : (99 + noAttempts * 0.2).toFixed(1) + "%";
  $("#lovePercent").textContent = percent;
  $("#loveMeter").style.width = percent;
  noButton.classList.toggle("is-convinced", noAttempts === 5);
  repositionNo(
    event.type.startsWith("pointer")
      ? { x: event.clientX, y: event.clientY }
      : null,
  );
}

noButton.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") dodgeNo(event);
});
noButton.addEventListener("pointerdown", (event) => {
  if (noAttempts < 5) dodgeNo(event);
});
noButton.addEventListener("click", (event) => {
  if (performance.now() - lastDodge < 200) return;
  if (noAttempts >= 5) acceptInvitation();
  else dodgeNo(event); // Keyboard and assistive-technology users get the same joke.
});
window.addEventListener("resize", () => {
  // The original centered position is valid after any viewport change.
  noButton.style.removeProperty("left");
  noButton.style.removeProperty("top");
});

function acceptInvitation() {
  if (isAccepted) return;
  isAccepted = true;
  rsvpInvite.hidden = true;
  accepted.hidden = false;
  $("#rsvp").setAttribute("aria-labelledby", "acceptedTitle");
  accepted.focus({ preventScroll: true });
  accepted.scrollIntoView({
    behavior: reducedMotion.matches ? "instant" : "smooth",
    block: "center",
  });
  scatterPetals(70);
}

function resetRsvp(focus = true) {
  isAccepted = false;
  noAttempts = 0;
  lastDodge = -Infinity;
  accepted.hidden = true;
  rsvpInvite.hidden = false;
  $("#rsvp").setAttribute("aria-labelledby", "rsvpTitle");
  noButton.textContent = "No, sorry";
  noButton.classList.remove("is-convinced");
  noButton.style.removeProperty("left");
  noButton.style.removeProperty("top");
  $("#noTease").textContent = "Psst… the “No” button has other plans.";
  $("#lovePercent").textContent = "99%";
  $("#loveMeter").style.width = "99%";
  petalField.replaceChildren();
  if (focus) yesButton.focus({ preventScroll: true });
}
yesButton.addEventListener("click", acceptInvitation);
$("#replayRsvp").addEventListener("click", () => resetRsvp());

// 18:00 in Port Said on the invitation date, explicitly stored as UTC.
const eventTime = Date.parse("2026-09-19T15:00:00Z");
const countdownNodes = ["days", "hours", "minutes", "seconds"].map((id) =>
  $("#" + id),
);
function updateCountdown() {
  const remaining = Math.max(0, eventTime - Date.now());
  const units = [
    Math.floor(remaining / 86400000),
    Math.floor(remaining / 3600000) % 24,
    Math.floor(remaining / 60000) % 60,
    Math.floor(remaining / 1000) % 60,
  ];
  units.forEach((value, index) => {
    countdownNodes[index].textContent = String(value).padStart(2, "0");
  });
  if (!remaining) {
    $("#countdownTitle").textContent = "Our next chapter has begun.";
    $("#countdownFootnote").textContent =
      "19 September 2026. A day we will always love.";
  }
}
updateCountdown();
setInterval(() => {
  if (!document.hidden) updateCountdown();
}, 1000);

function showToast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 3500);
}

function downloadFile(contents, type, filename) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  // Keep the URL alive long enough for browsers to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

$("#addCalendar").addEventListener("click", () => {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "PRODID:-//Aziz and Rahma//Engagement Invitation//EN",
    "BEGIN:VEVENT",
    "UID:aziz-rahma-20260919@invitation.local",
    "DTSTAMP:" + stamp,
    "DTSTART:20260919T150000Z",
    "SUMMARY:Aziz & Rahma's Engagement",
    "LOCATION:Viola Hall\\, Port Said",
    "DESCRIPTION:A little love. A big yes. Celebrate our next chapter with us.",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  downloadFile(calendar, "text/calendar;charset=utf-8", "aziz-and-rahma.ics");
  showToast("Our date, ready for your calendar. ♥");
});

$("#saveKeepsake").addEventListener("click", () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
  <rect width="1200" height="700" fill="#751c35"/>
  <rect x="28" y="28" width="1144" height="644" rx="8" fill="none" stroke="#cf8c9e"/>
  <text x="600" y="107" text-anchor="middle" fill="#efc5cd" font-family="Georgia,serif" font-size="24" font-style="italic">A very lovely plot twist.</text>
  <rect x="90" y="165" width="1020" height="375" rx="8" fill="#fcf7ef"/>
  <path d="M910 165V540" stroke="#ba7a8b" stroke-width="2" stroke-dasharray="6 8"/>
  <circle cx="910" cy="165" r="18" fill="#751c35"/><circle cx="910" cy="540" r="18" fill="#751c35"/>
  <g fill="#751c35" text-anchor="middle">
  <text x="500" y="230" font-family="Arial,sans-serif" font-size="14" letter-spacing="4">ADMIT ONE VERY SPECIAL HUMAN</text>
  <text x="500" y="334" font-family="Georgia,serif" font-size="76" font-style="italic">Aziz &amp; Rahma</text>
  <text x="500" y="401" font-family="Arial,sans-serif" font-size="20" letter-spacing="3">19 SEPTEMBER 2026 · 6:00 PM</text>
  <text x="500" y="447" font-family="Arial,sans-serif" font-size="17" letter-spacing="3">VIOLA HALL, PORT SAID</text>
  <text x="500" y="491" font-family="Georgia,serif" font-size="21" font-style="italic">The beginning of always.</text>
  <path d="M1010 328S970 306 970 280C970 256 1000 255 1010 277C1020 255 1050 256 1050 280C1050 306 1010 328 1010 328Z" fill="none" stroke="#751c35" stroke-width="2"/>
  <text x="1010" y="380" font-family="Arial,sans-serif" font-size="16" letter-spacing="3">LOVE IS</text>
  <text x="1010" y="410" font-family="Arial,sans-serif" font-size="16" letter-spacing="3">THE TICKET.</text></g>
  <text x="600" y="615" text-anchor="middle" fill="#efc5cd" font-family="Georgia,serif" font-size="26" font-style="italic">See you there, with all our love.</text>
  </svg>`;
  downloadFile(
    svg,
    "image/svg+xml;charset=utf-8",
    "aziz-and-rahma-keepsake.svg",
  );
  showToast("A little memory, yours to keep. ♥");
});

// The requested song is embedded from its official YouTube upload.
const SONG_ID = "MlThQTo6D8A";
let youtubePlayer;
let musicReady = false;
let musicDesired = true;

function updateSoundButton() {
  $("#soundToggle").setAttribute("aria-pressed", String(musicDesired));
  $("#soundToggle").setAttribute(
    "aria-label",
    musicDesired ? "Turn off Until I Found You" : "Turn on Until I Found You",
  );
  $("#soundLabel").textContent = musicDesired ? "Music on" : "Music off";
}

function startOfficialTrack() {
  if (!musicDesired || !musicReady || !youtubePlayer) return;
  youtubePlayer.setVolume(45);
  youtubePlayer.unMute();
  youtubePlayer.playVideo();
  $("#musicStatus").textContent =
    "Now playing: Until I Found You · Stephen Sanchez";
}

window.onYouTubeIframeAPIReady = () => {
  youtubePlayer = new window.YT.Player("youtubePlayer", {
    width: "100%",
    height: "240",
    videoId: SONG_ID,
    playerVars: { controls: 1, playsinline: 1, rel: 0, loop: 1, playlist: SONG_ID },
    events: {
      onReady: (event) => {
        musicReady = true;
        event.target.setVolume(45);
        $("#musicStatus").textContent = opened
          ? "Our song is ready."
          : "Music starts when you open the letter.";
        if (opened && musicDesired) startOfficialTrack();
      },
      onStateChange: (event) => {
        if (event.data === window.YT.PlayerState.PLAYING)
          $("#musicStatus").textContent =
            "Now playing: Until I Found You · Stephen Sanchez";
      },
      onError: () => {
        $("#musicStatus").textContent = "Use the official audio link above.";
      },
    },
  });
};
const youtubeApi = document.createElement("script");
youtubeApi.src = "https://www.youtube.com/iframe_api";
youtubeApi.async = true;
document.head.append(youtubeApi);

$("#soundToggle").addEventListener("click", () => {
  musicDesired = !musicDesired;
  updateSoundButton();
  if (!musicReady || !youtubePlayer) return;
  if (musicDesired) startOfficialTrack();
  else {
    youtubePlayer.pauseVideo();
    $("#musicStatus").textContent = "Our song is paused.";
  }
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) updateCountdown();
  if (!musicReady || !youtubePlayer || !musicDesired) return;
  if (document.hidden) youtubePlayer.pauseVideo();
  else if (opened) startOfficialTrack();
});
