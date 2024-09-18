const productList = document.getElementById('productList');
const productDetails = document.getElementById('productDetails');
const productInfo = document.getElementById('productInfo');
const expandedGroups = {};
let inputBuffer = '';

function updateCurrentItemInfo(item, quantity) {
    const currentGoodArticleAndCode = document.getElementById('currentGoodArticleAndCode');
    const currentGoodName = document.getElementById('currentGoodName');
    const currentCountPriceSumm = document.getElementById('currentCountPriceSumm');

    // Проверяем, что item существует и является объектом
    if (item && typeof item === 'object') {
        currentGoodArticleAndCode.textContent = `Арт.: ${item.article || '-'} | Код: ${item.code || '-'}`;
        currentGoodName.innerHTML = `<strong>${item.name || 'Нет названия'}</strong>`;

        // Проверяем, что цена и количество являются числами
        const priceFloat = parseFloat(item.price) || 0;
        const quantityFloat = parseFloat(quantity) || 0;

        currentCountPriceSumm.textContent = `${quantityFloat.toFixed(3)} x ${priceFloat.toFixed(2)} = ${(priceFloat * quantityFloat).toFixed(2)}`;
    } else {
        // Если item не определен или не является объектом, очищаем поля
        currentGoodArticleAndCode.textContent = 'Арт.: - | Код: -';
        currentGoodName.innerHTML = '<strong>Товар не выбран</strong>';
        currentCountPriceSumm.textContent = '0 x 0.00 = 0.00';
    }
}

function handleRowSelection(row) {
    // Получаем данные из выделенной строки
    const cells = row.cells;
    const rowData = {
        number: cells[0].textContent,
        code: cells[1].textContent,
        article: cells[2].textContent,
        name: cells[3].textContent,
        quantity: cells[4].textContent,
        price: parseFloat(cells[5].textContent),
        total: cells[6].textContent
    };

    // Обновляем информацию в карточке "Текущий товар"
    updateCurrentItemInfo(rowData, rowData.quantity)

    // Выводим информацию в консоль (для демонстрации)
    console.log('Выбрана строка:', rowData);
}

document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('productTable');
    let selectedRow = null;

    table.addEventListener('click', function (e) {
        const target = e.target.closest('tr');
        if (!target) return; // Клик был не на строке таблицы

        const allRows = document.querySelectorAll('#productTable tbody tr');
        allRows.forEach(r => r.classList.remove('selected'));
        if (selectedRow) {
            selectedRow.classList.remove('selected');
        }

        target.classList.add('selected');
        selectedRow = target;

        // Сохраняем индекс выбранной строки
        const rowIndex = Array.from(table.rows).indexOf(target);
        localStorage.setItem('selectedRowIndex', rowIndex.toString());

        // Вызываем функцию-обработчик выделения строки
        handleRowSelection(target);
    });

    // Восстанавливаем выбранную строку при загрузке страницы
    const savedRowIndex = localStorage.getItem('selectedRowIndex');
    if (savedRowIndex !== null) {
        const rowToSelect = table.rows[parseInt(savedRowIndex)];
        if (rowToSelect) {
            rowToSelect.classList.add('selected');
            selectedRow = rowToSelect;
            handleRowSelection(rowToSelect);
        }
    }
});

// Функция для сохранения данных
function saveData() {
    const tableData = Array.from(document.querySelector('table tbody').rows).map(row => ({
        code: row.cells[1].textContent,
        article: row.cells[2].textContent,
        name: row.cells[3].textContent,
        quantity: row.cells[4].textContent,
        price: row.cells[5].textContent,
        sum: row.cells[6].textContent
    }));

    const employeeSelect = document.getElementById('employee');
    const masterSelect = document.getElementById('master');

    localStorage.setItem('tableData', JSON.stringify(tableData));
    localStorage.setItem('selectedEmployee', employeeSelect.value);
    localStorage.setItem('selectedMaster', masterSelect.value);

    // Сохраняем индекс выбранной строки, если есть выбранная строка
    const selectedRow = document.querySelector('table tbody tr.selected');
    if (selectedRow) {
        const rowIndex = Array.from(document.querySelector('table tbody').rows).indexOf(selectedRow);
        localStorage.setItem('selectedRowIndex', rowIndex.toString());
    } else {
        // Если нет выбранной строки, удаляем сохраненный индекс
        localStorage.removeItem('selectedRowIndex');
    }
}

// Функция для загрузки данных
function loadData() {
    const tableData = JSON.parse(localStorage.getItem('tableData')) || [];
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';

    tableData.forEach((item, index) => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = index + 1;
        row.insertCell(1).textContent = item.code;
        row.insertCell(2).textContent = item.article;
        row.insertCell(3).textContent = item.name;
        row.insertCell(4).textContent = item.quantity;
        row.insertCell(5).textContent = item.price;
        row.insertCell(6).textContent = item.sum;
    });

    updateTotal();

    // Восстанавливаем выбранную строку
    const savedRowIndex = localStorage.getItem('selectedRowIndex');
    if (savedRowIndex !== null) {
        const rowToSelect = tbody.rows[parseInt(savedRowIndex)];
        if (rowToSelect) {
            rowToSelect.classList.add('selected');
            selectedRow = rowToSelect;
            handleRowSelection(rowToSelect);
        }
    }

    if (tableData.length > 0) {
        updateCurrentItemInfo(tableData[tableData.length - 1], tableData[tableData.length - 1].quantity);
    }
}

// Функция для очистки данных
function clearData() {
    localStorage.removeItem('tableData');
    localStorage.removeItem('selectedEmployee');
    localStorage.removeItem('selectedMaster');
    localStorage.removeItem('selectedRowIndex');
    document.querySelector('table tbody').innerHTML = '';
    document.getElementById('employee').value = '';
    document.getElementById('master').value = '';
    updateTotal();
    updateCurrentItemInfo({}, 0);
}


function handleKeyboardInput(input) {
    const [code, quantity] = input.split('*');
    fetchProductByCode(code, parseInt(quantity) || 1);
}

function fetchProductByCode(code, quantity) {
    console.log(code)
    fetch(`/api/product/${code}`)
        .then(response => {
            if (response.status === 404) {
                // Обработка ответа 404 (Не найдено)
                throw new Error('Товар не найден');
            }
            return response.json();
        })
        .then(item => {
            console.log(item)
            if (item && !item.isGroup) {
                addProductRow(item, quantity);
            } else {
                showNotification('Товар не найден или является группой', 'error');
                alert('Товар является группой');
            }
        })
        .catch(error => {
            console.error('Ошибка при поиске товара:', error);
            showNotification(error.message || 'Произошла ошибка при поиске товара', 'error');
            alert(error.message || 'Произошла ошибка при поиске товара');
        });
}

function updateInputDisplay() {
    currentInput.textContent = inputBuffer;
}

// Обработчик клавиши F11
document.addEventListener('keydown', function(event) {
    if (event.key === 'F11') {
        event.preventDefault();
        clearData();
    }
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        if (inputBuffer === '') {
            // Если inputBuffer пустой, отправляем данные на сервер
            sendTableDataToServer();
        } else {
            // Существующая логика обработки ввода
            handleKeyboardInput(inputBuffer);
            inputBuffer = '';
            currentInput.textContent = '';
        }
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

function sendTableDataToServer() {
    const tableData = Array.from(document.querySelector('table tbody').rows).map(row => ({
        code: row.cells[1].textContent,
        article: row.cells[2].textContent,
        name: row.cells[3].textContent,
        quantity: row.cells[4].textContent,
        price: row.cells[5].textContent,
        sum: row.cells[6].textContent
    }));

    const employeeSelect = document.getElementById('employee');
    const masterSelect = document.getElementById('master');

    const dataToSend = {
        tableData: tableData,
        employee: employeeSelect.value,
        master: masterSelect.value
    };

    // Отправка данных на локальный ресурс на порт 8843
    const url = 'https://127.0.0.1:8443/api/print-check';
    //const url = 'http://188.225.31.209:8080/api/print-check';

    const headers = {
        //'Content-Type': 'application/json',
        'Access-Control-Request-Private-Network': 'true',
        'access-control-request-headers': 'access-control-request-private-network,content-type'
    };

    const requestBody = JSON.stringify(dataToSend);

    // Логируем запрос перед отправкой
    //logRequest(url, 'POST', headers, requestBody);

    fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: headers,
        body: requestBody
    })
    .then(response => {
        // Логируем ответ
        console.log('Ответ сервера:');
        console.log(`Статус: ${response.status} ${response.statusText}`);
        console.log('Заголовки ответа:');
        for (let [key, value] of response.headers) {
            console.log(`  ${key}: ${value}`);
        }
        
        if (!response.ok) {
            throw new Error('Ошибка сети или сервера');
        }
        return response.json();
    })
    .then(data => {
        console.log('Тело ответа:');
        console.log(data);
        showNotification('Данные успешно отправлены', 'success');
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showNotification('Ошибка при отправке данных', 'error');
    });
}

// Добавляем обработчик события для кнопки "Печать чека"
document.querySelector('.button.accent').addEventListener('click', sendTableDataToServer);

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Анимация появления
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);

    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function addProductRow(item, quantity) {
    const table = document.querySelector('.table-container tbody');
    const rows = Array.from(table.rows);
    newQuantity = quantity

    const existingRow = rows.find(row => row.cells[1].textContent === item.code);

    if (existingRow) {
        // Если товар уже есть в таблице, увеличиваем количество
        const quantityCell = existingRow.cells[4];
        const priceCell = existingRow.cells[5];
        const sumCell = existingRow.cells[6];

        newQuantity = parseInt(quantityCell.textContent) + quantity;
        quantityCell.textContent = newQuantity;
        sumCell.textContent = (parseFloat(priceCell.textContent) * newQuantity).toFixed(2);
    } else {
        console.log("no exist")
        // Если товара нет в таблице, добавляем новую строку
        const newRow = table.insertRow();
        newRow.innerHTML = `
            <td>${table.rows.length}</td>
            <td>${item.code}</td>
            <td>${item.article || '-'}</td>
            <td>${item.name}</td>
            <td>${quantity}</td>
            <td>${item.price.toFixed(2)}</td>
            <td>${(item.price * quantity).toFixed(2)}</td>
        `;
    }

    updateTotal();
    updateCurrentItemInfo(item, newQuantity);
    saveData();
}

function updateTotal() {
    const tbody = document.querySelector('table tbody');
    let total = 0;

    Array.from(tbody.rows).forEach(row => {
        total += parseFloat(row.cells[6].textContent);
    });

    document.querySelector('.total').textContent = `К оплате: ${total.toFixed(2)}р`;
}

// Обновляем обработчики событий для select'ов
document.getElementById('employee').addEventListener('change', saveData);
document.getElementById('master').addEventListener('change', saveData);

// Загружаем данные при загрузке страницы
document.addEventListener('DOMContentLoaded', loadData);

// Сохраняем данные перед закрытием страницы
window.addEventListener('beforeunload', saveData);

document.addEventListener('DOMContentLoaded', function() {
    const employeeSelect = document.getElementById('employee');
    const masterSelect = document.getElementById('master');

    fetch('/sellers')
        .then(response => response.json())
        .then(sellers => {
            sellers.forEach(seller => {
                const option = document.createElement('option');
                option.value = seller.code;
                option.textContent = seller.name;
                employeeSelect.appendChild(option);
            });
            
            // Получаем сохраненное значение
            const savedEmployee = localStorage.getItem('selectedEmployee');
            // Проверяем, есть ли сохраненное значение и существует ли оно в списке
           if (savedEmployee && Array.from(employeeSelect.options).some(option => option.value === savedEmployee)) {
            employeeSelect.value = savedEmployee;
           }
        })
        .catch(error => console.error('Ошибка при загрузке списка продавцов:', error));

    fetch('/plumbers')
        .then(response => response.json())
        .then(plumbers => {
            plumbers.forEach(plumber => {
                const option = document.createElement('option');
                option.value = plumber.code;
                option.textContent = plumber.name;
                masterSelect.appendChild(option);
            });
            // Получаем сохраненное значение
            const savedMaster = localStorage.getItem('selectedMaster');
            // Проверяем, есть ли сохраненное значение и существует ли оно в списке
           if (savedMaster && Array.from(masterSelect.options).some(option => option.value === savedMaster)) {
            masterSelect.value = savedMaster;
           }
        })
        .catch(error => console.error('Ошибка при загрузке списка сантехников:', error));

    // Добавляем обработчик для кнопки "Убрать скидку"
    const removeDiscountButton = document.querySelector('button.button:nth-child(2)');
    if (removeDiscountButton) {
        removeDiscountButton.addEventListener('click', function() {
            const tableData = Array.from(document.querySelector('table tbody').rows).map(row => ({
                code: row.cells[1].textContent,
                article: row.cells[2].textContent,
                name: row.cells[3].textContent,
                quantity: row.cells[4].textContent,
                price: row.cells[5].textContent,
                sum: row.cells[6].textContent
            }));

            const employeeSelect = document.getElementById('employee');
            const masterSelect = document.getElementById('master');

            const dataToSend = {
                tableData: tableData,
                employee: employeeSelect.value,
                master: masterSelect.value
            };

            const url = 'http://127.0.0.1:8085/api/print-check';

            const headers = {
                'Content-Type': 'application/json',
                //'Access-Control-Request-Private-Network': 'true'
            };

            const requestBody = JSON.stringify(dataToSend);

            fetch(url, {
                method: 'POST',
                mode: 'cors',
                headers: headers,
                body: requestBody
            })
            .then(response => {
                console.log('Ответ сервера:');
                console.log(`Статус: ${response.status} ${response.statusText}`);
                console.log('Заголовки ответа:');
                for (let [key, value] of response.headers) {
                    console.log(`  ${key}: ${value}`);
                }
                
                if (!response.ok) {
                    throw new Error('Ошибка сети или сервера');
                }
                return response.json();
            })
            .then(data => {
                console.log('Тело ответа:');
                console.log(data);
                showNotification('Скидка убрана', 'success');
            })
            .catch(error => {
                console.error('Ошибка:', error);
                showNotification('Ошибка при отправке запроса убрать скидку', 'error');
            });
        });
    }

    // Добавляем обработчик для кнопки "Скидка"
    const discountButton = document.querySelector('button.button:nth-child(1)');
    if (discountButton) {
        discountButton.addEventListener('click', function() {
            fetch('http://127.0.0.1:8080/api.php?a=fiscalprinter:atol10:CheckPrintArray&loglevel=1&com=5:-1:-1', {
                method: 'GET',
                mode: 'cors',
                headers: {
                    //'Access-Control-Request-Private-Network': 'true'
                }
            })
            .then(response => {
                console.log('Ответ сервера:');
                console.log(`Статус: ${response.status} ${response.statusText}`);
                console.log('Заголовки ответа:');
                for (let [key, value] of response.headers) {
                    console.log(`  ${key}: ${value}`);
                }
                
                if (!response.ok) {
                    throw new Error('Ошибка сети или сервера');
                }
                return response.text();
            })
            .then(data => {
                console.log('Тело ответа:');
                console.log(data);
                showNotification('Скидка применена', 'success');
            })
            .catch(error => {
                console.error('Ошибка:', error);
                showNotification('Ошибка при применении скидки', 'error');
            });
        });
    }
});