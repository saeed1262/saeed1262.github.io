(function() {
  const palettes = [null, 'palette-purple', 'palette-green', 'palette-red'];
  const choice = palettes[Math.floor(Math.random() * palettes.length)];
  if (choice) {
    document.documentElement.classList.add(choice);
  }
})();

