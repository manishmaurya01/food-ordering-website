import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, push, set, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
const firebaseConfig = {
    apiKey: "AIzaSyBOndzgkTed5OmE6BsMstYLc7W9HT3YPp0",
    authDomain: "foodorder-97583.firebaseapp.com",
    databaseURL: "https://foodorder-97583-default-rtdb.firebaseio.com",
    projectId: "foodorder-97583",
    storageBucket: "foodorder-97583.appspot.com",
    messagingSenderId: "559028587131",
    appId: "1:559028587131:web:a4f8b6897be29b86d670de",
    measurementId: "G-62G43E2LTN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


let data;
let cartItems = [];
// let currento = []
let totalPrice = 0;
updateCartPopup();


const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('side-logoutBtn');

const addCardBtn = document.getElementById('addCardBtn');
const cartBtn = document.getElementById('cartBtn');
const category = document.getElementById('category');


// DOMContentLoaded Event Listener
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    document.querySelector('.orders').style.display = 'none'

    // Side Navigation Event Listeners
    document.getElementById('opensidenav').addEventListener('click', opennav);
    document.getElementById('closesidenav').addEventListener('click', closenav);

    // Popup Event Listeners
    document.getElementById('search-inp').addEventListener('input', searchFood);
    // document.getElementById('buy-popup').addEventListener('click', buyNow);
    document.getElementById('add').addEventListener('click', addNewCard);
    document.getElementById('close-addcard').addEventListener('click', () => closePopup('addcard-popup'));
    document.getElementById('close-buy').addEventListener('click', () => closePopup('buyCardPopup'));
    document.getElementById('close-cart').addEventListener('click', () => closePopup('cartPopup'));
    document.querySelector('.orders').addEventListener('click', () => orders());
    document.querySelector('#oclose').addEventListener('click', () => orderclosebtn());

    document.getElementById('side-signupBtn').addEventListener('click', () => sidesignupBtn())
    document.getElementById('side-loginBtn').addEventListener('click', () => sideloginBtn())
    document.getElementById('side-logoutBtn').addEventListener('click', () => logOut())

    document.getElementById('singupclose').addEventListener('click', () => closesignupBtn())
    document.getElementById('loginclose').addEventListener('click', () => closesignupBtn())


    // Main Event Listeners
    addCardBtn.addEventListener('click', () => displayPopup('addcard-popup'));
    cartBtn.addEventListener('click', () => displayPopup('cartPopup'));
    category.addEventListener('change', () => {
        document.getElementById('search-inp').value = ''
        fetchDataFromAPI(category.value);
    });
    // Call updateOrderSummaryBox when the user clicks on the "Buy Now" button
    document.getElementById('buy-popup').addEventListener('click', () => {
        buyNow();
        updateOrderSummaryBox();
    });
    // Initial Data Fetch
    fetchDataFromAPI(category.value);
    getCurrentOrders();
});


// Function to check if a user is logged in and fetch their details
function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            console.log("User is signed in:", user.email);
            closesignupBtn();
            document.querySelector('#profilename').innerHTML = user.email
        } else {
            // User is signed out
            console.log("User is signed out");
            document.querySelector('#profilename').innerHTML = 'please Loging'
        }
    });
}
checkAuthState();


function sidesignupBtn() {
    document.querySelector('#siguppopup').style.display = 'block'
    document.querySelector('#loginpopup').style.display = 'none'
}

function sideloginBtn() {
    document.querySelector('#siguppopup').style.display = 'none'
    document.querySelector('#loginpopup').style.display = 'block'
}
function closesignupBtn() {
    document.querySelector('#siguppopup').style.display = 'none'
    document.querySelector('#loginpopup').style.display = 'none'
}

signupBtn.addEventListener('click', () => {
    const email = document.querySelector('#signupemail').value;
    const password = document.querySelector('#signuppassword').value;
    signUp(email, password)
        .then(() => {
            // User signed up successfully
            console.log('User signed up successfully');
        })
        .catch(error => {
            // Handle signup error
            console.error('Error during signup:', error.message);
        });
});

loginBtn.addEventListener('click', () => {
    const email = document.querySelector('#loginemail').value;
    const password = document.querySelector('#loginpassword').value;
    logIn(email, password)
        .then(() => {
            // User logged in successfully
            console.log('User logged in successfully');
        })
        .catch(error => {
            // Handle login error
            console.error('Error during login:', error.message);
        });
});

logoutBtn.addEventListener('click', () => {
    logOut()
        .then(() => {
            // User logged out successfully
            console.log('User logged out successfully');
        })
        .catch(error => {
            // Handle logout error
            console.error('Error during logout:', error.message);
        });
});

// Function to perform logout
function performLogout() {
    logOut()
        .then(() => {
            alert("Now you are logged out");
            location.reload();
            // Additional actions after logout (if needed)
        })
        .catch(error => {
            console.error("Error logging out:", error.message);
            // Handle error during logout (if needed)
        });
}

// Function to sign up a user
function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

// Function to log in a user
function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

// Function to log out the current user
function logOut() {
    return signOut(auth);
}

// Update and display the order summary box
function updateOrderSummaryBox() {
    // const orderSummaryBox = document.getElementById('orderSummaryBox');
    const currentOrdersDiv = document.getElementById('currentOrders');
    const orderTotalSpan = document.getElementById('orderTotal');
    // Clear existing content
    currentOrdersDiv.innerHTML = '';
    // Iterate through current orders and display each order
    cartItems.forEach((item) => {
        const orderItemDiv = document.createElement('div');
        orderItemDiv.innerHTML = `<p>${item.foodName} - $${item.price.toFixed(2)}</p>`;
        currentOrdersDiv.appendChild(orderItemDiv);
    });

    // Display total price with two decimal places
    orderTotalSpan.textContent = `${totalPrice.toFixed(2)}`;

}
function orderclosebtn() {
    document.querySelector('#orderSummaryBox').style.display = 'none'

}

function orders() {
    console.log('orderfunction');
    document.querySelector('#orderSummaryBox').style.display = 'block'
    getCurrentOrders();
}

// get current orders from database
function getCurrentOrders() {

    const database = getDatabase(app);
    const dataRef = ref(database, 'orders');

    get(dataRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                document.querySelector('.orders').style.display = 'block';
                const data = snapshot.val();
                const orders = data ? Object.entries(data) : [];

                console.log('Total Orders:', orders.length);

                let mylistsec = document.getElementById('currentOrders');
                mylistsec.innerHTML = '';
                let totalOrderPrice = 0; // Initialize the total order price

                document.getElementById('totalItem').textContent = orders.length;

                orders.forEach(([orderId, ele]) => {
                    const list = createCardElement('div');
                    list.classList.remove('card');
                    list.classList.add('curentorderslist');
                    list.innerHTML = `
                    <li>${ele.foodName}</li>
                    <li>${ele.orderPrice}</li>
                    <li>${ele.orderDate}</li>
                    <li>${ele.orderTime}</li>
                    <li>${ele.orderStatus}</li>
                    <button class='cancel-btn' data-order-id='${orderId}'>Cancel</button>
                `;

                    mylistsec.appendChild(list);

                    const cancelBtn = list.querySelector('.cancel-btn');
                    cancelBtn.addEventListener('click', () => cancelOrder(orderId));

                    // Accumulate the order prices
                    totalOrderPrice += parseFloat(ele.orderPrice);

                });

                // Display the total order price
                document.getElementById('orderTotal').textContent = `${totalOrderPrice.toFixed(2)}`;
            } else {
                let mylistsec = document.getElementById('currentOrders');
                mylistsec.innerHTML = '';
                document.getElementById('orderTotal').textContent = '0';
                document.getElementById('orderSummaryBox').style.display = 'none';
            }
        })
        .catch((error) => {
            console.error('Error fetching data:', error.message);
        });

}

// cencle order directly in database
function cancelOrder(orderId) {

    // Assuming you have a reference to the 'orders' node in your Firebase database
    const orderRef = ref(getDatabase(app), `orders/${orderId}`);

    // Remove the order from the database
    remove(orderRef)
        .then(() => {
            // console.log('Order canceled successfully.');
            // Update the UI or any other necessary actions after canceling an order
        })
        .catch((error) => {
            console.error('Error canceling order:', error.message);
        });

    getCurrentOrders();
}


// healpwer functions 
function opennav() {
    document.querySelector(".sidenav").style.display = "block"
    document.querySelector('.openside').style.display = "none"
    document.querySelector('.closeside').style.display = "block"
    setTimeout(() => {
        document.querySelector(".sidenav-nav").style.width = "65vw"
    }, 100);
}
function ordersclose() {
    document.querySelector('#orderSummaryBox').style.display = 'none'

}
function closenav() {

    document.querySelector(".sidenav-nav").style.width = "0vw"
    setTimeout(() => {
        document.querySelector('.closeside').style.display = "none"
        document.querySelector('.openside').style.display = "block"
        document.querySelector(".sidenav").style.display = "none"
    }, 500);
}

// for display the sorted result
function sortData(data) {
    return data.sort((a, b) => a.food_name.toLowerCase().localeCompare(b.food_name.toLowerCase()));
}

// if there is no data found 
function nodata() {
    return `<img src="https://siliconangle.com/files/2013/02/no-data.png" class="nodata">`
}

// search any food directly from collected data from the database
function searchFood() {
    const searchTerm = document.getElementById('search-inp').value.toLowerCase();
    const filteredData = data.filter(item => item.food_name.toLowerCase().includes(searchTerm));

    if (filteredData.length > 0) {
        const sortedData = sortData(filteredData);
        displaySearchResults(sortedData);
    } else {
        const cards = document.querySelector('.my-cards');
        cards.innerHTML = nodata();
    }
}

// generate skeleton loading screen when data is load 
function generateSkeletonHTML() {
    return `
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    `;
}

// create cards of all data
function createCardElement(data) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('card');
    let star;
    if (data.food_ratings > "0" && data.food_ratings <= "1") {
        star = '&#9733;&#9734;&#9734;&#9734;&#9734;';
    } else if (data.food_ratings > "1" && data.food_ratings <= "2") {
        star = '&#9733;&#9733;&#9734;&#9734;&#9734;';
    } else if (data.food_ratings > "2" && data.food_ratings <= "3") {
        star = '&#9733;&#9733;&#9733;&#9734;&#9734;';
    } else if (data.food_ratings > "3" && data.food_ratings <= "4") {
        star = '&#9733;&#9733;&#9733;&#9733;&#9734;';
    } else if (data.food_ratings > "4" && data.food_ratings <= "5") {
        star = '&#9733;&#9733;&#9733;&#9733;&#9733;';
    }
    itemDiv.innerHTML = `
        <div class="card-image">
            <img src="${data.food_img}" alt="img">
        </div>
        <div class="card-details">
            <section class="upper-sec">
                <strong class="food-name">${data.food_name}</strong>
                <p class="food-description">${data.food_desc}</p>
                <span class="rating">${star}${data.food_ratings}/5</span>
            </section>
            <section class="lower-sec">
                <strong class="food-prize">&#8377;${data.food_price}</strong>
                <button class="addToCartBtn">Add to Cart</button>
            </section>
        </div>
    `;

    // Adding event listener to the newly created button
    const addToCartBtn = itemDiv.querySelector('.addToCartBtn');
    addToCartBtn.addEventListener('click', () => addToCart(data.food_name, data.food_img, data.food_price, `Card ${cartItems.length + 1}`));

    return itemDiv;
}

// add new wfood in database only for admin
function addNewCard() {
    const name = document.getElementById('name');
    const description = document.getElementById('description');
    const rating = document.getElementById('rating');
    const price = document.getElementById('price');

    if (name.value === "" || description.value === "" || price.value === "") {
        alert("Please fill all details before adding a card");
    } else {
        const imageInput = document.getElementById('imageInput');
        const imageUrlInput = document.getElementById('imageUrlInput');
        let myimg = "";

        if (imageInput.files && imageInput.files[0]) {
            myimg = URL.createObjectURL(imageInput.files[0]);
        } else if (imageUrlInput.value !== "") {
            myimg = imageUrlInput.value;
        } else {
            alert("Please select an image or provide an image URL.");
            return;
        }

        const cards = document.querySelector('.my-cards');
        const itemDiv = createCardElement({ food_img: myimg, food_name: name.value, food_desc: description.value, food_ratings: rating.value, food_price: price.value });
        closePopup('addcard-popup');
        cards.appendChild(itemDiv);
    }
}

function displayPopup(popupId) {
    closenav();
    document.getElementById(popupId).style.display = 'block';
    if (popupId === "cartPopup") {
        displayCartPopup();
    }

}


function closePopup(popupId) {
    document.getElementById(popupId).style.display = 'none';
}

function buyNow() {
    if (cartItems.length === 0) {
        alert("Add something to buy...");
        closePopup('cartPopup');
    } else {
        closePopup('cartPopup');
        totalPrice = 0;
        document.getElementById('totalItems').textContent = cartItems.length;
        document.getElementById('totalItem').textContent = cartItems.length;

        cartItems.forEach((order) => {
            order = {
                orderimg: order.img,
                orderName: order.cardDetails,
                foodName: order.foodName,
                orderPrice: order.price,
                orderDate: getCurrentDate(),
                orderTime: getCurrentTime(),
                orderStatus: "Pending"
            };
            const orderId = addOrderToFirebase(order);
        })
        cartItems = ''
    }


}
// Function to add a new order to Firebase
function addOrderToFirebase(order) {
    const database = getDatabase(app);
    const ordersRef = ref(database, 'orders');

    const newOrderRef = push(ordersRef);

    // Add the order along with the timestamp
    set(newOrderRef, { ...order, orderTimestamp: firebase.database.ServerValue.TIMESTAMP });
    getCurrentOrders();
    return newOrderRef.key;
}
// Function to get the current date in the format YYYY-MM-DD
function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// update the card when user add any item using add to cart btn 
function updateCartPopup() {
    const cartItemsDiv = document.getElementById('cartItems');
    const totalPriceSpan = document.getElementById('totalPrice');

    // Clear existing content
    cartItemsDiv.innerHTML = '';

    // Iterate through cartItems and display each item
    cartItems.forEach((item) => {
        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `<span> <img src="${item.img}" alt="item" class="popup-img"></span>
                     <p>${item.foodName} - $${item.price.toFixed(2)} </p>
                     <button class="removeBtn" data-id="${item.id}">Remove</button>`;

        // Attach the event listener to the "Remove" button


        cartItemsDiv.appendChild(itemDiv);
    });

    // Display total price with two decimal places
    totalPriceSpan.textContent = `${totalPrice.toFixed(2)}`;
}

// remove added cart from the cart popup 
function removeItem(id) {
    console.log(`Removing item with ID: ${id}`);
    const index = cartItems.findIndex(item => item.id === id);
    if (index !== -1) {
        totalPrice -= Math.abs(cartItems[index].price); // Subtract the absolute value
        const removedItem = cartItems.splice(index, 1)[0];
        document.getElementById('totalItems').textContent = cartItems.length;

        const removeBtn = document.querySelector(`.removeBtn[data-id="${removedItem.id}"]`);
        if (removeBtn) {
            removeBtn.removeEventListener('click', () => removeItem(removedItem.id));
        }

        displayCartPopup();
    }
    if (cartItems.length < 1) {
        console.log('delete');
        document.querySelector('#cartPopup').style.display = 'none'

    }

}

function addToCart(foodName, img, price, cardDetails) {
    document.querySelector('.orderup').style.display = 'block'
    const parsedPrice = parseFloat(price);

    if (isNaN(parsedPrice)) {
        alert("Invalid price. Please provide a valid number.");
        return;
    }



    const uniqueId = `Card-${cartItems.length + 1}-${Date.now()}`;
    cartItems.push({ id: uniqueId, foodName, img, price: parsedPrice, cardDetails });
    totalPrice += Math.abs(parsedPrice);
    document.getElementById('totalItems').textContent = cartItems.length;
    // document.getElementById('totalItem').textContent = cartItems.length;
    updateCartPopup();
    console.log(cartItems);
}

// display all the data which is added by user in add to cart 
function displayCartPopup() {
    const cartPopup = document.getElementById('cartPopup');
    const cartItemsDiv = document.getElementById('cartItems');
    const totalPriceSpan = document.getElementById('totalPrice');

    cartItemsDiv.innerHTML = '';

    // Iterate through cartItems and display each item
    cartItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `<span> <img src="${item.img}" alt="item" class="popup-img"></span>
                             <p>${item.foodName} - $${item.price} </p>
                             <button class="removeBtn">Remove</button>`;

        // Attach the event listener to the "Remove" button
        const removeBtn = itemDiv.querySelector('.removeBtn');
        removeBtn.addEventListener('click', () => removeItem(item.id));

        cartItemsDiv.appendChild(itemDiv);
    });

    // Display total price with two decimal places
    totalPriceSpan.textContent = `$${totalPrice.toFixed(2)}`;

    // Display the cartPopup
    cartPopup.style.display = 'block';
}

// Fetch data from Firebase and update UI
function fetchDataFromFirebaseAndLog(category) {
    const database = getDatabase(app);
    const dataRef = ref(database);

    get(dataRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                data = snapshot.val();
                data = data[category];

                const cards = document.getElementById('myCards');
                if (data && data.length > 0) {
                    const sortedData = sortData(data);
                    cards.innerHTML = '';
                    sortedData.forEach(item => {
                        const itemDiv = createCardElement(item);
                        cards.appendChild(itemDiv);
                    });
                } else {
                    cards.innerHTML = nodata();
                }
            } else {
                console.log('No data available.');
            }
        })
        .catch((error) => {
            console.error('Error fetching data:', error.message);
        })
}


function fetchDataFromAPI(Category) {
    closenav();
    const cards = document.getElementById('myCards');
    cards.innerHTML = generateSkeletonHTML();
    fetchDataFromFirebaseAndLog(Category)
}

// display all searched data 
function displaySearchResults(results) {
    const cards = document.querySelector('.my-cards');
    cards.innerHTML = '';

    results.forEach(item => {
        const itemDiv = createCardElement(item);
        cards.appendChild(itemDiv);
    });
}


// Call updateCartPopup when the page loads to initialize the cart
window.addEventListener('load', updateCartPopup);
