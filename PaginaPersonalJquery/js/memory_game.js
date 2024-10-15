let moveCount = 0;
let timerInterval;
let incrementTimerInterval;
let gameStarted = false;
let timeElapsed = 0;
let currentLevel = null;
let firstCard = null;
let secondCard = null;
let blockClicks = false;
let reveals = [];
let timeLeft=0;
$(document).ready(function () {
    $('#level-selection-message').show();
    $('#game-board').hide(); 
    $('#timer').hide();

    $('.level-button').on('click', function () {
        const audioElement = document.getElementById('epic-music');
        firstCard = null;
        secondCard = null;
        blockClicks = false;
        reveals = [];

        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
        }
        const level = $(this).data('level');
        currentLevel = level; 
        moveCount = 0;
        timeElapsed = 0;
        $('#move-counter').text(moveCount);
        $('#time-elapsed').text('Tiempo: 0 segundos'); 
        clearInterval(timerInterval);
        clearInterval(incrementTimerInterval);
        $('#timer').hide();
        $('#game-end').hide(); 
        $('#level-selection-message').hide(); 
        $('#game-board').show(); 
        gameStarted = false;
        init(level);
        resetColors();
        highlightSelectedLevel($(this)); 

        if ($(this).hasClass('hardcore')) {
            startTimer(30); 
            $('#timer').show();
            applyHardcoreColors(); 
        } else {
            startIncrementTimer(); 
            $('#timer').show();
        }
    });

    $('#game-end button').on('click', function () {
        location.reload(); 
    });

    function random(limit) {
        return Math.floor(Math.random() * limit);
    }

    function initial_cards(n) {
        let cardValues = new Array(n).fill(0).map((_, i) => Math.floor(i / 2) + 1);
        cardValues.forEach((_, i) => {
            let randomIndex = random(cardValues.length);
            [cardValues[i], cardValues[randomIndex]] = [cardValues[randomIndex], cardValues[i]];
        });
        return cardValues;
    }
    
    function generateCardImages(n) {
        const cardImages = {};
        for (let i = 1; i <= n / 2; i++) {
            cardImages[i] = `./fotos/memory/card${i}.svg`;
        }
        return cardImages;
    }

    function hide_card($cardElement) {
        $cardElement.addClass('logo-reverso');
        $cardElement.find('.shape').addClass('hidden');
    }

    function reveal_card($cellElement) {
        if (!gameStarted) {
            gameStarted = true;
        }

        const $cardElement = $cellElement.find('.shape');

        if (reveals.includes($cardElement[0]) || blockClicks || $cardElement[0] === firstCard || $cardElement[0] === secondCard) {
            return;
        }

        $cellElement.removeClass('logo-reverso');
        $cardElement.removeClass('hidden');

        if (!firstCard) {
            firstCard = $cardElement[0];
        } else if (!secondCard) {
            secondCard = $cardElement[0];
            blockClicks = true;

            const firstCardValue = $(firstCard).attr('alt');
            const secondCardValue = $(secondCard).attr('alt');

            moveCount++;
            $('#move-counter').text(moveCount);

            if (firstCardValue === secondCardValue) {
                reveals.push(firstCard, secondCard);
                firstCard = null;
                secondCard = null;
                blockClicks = false;

                if (reveals.length === $('.shape').length) {
                    endGame();
                }
            } else {
                setTimeout(() => {
                    hide_card($(firstCard).closest('.cell'));
                    hide_card($(secondCard).closest('.cell'));
                    firstCard = null;
                    secondCard = null;
                    blockClicks = false;
                }, 1000);
            }
        }
    }

    function init(n) {
        const cardImages = generateCardImages(n);
        const $gameBoard = $('#game-board');
        let shuffledCards = initial_cards(n);
        let rows = n / 4;
        let htmlContent = '';

        for (let i = 0; i < rows; i++) {
            htmlContent += '<tr>';
            for (let j = 0; j < 4; j++) {
                let cardValue = shuffledCards[i * 4 + j];
                htmlContent += `
                    <td class="cell logo-reverso">
                        <img src="${cardImages[cardValue]}" alt="figure${cardValue}" class="shape hidden" />
                    </td>
                `;
            }
            htmlContent += '</tr>';
        }
        $gameBoard.html(htmlContent);

        $('.cell').on('click', function () {
            reveal_card($(this));
        });
    }

    function startTimer(duration) {
        timeLeft = duration; 
        $('#time-elapsed').text(`Tiempo restante: ${timeLeft} segundos`);
    
        const audioElement = document.getElementById('epic-music');
        audioElement.play();
        audioElement.playbackRate = 1;
    
        timerInterval = setInterval(function () {
            timeLeft--;
            $('#time-elapsed').text(`Tiempo restante: ${timeLeft} segundos`);
    
            if (timeLeft > 10) {
                audioElement.playbackRate +=0.02 ; 
            }
            if (timeLeft <= 10) {
                audioElement.playbackRate +=0.15 ; 
            }
            if (timeLeft <= 5) {
                audioElement.playbackRate += 0.5; 
            }
    
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                const explosionSound = document.getElementById('explosion-sound');
                explosionSound.play();
                audioElement.pause();
                showEndMessage('¡Se acabó el tiempo! Inténtalo de nuevo.', 0, "restante");
            }
        }, 1000);
    }
    
    function applyHardcoreColors() {
        $('body').css('background-color', '#8B0000');
        $('.cell').css('background-color', '#ff4d4d').css('color', '#ffffff');
    }

    function resetColors() {
        $('body').css('background-color', '#2b2b2b');
        $('.cell').css('background-color', '#b6edcf').css('color', '#393939');
        $('.level-button').css('background-color', ''); 
    }

    function startIncrementTimer() {
        timeElapsed = 0;
        $('#time-elapsed').text(`Tiempo: ${timeElapsed} segundos`);

        incrementTimerInterval = setInterval(function () {
            timeElapsed++;
            $('#time-elapsed').text(`Tiempo: ${timeElapsed} segundos`);
        }, 1000);
    }

    function endGame() {
        clearInterval(timerInterval);
        clearInterval(incrementTimerInterval);
    
        let audioElement = document.getElementById('epic-music');
        audioElement.pause();
    
        let message = "¡Has completado el juego!";
        if (currentLevel === 16 && $('.level-button.hardcore').css('background-color') === 'rgb(230, 0, 0)') {
            showEndMessage(message, timeLeft, "restante");
        } else {
            showEndMessage(message, timeElapsed, "");
        }
    }

    function showEndMessage(message, time, hardcore) {
        $('#game-end-message').text(`${message}`);
        $('#game-end-time').text(`Tiempo ${hardcore}: ${time} segundos`);
        $('#game-end-moves').text(`Movimientos: ${moveCount}`);
        $('#game-end').show();
    }

    function highlightSelectedLevel($button) {
        $('.level-button').css('background-color', ''); 
        if ($button.hasClass('hardcore')) {
            $button.css('background-color', '#e60000'); 
        } else {
            $button.css('background-color', '#28a745'); 
        }
    }
});
