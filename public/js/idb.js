let db;
const request = indexedDB.open('budget-tracker', 1);


request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// upon a successful 
request.onsuccess = function(event) {

    db = event.target.result;
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new transcation and there's no internet connection
function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const transObjectStore = transaction.objectStore('new_transaction');

    transObjectStore.add(record);
};

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    
        // access your object store
        const transObjectStore = transaction.objectStore('new_transaction');
    
        // get all records from store and set to a variable
        const getAll = transObjectStore.getAll();
    
        getAll.onsuccess = function() {
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
                // open one more transaction
                const transaction = db.transaction(['new_transaction'], 'readwrite');
                // access the new_transaction object store
                const transObjectStore = transaction.objectStore('new_transaction');
                // clear all items in your store
                transObjectStore.clear();
        
                alert('All saved transactions have been submitted!');
                })
                .catch(err => {
                console.log(err);
                });
            }
        };
    };

// listen for app coming back online
window.addEventListener('online', uploadTransaction);