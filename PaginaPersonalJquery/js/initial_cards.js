$(document).ready(function () {
    init(12);  

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

            if (firstCardValue === secondCardValue) {
                reveals.push(firstCard, secondCard);
                firstCard = null;
                secondCard = null;
                blockClicks = false;
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

        
        $('.cell').on('click', function () {
            reveal_card($(this));
        });
    }
});
