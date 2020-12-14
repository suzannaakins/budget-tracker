//establish connection to IndexedDB
let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('new_fund', { autoIncrement: true });
};

request.onsuccess = function (event) {
    //save to db
    db = event.target.result;

    //if online, send saved offline data to api
    if (navigator.online) {
        uploadFund();
    }
};

request.onerror = function (event) {
    // log error
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_fund'], 'readwrite');
    const fundObjectStore = transaction.objectStore('new_fund');
    fundObjectStore.add(record);
}

function uploadFund() {
    const transaction = db.transaction(['new_fund'], 'readwrite');
    const fundObjectStore = transaction.objectStore('new_fund');
    const getAll = fundObjectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['new_fund'], 'readwrite');
                    const fundObjectStore = transaction.objectStore('new_fund');
                    pizzaObjectStore.clear();

                    alert('All saved funds have been submitted.');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
};

window.addEventListener('online', uploadFund);