# Aziz & Rahma engagement invitation

A personal, interactive engagement invitation for **19 September 2026, 6 PM**, at **Viola Hall, Port Said**.

The design is "A very lovely plot twist": blush roses, burgundy satin ribbons, cream stationery, and handwritten notes. Everything runs as static HTML, CSS, and JavaScript; no build or account is needed.

## Preview

Open `index.html` directly, or start a local server:

```sh
python -m http.server 4173 --bind 127.0.0.1
```

Then visit <http://localhost:4173> on the computer running the server. A localhost link is not a public sharing link.

## The experience

1. Tap the envelope or pull its ribbon to reveal the invitation. The opening also works with a keyboard.
2. Read the love note and find the date circled on a September calendar. Download the calendar event or open a Google Maps venue search.
3. Try the No button: it escapes five times without covering Yes, then changes into "Okay, yes". Reduced-motion users receive the same playful messages without the movement.
4. Say Yes to reveal falling petals and a downloadable SVG keepsake ticket. Replay the joke or reseal the letter from the footer.
5. Music is on by default and begins after the guest opens the letter, which supplies the interaction browsers require for audible playback. The top-right control pauses or resumes it.

## Behavior and limitations

- The final question is a playful interaction, **not an attendance collection service**. No names, responses, or analytics are submitted or stored. Refreshing resets the experience.
- The map is a search for "Viola Hall, Port Said", not a verified venue pin.
- Countdown and calendar use `2026-09-19T15:00:00Z`, corresponding to the displayed 6 PM Cairo time. No end time has been invented. The calendar uses CRLF lines, escaped location punctuation, and a generated creation timestamp.
- All event details remain readable without JavaScript. Fonts load from Google Fonts, with local serif, cursive, and sans-serif fallbacks. Artwork is included locally.
- “Until I Found You” plays through Stephen Sanchez's official YouTube audio embed. The song is not copied into this repository. Playback therefore needs an internet connection and remains subject to the guest's browser autoplay and YouTube availability settings.
- Background artwork and the complete generation prompt are documented in [assets/README.md](assets/README.md). Bows, hearts, the calendar, and the keepsake are code-native graphics.

## Verification

Run `node --check script.js` and `git diff --check`. Browser checks cover the opening and replay, actual mouse/touch dodging, Yes and converted-No acceptance, keyboard and reduced-motion behavior, downloads, music controls, countdown boundaries, and horizontal overflow at 320, 390, 768, 1024, and 1440 pixels.

There is no backend or backend test suite. Publishing to a public URL is a separate step.
