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

function hide_card(cardElement) {
    cardElement.classList.add('hidden');
}

function reveal_card(cardElement) {
    if (reveals.includes(cardElement) || blockClicks || cardElement === firstCard || cardElement === secondCard) {
        return;
    }

    cardElement.classList.remove('hidden');

    if (!firstCard) {
        firstCard = cardElement;
    } else if (!secondCard) {
        secondCard = cardElement;
        blockClicks = true;

        const firstCardValue = firstCard.getAttribute('alt');
        const secondCardValue = secondCard.getAttribute('alt');

        if (firstCardValue === secondCardValue) {
            reveals.push(firstCard, secondCard);
            firstCard = null;
            secondCard = null;
            blockClicks = false;
        } else {
            setTimeout(() => {
                hide_card(firstCard);
                hide_card(secondCard);
                firstCard = null;
                secondCard = null;
                blockClicks = false;
            }, 1000);
        }
    }
}

function init(n) {
    const cardImages = generateCardImages(n);
    const gameBoard = document.getElementById('game-board');
    let shuffledCards = initial_cards(n);
    let rows = n / 4;
    let htmlContent = '';

    for (let i = 0; i < rows; i++) {
        htmlContent += '<tr>';
        for (let j = 0; j < 4; j++) {
            let cardValue = shuffledCards[i * 4 + j];
            htmlContent += `
                <td class="cell">
                    <img src="${cardImages[cardValue]}" alt="figure${cardValue}" class="shape hidden" onclick="reveal_card(this)" />
                </td>
            `;
        }
        htmlContent += '</tr>';
    }
    gameBoard.innerHTML = htmlContent;
}
