const setup = () => {
    let firstCard = undefined;
    let secondCard = undefined;
    let clicks = 0;
    let pairsLeft = 0;
    let pairsMatched = 0;
    let totalPairs = 0;
    let timer;
    let countdown;
    let isBoardLocked = false;
  
    const difficultySettings = {
      easy: { pairs: 3, timeLimit: 60 },
      medium: { pairs: 6, timeLimit: 45 },
      hard: { pairs: 9, timeLimit: 30 }
    };
  
    const updateStatus = () => {
      $("#clicks").text(clicks);
      $("#pairs_left").text(pairsLeft);
      $("#pairs_matched").text(pairsMatched);
      $("#total_pairs").text(totalPairs);
    };
  
    const updateTimerDisplay = (time) => {
      $("#timer").text(time);
    };
  
    const startGame = () => {
      let difficulty = $("#difficulty_selector").val();
      totalPairs = difficultySettings[difficulty].pairs;
      pairsLeft = totalPairs;
      pairsMatched = 0;
      clicks = 0;
      updateStatus();
      $("#game_grid").empty();
      loadPokemons(totalPairs);
  
      clearTimeout(timer);
      clearInterval(countdown);
  
      let timeLeft = difficultySettings[difficulty].timeLimit;
      updateTimerDisplay(timeLeft);
  
      countdown = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(countdown);
          alert('Time up! You lost!');
          resetGame();
        }
      }, 1000);
  
      timer = setTimeout(() => {
        clearInterval(countdown);
        alert('Time up! You lost!');
        resetGame();
      }, difficultySettings[difficulty].timeLimit * 1000);
    };
  
    const resetGame = () => {
      clearTimeout(timer);
      clearInterval(countdown);
      firstCard = undefined;
      secondCard = undefined;
      pairsLeft = 0;
      pairsMatched = 0;
      totalPairs = 0;
      clicks = 0;
      updateStatus();
      updateTimerDisplay(0);
      $("#game_grid").empty();
    };
  
    const loadPokemons = async (numPairs) => {
      let pokemonIds = [];
      while (pokemonIds.length < numPairs) {
        let id = Math.floor(Math.random() * 898) + 1;
        if (!pokemonIds.includes(id)) {
          pokemonIds.push(id);
        }
      }
  
      let pokemons = await Promise.all(pokemonIds.map(id => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json())));
      let cards = [...pokemons, ...pokemons].sort(() => 0.5 - Math.random());
      let totalCards = cards.length;
      let columns = Math.ceil(Math.sqrt(totalCards));
      $("#game_grid").css("grid-template-columns", `repeat(${columns}, 1fr)`);
  
      cards.forEach((pokemon, index) => {
        $("#game_grid").append(
          `<div class="card">
            <img id="img${index}" class="front_face" src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <img class="back_face" src="back.webp" alt="back">
          </div>`
        );
      });
      bindCardClickEvents();
    };
  
    const bindCardClickEvents = () => {
      $(".card").on("click", handleCardClick);
    };
  
    const handleCardClick = function () {
      if (isBoardLocked) return;
  
      $(this).toggleClass("flip");
      clicks++;
      updateStatus();
  
      if (!firstCard) {
        firstCard = $(this).find(".front_face")[0];
        $(this).off("click");
      } else {
        secondCard = $(this).find(".front_face")[0];
        $(this).off("click");
        checkForMatch();
      }
    };
  
    const checkForMatch = () => {
      if (firstCard.src === secondCard.src) {
        pairsMatched++;
        pairsLeft--;
        resetCards();
        if (pairsLeft === 0) {
          setTimeout(() => {
            alert('Congratulations! You won!');
            clearTimeout(timer);
            clearInterval(countdown);
          }, 500);
        }
      } else {
        isBoardLocked = true;
        setTimeout(() => {
          $(`#${firstCard.id}`).parent().toggleClass("flip").on("click", handleCardClick);
          $(`#${secondCard.id}`).parent().toggleClass("flip").on("click", handleCardClick);
          resetCards();
        }, 1000);
      }
      updateStatus();
    };
  
    const resetCards = () => {
      firstCard = undefined;
      secondCard = undefined;
      isBoardLocked = false;
    };
  
    const toggleTheme = () => {
      let theme = $("#theme_selector").val();
      $("body").removeClass("light-theme dark-theme").addClass(`${theme}-theme`);
    };
  
    const powerUp = () => {
      $(".card").addClass("flip");
      setTimeout(() => $(".card").removeClass("flip"), 2000);
    };
  
    $("#start_button").on("click", startGame);
    $("#reset_button").on("click", resetGame);
    $("#power_up_button").on("click", powerUp);
    $("#theme_selector").on("change", toggleTheme);
  
    resetGame();
  };
  
  $(document).ready(setup);
  