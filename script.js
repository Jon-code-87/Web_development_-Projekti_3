$(function () {
  const $gameTableBody = $("#gameTableBody");
  const $searchInput = $("#searchInput");
  const $platformSelect = $("#platformSelect");
  const $genreSelect = $("#genreSelect");
  const $searchBtn = $("#searchBtn");

  async function fetchGames() {
    const platform = $platformSelect.val();
    const genre = $genreSelect.val();
    const searchTerm = $searchInput.val().trim().toLowerCase();

    // Rakennetaan API-osoite valintojen mukaan
    let url = "https://www.freetogame.com/api/games";
    const params = [];

    if (platform && platform !== "all") {
      params.push(`platform=${platform}`);
    }
    if (genre) {
      params.push(`category=${genre}`);
    }
    if (params.length > 0) {
      url += "?" + params.join("&");
    }

    // DOM-päivitys: latausviesti
    $gameTableBody.html(`<tr><td colspan="5">Haetaan pelejä...</td></tr>`);

    try {
      // AJAX-pyyntö jQueryllä
      let games = await $.ajax({
        url: url,
        method: "GET",
        dataType: "json"
      });

      // Suodatetaan tekstikentän perusteella (pelin nimi)
      if (searchTerm !== "") {
        games = games.filter(game =>
          game.title && game.title.toLowerCase().includes(searchTerm)
        );
      }

      // Järjestetään pelit julkaisupäivän mukaan uusimmasta vanhimpaan
      games.sort((a, b) => {
        if (!a.release_date) return 1;
        if (!b.release_date) return -1;
        return new Date(b.release_date) - new Date(a.release_date);
      });

      // Otetaan 50 uusinta hakutuloksista
      const latestGames = games.slice(0, 50);

      // Tyhjennetään taulukko jQueryllä
      $gameTableBody.empty();

      if (latestGames.length === 0) {
        $gameTableBody.html(`<tr><td colspan="5">Hakuehdoilla ei löytynyt pelejä.</td></tr>`);
        return;
      }

      // Luodaan ja lisätään rivit DOMiin jQueryllä
      $.each(latestGames, function (_, game) {
        let formattedDate = "-";
        if (game.release_date) {
          const releaseDate = new Date(game.release_date);
          formattedDate = releaseDate.toLocaleDateString("fi-FI", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          });
        }

        const $row = $("<tr></tr>");
        const $imgCell = $("<td></td>").append(
          $("<img>", {
            src: game.thumbnail,
            alt: game.title,
            width: 100
          })
        );
        const $titleCell = $("<td></td>").append(
          $("<a>", {
            href: game.game_url,
            target: "_blank",
            text: game.title
          })
        );
        const $genreCell = $("<td></td>").text(game.genre || "-");
        const $devCell = $("<td></td>").text(game.developer || "-");
        const $dateCell = $("<td></td>").text(formattedDate);

        $row.append($imgCell, $titleCell, $genreCell, $devCell, $dateCell);
        $gameTableBody.append($row);
      });

      // Kevyt jQuery-efekti riveille
      $gameTableBody.find("tr").hide().fadeIn(200);
    } catch (error) {
      console.error("Virhe haettaessa pelejä:", error);
      $gameTableBody.html(`<tr><td colspan="5">Tietojen hakeminen epäonnistui.</td></tr>`);
    }
  }

  // Kuuntelijat jQueryllä
  $searchBtn.on("click", fetchGames);

  $platformSelect.on("change", fetchGames);
  $genreSelect.on("change", fetchGames);

  $searchInput.on("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      fetchGames();
    }
  });

  // Delegoidulla kuuntelijalla korostetaan klikattu rivi
  $gameTableBody.on("click", "tr", function (event) {
    if ($(event.target).is("a")) return;
    $(this).toggleClass("valittu-rivi");
  });

  // Ensihaku sivun latautuessa
  fetchGames();
});