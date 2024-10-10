let moveCount = 0;
let timerInterval;
let incrementTimerInterval;
let gameStarted = false;
let timeElapsed = 0;
let currentLevel = null; // Sin nivel inicial seleccionado

$(document).ready(function () {
    // Mostrar el mensaje de selección de nivel al inicio
    $('#level-selection-message').show();
    $('#game-board').hide(); // Ocultar el tablero al inicio
    $('#timer').hide();

    // Manejar los clics en los botones de nivel
    $('.level-button').on('click', function () {
        const level = $(this).data('level');
        currentLevel = level; // Actualizar el nivel actual
        moveCount = 0;
        timeElapsed = 0;
        $('#move-counter').text(moveCount);
        $('#time-elapsed').text('Tiempo: 0 segundos'); // Reiniciar el temporizador
        clearInterval(timerInterval);
        clearInterval(incrementTimerInterval);
        $('#timer').hide();
        $('#game-end').hide(); // Ocultar el recuadro de finalización al comenzar un nuevo juego
        $('#level-selection-message').hide(); // Ocultar el mensaje de selección de nivel
        $('#game-board').show(); // Mostrar el tablero de juego
        gameStarted = false;
        init(level);

        // Restablecer los colores al seleccionar cualquier nivel
        resetColors();
        highlightSelectedLevel($(this)); // Resaltar el nivel seleccionado

        if ($(this).hasClass('hardcore')) {
            startTimer(60); // Temporizador regresivo para el nivel Hardcore
            $('#timer').show();
            applyHardcoreColors(); // Cambiar los colores para el nivel Hardcore
        } else {
            startIncrementTimer(); // Temporizador ascendente para otros niveles
            $('#timer').show();
        }
    });

    // Manejar el botón "Volver a Intentar"
    $('#game-end button').on('click', function () {
        moveCount = 0;
        timeElapsed = 0;
        $('#move-counter').text(moveCount);
        $('#time-elapsed').text('Tiempo: 0 segundos');
        clearInterval(timerInterval);
        clearInterval(incrementTimerInterval);
        $('#game-end').hide();
        gameStarted = false;
        currentLevel = null; // Restablecer el nivel actual
        $('#level-selection-message').show(); // Mostrar el mensaje de selección de nivel
        $('#game-board').hide(); // Ocultar el tablero de juego
        resetColors(); // Restablecer los colores
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

    let firstCard = null;
    let secondCard = null;
    let blockClicks = false;
    let reveals = [];

    function hide_card($cardElement) {
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

        $cardElement.removeClass('hidden');

        if (!firstCard) {
            firstCard = $cardElement[0];
        } else if (!secondCard) {
            secondCard = $cardElement[0];
            blockClicks = true;

            const firstCardValue = $(firstCard).attr('alt');
            const secondCardValue = $(secondCard).attr('alt');

            // Incrementar el contador de movimientos
            moveCount++;
            $('#move-counter').text(moveCount);

            if (firstCardValue === secondCardValue) {
                reveals.push(firstCard, secondCard);
                firstCard = null;
                secondCard = null;
                blockClicks = false;

                // Verificar si el juego ha terminado
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
                    <td class="cell">
                        <img src="${cardImages[cardValue]}" alt="figure${cardValue}" class="shape hidden" />
                    </td>
                `;
            }
            htmlContent += '</tr>';
        }
        $gameBoard.html(htmlContent);

        // Agregar evento de clic a las celdas
        $('.cell').on('click', function () {
            reveal_card($(this));
        });
    }

    function startTimer(duration) {
        let timeLeft = duration;
        $('#time-elapsed').text(`Tiempo restante: ${timeLeft} segundos`);

        timerInterval = setInterval(function () {
            timeLeft--;
            $('#time-elapsed').text(`Tiempo restante: ${timeLeft} segundos`);

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                showEndMessage('¡Se acabó el tiempo! Inténtalo de nuevo.', 0,"restante");
                
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
        $('.level-button').css('background-color', ''); // Quitar el color de selección
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

        let message = "¡Has completado el juego!";
        if (currentLevel === 16 && $('.level-button.hardcore').css('background-color') === 'rgb(230, 0, 0)') {
            const timeLeft = parseInt($('#time-elapsed').text().replace('Tiempo: ', '').replace(' segundos', ''));
            
            showEndMessage(message, 60-timeLeft, "restante")
        }
        else{
            showEndMessage(message, timeElapsed,"");
        }

       
    }

    function showEndMessage(message, time, hardcore) {
        $('#game-end-message').text(`${message}`);
        $('#game-end-time').text(`Tiempo ${hardcore}: ${time} segundos`);
        $('#game-end-moves').text(`Movimientos: ${moveCount}`);
        $('#game-end').show();
    }

    function highlightSelectedLevel($button) {
        $('.level-button').css('background-color', ''); // Limpiar el fondo de todos los botones
        if ($button.hasClass('hardcore')) {
            $button.css('background-color', '#e60000'); // Rojo fuerte para "Hardcore"
        } else {
            $button.css('background-color', '#28a745'); // Verde fuerte para otros niveles
        }
    }
});
