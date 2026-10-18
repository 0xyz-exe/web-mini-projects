# Password Generator

Secure password generator using Web Crypto API with customizable options.

## Features

- Crypto-secure random generation (crypto.getRandomValues)
- Customizable length (8-64 characters)
- Character type options (uppercase, lowercase, numbers, symbols)
- Real-time strength indicator
- Copy to clipboard
- Dark/light theme
- No password storage or transmission

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Web Crypto API

## How to Run

Open `index.html` in a web browser.

## Security

Uses `crypto.getRandomValues()` for cryptographically secure random number generation. Generated passwords are never stored or transmitted.
