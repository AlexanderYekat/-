const productList = document.getElementById('productList');
const productDetails = document.getElementById('productDetails');
const productInfo = document.getElementById('productInfo');
const expandedGroups = {};
let inputBuffer = '';

function handleKeyboardInput(input) {
    const [code, quantity] = input.split('*');
    const item = data.find(item => item.code === code);
    if (item) {
        //showProductDetails(item, parseInt(quantity) || 1);
        alert('Товар найден');
        addProductRow(item, parseInt(quantity))
    } else {
        alert('Товар не найден');
    }
}

function updateInputDisplay() {
    currentInput.textContent = inputBuffer;
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && inputBuffer) {
        handleKeyboardInput(inputBuffer);
        inputBuffer = '';
        currentInput.textContent = '';
    } else if (event.key === 'Escape') {
        inputBuffer = '';
        currentInput.textContent = '';
    } else if (event.key === 'Backspace') {
        inputBuffer = inputBuffer.slice(0, -1);                
    } else if (!event.ctrlKey && !event.altKey && !event.metaKey && event.key.length === 1) {
        inputBuffer += event.key;
        currentInput.textContent = inputBuffer;
    }
    updateInputDisplay();
});        

console.log('Hello, World!');
let data = [];
fetch('./data')
    .then(response => response.json())
    .then(jsonData => {
        data = jsonData;
        console.log(jsonData);
        //renderProductList();
    });        

    function addProductRow(item, quantity) {    
        const cardArtcAndCode = document.getElementById('currentGoodArticleAndCode');
        const cardName = document.getElementById('currentGoodName');
        const cardPriceCountSumm= document.getElementById('currentCountPriceSumm');


        //cardName.innerHTML = `<p id="currentGoodName"><strong>${item.name}</strong></p>`
        const table = document.querySelector('.table-container tbody');
        const rowCount = table.rows.length + 1;
        const productPrice = parseFloat(item.price)
        const productTotal = quantity * productPrice;
    
        cardArtcAndCode.TextContent = item.code
        cardName.textContent = item.name
        cardPriceCountSumm.TextContent = quantity.toFixed(3) + " x " + productPrice.toFixed(2) + " = " + productTotal.toFixed(2)

        const newRow = table.insertRow();
        newRow.innerHTML = `
            <td>${rowCount}</td>
            <td>${item.name}</td>
            <td>${quantity.toFixed(3)}</td>
            <td>${productPrice.toFixed(2)}</td>
            <td>${productTotal.toFixed(2)}</td>
        `;    
    }
    