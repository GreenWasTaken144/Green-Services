const usernameInput = document.getElementById("chess-username");
const fetchButton = document.getElementById("fetch-chess-stats");
const screenshotButton = document.getElementById("screenshot-chess-stats");
const results = document.getElementById("chess-stats-results");

fetchButton.addEventListener("click", async () => {
  const username = usernameInput.value.trim();

  if (!username) {
    alert("Please enter a Chess.com username.");
    return;
  }

  results.replaceChildren();

  const loadingCard = document.createElement("div");
  loadingCard.className = "linkcard";
  loadingCard.textContent = "Fetching stats...";
  results.appendChild(loadingCard);

  try {
    const response = await fetch(
      `https://api.chess.com/pub/player/${encodeURIComponent(username)}/stats`
    );

    if (!response.ok) {
      throw new Error("Could not find that player.");
    }

    const data = await response.json();

    results.replaceChildren();

    const stats = [
      ["Daily", data.chess_daily?.last?.rating],
      ["Rapid", data.chess_rapid?.last?.rating],
      ["Blitz", data.chess_blitz?.last?.rating],
      ["Bullet", data.chess_bullet?.last?.rating],
      ["Tactics", data.tactics?.highest?.rating],
      ["Puzzle Rush", data.puzzle_rush?.best?.score],
      ["FIDE", data.fide]
    ];

    stats.forEach(([name, value]) => {
      if (value == null) {
        return;
      }

      const card = document.createElement("div");
      card.className = "linkcard";

      const title = document.createElement("h2");
      title.textContent = `${name} Rating`;

      const rating = document.createElement("p");
      rating.textContent = value;

      card.append(title, rating);
      results.appendChild(card);
    });

    if (results.children.length === 0) {
      results.textContent = "No stats were available for this player.";
    }
  } catch (error) {
    results.replaceChildren();

    const errorCard = document.createElement("div");
    errorCard.className = "linkcard";
    errorCard.textContent =
      "Failed to fetch stats. Check the username and try again.";

    results.appendChild(errorCard);
    console.error(error);
  }
});


screenshotButton.addEventListener("click", async () => {
  if (results.children.length === 0) {
    alert("Fetch some stats before taking a screenshot.");
    return;
  }

  try {
    const canvas = await html2canvas(results, {
      backgroundColor: "#1a1a1a",
      scale: 2
    });

    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, "image/png");
    });

    if (!blob) {
      throw new Error("Could not create the screenshot image.");
    }

    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": blob
      })
    ]);

    // Download the same screenshot.
    const imageUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");

    downloadLink.href = imageUrl;
    downloadLink.download = "chess-stats.png";
    downloadLink.click();

    URL.revokeObjectURL(imageUrl);

    alert("Screenshot copied and downloaded!");
  } catch (error) {
    console.error(error);
    alert(
      "Screenshot failed. Check clipboard permissions and make sure the site uses HTTPS or localhost."
    );
  }
});
