import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, push, set, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


let data;

// Get a reference to the Firebase Realtime Database
const database = firebase.database();
// Reference to the "orders" node in the database
const ordersRef = database.ref('orders');

function updateMenuWithLiveChanges() {
    ordersRef.on('child_changed', (snapshot) => {
        // Handle changes in order details
        const changedOrder = snapshot.val();
        const orderId = snapshot.key;

        if (changedOrder && changedOrder.orderStatus) {
            document.getElementById('notificationSoundd').play();
            alert(`Your order (${changedOrder.foodName}) has been ${changedOrder.orderStatus.toLowerCase()} by the owner.`);
            getCurrentOrders(); // You may need to update the UI with the latest orders
        }
    });
}

// Call the function to start listening for live changes in the menu
updateMenuWithLiveChanges();

// Fetch data from Firebase and update UI
function fetchDataFromFirebaseAndLog() {
    const database = getDatabase(app);
    const dataRef = ref(database);

    get(dataRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                data = snapshot.val();
                data = data['all'];

                const cards = document.querySelector('.my-populercarts');
                if (data && data.length > 0) {
                   
                    cards.innerHTML = '';
                    
                    data.forEach(item => {
                        if(item.food_ratings > '4.7'){
                            console.log(item);
                            const itemDiv = createCardElement(item);
                            cards.appendChild(itemDiv);
                        }
                       
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
fetchDataFromFirebaseAndLog();
function addlenght() {
    const database = getDatabase(app);
    const dataRef = ref(database);

    get(dataRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                data = snapshot.val();
                document.querySelector('.alli').textContent = data['all'].length +'items'
                document.querySelector('.fasti').textContent = data['fastfood'].length +'items'
                document.querySelector('.lunchi').textContent = data['lunch'].length +'items'
                document.querySelector('.dinneri').textContent = data['dinner'].length +'items'
                console.log(data)
                
                }
            });
}
addlenght();

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

let cartItems = [];
// let currento = []
let totalPrice = 0;
updateCartPopup();

// Initialize cartItems from local storage on page load
window.addEventListener('load', () => {
    // Check if there are existing cart items in local storage
    const storedCartItems = localStorage.getItem('cartItems');
    
    // If there are existing items, use them; otherwise, initialize as an empty array
    cartItems = storedCartItems ? JSON.parse(storedCartItems) : [];
  
    if(cartItems != 0){
        document.querySelector('.totalcarts').style.display='block';
        document.querySelector('.totalcarts').textContent = cartItems.length;
    } else {
        document.querySelector('.totalcarts').style.display='none';
    }
    // Call the function to update the cart popup with the loaded or empty cartItems
    updateCartPopup();
    
    
});


// Function to remove item from cart by id and update local storage
function removeItemAndUpdateLocalStorage(id) {
    const index = cartItems.findIndex(item => item.id === id);
    if (index !== -1) {
        cartItems.splice(index, 1);
        updateCartLocalStorage();
    }
}

function addToCartAndUpdateLocalStorage(foodName, img, price, cardDetails,uniqueId) {
    const parsedPrice = parseFloat(price);

    if (isNaN(parsedPrice)) {
        alert("Invalid price. Please provide a valid number.");
        return;
    }

    // const uniqueId = `Card-${cartItems.length + 1}-${Date.now()}`;
    const newItem = { id: uniqueId, foodName, img, price: parsedPrice, cardDetails };

    // Update the cartItems array
    // cartItems.push(newItem);

    // Save the updated cartItems to local storage
    updateCartLocalStorage();

    // Optionally, you can display a confirmation or update the UI here
    console.log("Item added to cart:", newItem);
}



// DOMContentLoaded Event Listener
document.addEventListener('DOMContentLoaded', () => {
    let cartBtn = document.getElementById('shopingcart');

    // Main Event Listeners
    cartBtn.addEventListener('click', () => displayPopup('cartPopup'));
    document.querySelector('#buy-popup').addEventListener('click', () => buyNow());
    document.querySelector('.orders').addEventListener('click', () => displayPopup('orderSummaryBox'));
    document.querySelector('#oclose').addEventListener('click', () => closePopup('orderSummaryBox'));
    document.querySelector('#close-cart').addEventListener('click', () => closePopup('cartPopup'));

    // Call getCurrentOrders after the DOM is fully loaded
});




// Function to check if a user is logged in and fetch their details
function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
        getCurrentOrders();
        if (user) {
            // User is signed in
            console.log("User is signed in:", user.email);
            // document.querySelector('#profilename').style.display='block'
            closesignupBtn();
            document.getElementById('side-loginBtn').style.display = 'none'
            document.querySelector('#profilename').innerHTML = user.email
            document.querySelector('#profilenamee').innerHTML = user.email
            document.getElementById('side-logoutBtn').style.display='block'
            // document.querySelector('.login-loading').style.display='none'
        } else {
            // User is signed out
            console.log("User is signed out");
            document.querySelector('#profilename').textContent = ''
            document.getElementById('side-logoutBtn').style.display = 'none'
            document.getElementById('side-loginBtn').style.display = 'block'
            document.querySelector('.login-loading').style.display='none'
        }
    });
}
const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('side-logoutBtn');

document.getElementById('side-signupBtn').addEventListener('click', () => sidesignupBtn())
document.getElementById('side-loginBtn').addEventListener('click', () => sideloginBtn())
document.getElementById('side-logoutBtn').addEventListener('click', () => logOut())

document.getElementById('singupclose').addEventListener('click', () => closesignupBtn())
document.getElementById('loginclose').addEventListener('click', () => closesignupBtn())

checkAuthState();

    // Side Navigation Event Listeners
    document.getElementById('opensidenav').addEventListener('click', opennav);
    document.getElementById('closesidenav').addEventListener('click', closenav);

    // healpwer functions 
function opennav() {
    document.querySelector(".sidenav").style.display = "block"
    document.querySelector('.openside').style.display = "none"
    document.querySelector('.closeside').style.display = "block"
    setTimeout(() => {
        document.querySelector(".sidenav-nav").style.width = "55vw"
    }, 100);
}
function closenav() {

    document.querySelector(".sidenav-nav").style.width = "0vw"
    setTimeout(() => {
        document.querySelector('.closeside').style.display = "none"
        document.querySelector('.openside').style.display = "block"
        document.querySelector(".sidenav").style.display = "none"
    }, 500);
}
function sidesignupBtn() {
    document.querySelector('#siguppopup').style.display = 'block'
    document.querySelector('.siguppopupbkg').style.display='block'
    document.querySelector('#loginpopup').style.display = 'none'
}

function sideloginBtn() {
    document.querySelector('#siguppopup').style.display = 'none'
    document.querySelector('#loginpopup').style.display = 'block'
    document.querySelector('.siguppopupbkg').style.display='block'
}
function closesignupBtn() {
    document.querySelector('#siguppopup').style.display = 'none'
    document.querySelector('#loginpopup').style.display = 'none'
    document.querySelector('.siguppopupbkg').style.display='none'
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
            checkAuthState();
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
            checkAuthState();
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




function displayPopup(popupid) {
    document.getElementById(popupid).style.display='block'
}

// Function to get current orders from the database
function getCurrentOrders() {
    const user = getAuth().currentUser;

    if (user) {
        console.log(user.email);
        const userEmail = user.email;
        const database = getDatabase(app);
        const ordersRef = ref(database, 'orders');

        // Fetch orders data
        get(ordersRef)
            .then((snapshot) => {
                const currentOrdersContainer = document.getElementById('currentOrders');
                const totalItemElement = document.getElementById('totalItem');
                const orderTotalElement = document.getElementById('orderTotal');

                if (snapshot.exists()) {
                    const ordersData = snapshot.val();
                    const ordersArray = ordersData ? Object.entries(ordersData) : [];
                    // const userOrders = ordersArray.filter(([orderId, ele]) => ele.userEmail === userEmail);

                    console.log('Total Orders:', ordersArray.length);
                    const userOrders = ordersArray.filter(([orderId, ele]) => ele.userEmail === userEmail && ele.orderStatus !== 'Accepted');
                    if (userOrders.length > 0) {
                        document.getElementById('totalItem').textContent = userOrders.length;
                        // Clear existing content
                        currentOrdersContainer.innerHTML = '';

                        let totalOrderPrice = 0;

                        userOrders.forEach(([orderId, order]) => {
                            const orderItem = document.createElement('div');
                            orderItem.classList.add('curentorderslist');
                            orderItem.innerHTML = `
                            <li class=''my-o-img><img class='current-o-img' src='${order.orderimg}'></li>
                                <li>${order.foodName}</li>
                                <li>${order.orderPrice}</li>
                                <li>${order.orderDate}</li> 
                                <li>${order.orderTime}</li>
                                <li>${order.orderStatus}</li>
                                <button class='cancel-btn' data-order-id='${orderId}'>Cancel</button>
                            `;

                            // Append order item to the container
                            currentOrdersContainer.appendChild(orderItem);

                            // Accumulate the order prices
                            totalOrderPrice += parseFloat(order.orderPrice);

                            const cancelBtn = orderItem.querySelector('.cancel-btn');
                            cancelBtn.addEventListener('click', () => cancelOrder(orderId));
                        });

                        // Display the total order price
                        orderTotalElement.textContent = totalOrderPrice.toFixed(2);

                        // Display the container since there are orders
                        document.querySelector('.orders').style.display = 'block';
                    } else {
                        // No orders available
                        currentOrdersContainer.innerHTML = '';
                        orderTotalElement.textContent = '0';
                        document.getElementById('orderSummaryBox').style.display = 'none';

                        // Check if totalItemElement exists before modifying its content
                        if (totalItemElement) {
                            totalItemElement.textContent = '0';
                        }

                        // Hide the orders container
                        document.querySelector('.orders').style.display = 'none';
                    }
                } else {
                    // No orders available
                    currentOrdersContainer.innerHTML = '';
                    orderTotalElement.textContent = '0';
                    document.getElementById('orderSummaryBox').style.display = 'none';
                    document.querySelector('.orders').style.display = 'none';
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error.message);
            });
    }
}


function closePopup(popupId) {
    document.getElementById(popupId).style.display = 'none';

}
function buyNow() {
    console.log('works');
    if (cartItems.length === 0) {
        alert("Add something to buy...");
        closePopup('cartPopup');
    } else {
        totalPrice = 0;  // Reset total price before processing orders
        closePopup('cartPopup');
        // document.getElementById('totalItems').textContent = cartItems.length;
        document.getElementById('totalItem').textContent = cartItems.length;

        // Copy cartItems to a new array to avoid modifying the original array in the loop
        const orderedItems = [...cartItems];

        // Clear cartItems
        cartItems = [];
        // document.getElementById('totalItems').textContent = cartItems.length;
        document.getElementById('totalItem').textContent = cartItems.length;

        // Update local storage after clearing the cart
        updateCartLocalStorage();
        orderedItems.forEach((order) => {
            const user = getAuth().currentUser;
        
            if (!user) {
                alert("Please log in to place an order.");
                return; // Stop processing further orders if the user is not logged in
            }
        
            const userEmail = user.email;
        
            order = {
                userEmail: userEmail,
                orderimg: order.img,
                orderName: order.cardDetails,
                foodName: order.foodName,
                orderPrice: parseFloat(order.price),  // Convert order price to float
                orderDate: getCurrentDate(),
                orderTime: getCurrentTime12Hour(),
                orderStatus: "Pending"
            };
        
            addOrderToFirebase(order);
            document.getElementById('notificationSound').play();
        });
        
        

        getCurrentOrders();  // Move outside the loop to call it once
        updateCartPopup();
        // Optionally, you can update the cart popup here
    }
    if(cartItems != 0){
        document.querySelector('.totalcarts').style.display='block';
        document.querySelector('.totalcarts').textContent = cartItems.length;
    } else {
        document.querySelector('.totalcarts').style.display='none';
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


function getCurrentTime12Hour() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const meridiem = hours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    hours = hours % 12 || 12;

    return `${hours}:${minutes}:${seconds} ${meridiem}`;
}


// Function to check if the user is logged in
function isUserLoggedIn() {
    const user = getAuth().currentUser;
    return !!user;
}

// Updated addToCart function
function addToCart(foodName, img, price, cardDetails) {
    if (!isUserLoggedIn()) {
        displayPopup('loginpopup')
        return;
    }

    const parsedPrice = parseFloat(price);

    if (isNaN(parsedPrice)) {
        alert("Invalid price. Please provide a valid number.");
        return;
    }

    const uniqueId = `Card-${cartItems.length + 1}-${Date.now()}`;
    const user = getAuth().currentUser;
    const userEmail = user ? user.email : "Guest"; // Use "Guest" if the user is not logged in

    cartItems.push({ id: uniqueId, foodName, img, price: parsedPrice, cardDetails, userEmail });
    totalPrice += Math.abs(parsedPrice);

    updateCartPopup();
    addToCartAndUpdateLocalStorage(foodName, img, price, cardDetails, uniqueId);
    
    if (cartItems.length !== 0) {
        document.querySelector('.totalcarts').style.display = 'block';
        document.querySelector('.totalcarts').textContent = cartItems.length;
    } else {
        document.querySelector('.totalcarts').style.display = 'none';
    }
}

function updateCartPopup() {
    const cartItemsDiv = document.getElementById('cartItems');
    const totalPriceSpan = document.getElementById('totalPrice');

    // Clear existing content
    cartItemsDiv.innerHTML = '';

    // Iterate through cartItems and display each item
    cartItems.forEach((item) => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('mycartitems')
        itemDiv.innerHTML = `<span> <img src="${item.img}" alt="item" class="popup-img"></span>
                            <p>${item.foodName} - ₹${item.price} </p>
                            <button class="removeBtn" data-id="${item.id}">Remove</button>`;

        // Attach the event listener to the "Remove" button
        const removeBtn = itemDiv.querySelector('.removeBtn');
        removeBtn.addEventListener('click', () => removeItem(item.id));

        cartItemsDiv.appendChild(itemDiv);
    });

    // Display total price with two decimal places
    totalPriceSpan.textContent = `₹${totalPrice.toFixed(2)}`;

    // Display the cartPopup
    const cartPopup = document.getElementById('cartPopup');
    // cartPopup.style.display = 'block';
}


// Function to remove item by id from cartItems and update local storage
function removeItem(id) {
    const index = cartItems.findIndex(item => item.id === id);
    if (index !== -1) {
        totalPrice -= Math.abs(cartItems[index].price);
        cartItems.splice(index, 1);
        updateCartLocalStorage();
        if(cartItems != 0){
            document.querySelector('.totalcarts').style.display='block';
            document.querySelector('.totalcarts').textContent = cartItems.length;
       
        } else {
            document.querySelector('.totalcarts').style.display='none';
            closePopup('cartPopup');
        }
    }
}
// cencle order directly in database
function cancelOrder(orderId) {

    // Assuming you have a reference to the 'orders' node in your Firebase database
    const orderRef = ref(getDatabase(app), `orders/${orderId}`);

    // Remove the order from the database
    remove(orderRef)
        .then(() => {
            getCurrentOrders();
            document.getElementById('notificationSound').play();
        })
        .catch((error) => {
            console.error('Error canceling order:', error.message);
        });
}


// Function to update the cart in local storage and display the cart popup
function updateCartLocalStorage() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartPopup();
}



// Add event listeners to each filter link
var filterLinks = document.querySelectorAll('.alllink');

filterLinks.forEach(function(link) {
    link.addEventListener('click', function(event) {
        // Prevent the default behavior of the link
        event.preventDefault();

        // Get the filter attribute from the data-cat attribute
        var filterAttribute = link.getAttribute('data-cat');

        // Store the filter attribute in local storage
        localStorage.setItem('selectedFilter', filterAttribute);

        // Redirect to the menu page
        window.location.href = link.href;
    });
});

