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

// Initialize cartItems from local storage on page load
window.addEventListener('load', () => {
    // Check if there are existing cart items in local storage
    const storedCartItems = localStorage.getItem('cartItems');
    
    // If there are existing items, use them; otherwise, initialize as an empty array
    cartItems = storedCartItems ? JSON.parse(storedCartItems) : [];
    document.querySelector('.totalItem').textContent = cartItems.length;
    // Call the function to update the cart popup with the loaded or empty cartItems
    updateCartPopup();
});


// Function to update the cart in local storage and display the cart popup
function updateCartLocalStorage() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartPopup();
    // displayPopup('cartPopup');
}

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

const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('side-logoutBtn');

const addCardBtn = document.getElementById('addCardBtn');
const cartBtn = document.getElementById('cartBtn');
const category = document.getElementById('category');


// DOMContentLoaded Event Listener
document.addEventListener('DOMContentLoaded', () => {
    if (cartItems.length < 1) {
        document.querySelector('.totalItem').style.display = 'none';
    } else {
        document.querySelector('.totalItem').style.display = 'block';
    }
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
    fetchDataFromAPI(localStorage.getItem('selectedFilter'));
});


// Function to check if a user is logged in and fetch their details
function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
    getCurrentOrders();

        if (user) {
            // User is signed in
            console.log("User is signed in:", user.email);
            document.querySelector('#profilename').style.display='block'
            closesignupBtn();
            document.getElementById('side-loginBtn').style.display = 'none'
            document.querySelector('#profilename').innerHTML = user.email
            document.getElementById('side-logoutBtn').style.display='block'
            // document.querySelector('.login-loading').style.display='none'
        } else {
            // User is signed out
            console.log("User is signed out");
            document.querySelector('#profilename').style.display='none'
            document.getElementById('side-logoutBtn').style.display = 'none'
            document.getElementById('side-loginBtn').style.display = 'block'
            // document.querySelector('.login-loading').style.display='none'
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
    const user = getAuth().currentUser;

    if (user) {

    console.log(user.email);
const userEmail = user.email
    const database = getDatabase(app);
    const dataRef = ref(database, 'orders');

    get(dataRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                document.querySelector('.orders').style.display = 'block';
                const data = snapshot.val();
                const orders = data ? Object.entries(data) : [];

                console.log('Total Orders:', orders.length);
  // Filter orders based on user's email
  const userOrders = orders.filter(([orderId, ele]) => ele.userEmail === userEmail);

  if (userOrders.length > 0) {
      document.querySelector('.orders').style.display = 'block';
      console.log('Total Orders:', userOrders.length);

      let mylistsec = document.getElementById('currentOrders');
      mylistsec.innerHTML = '';
      let totalOrderPrice = 0; // Initialize the total order price

      document.getElementById('totalItems').textContent = userOrders.length;

      userOrders.forEach(([orderId, ele]) => {
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
      document.querySelector('.orders').style.display = 'none';
  }
} else {
  let mylistsec = document.getElementById('currentOrders');
  mylistsec.innerHTML = '';
  document.getElementById('orderTotal').textContent = '0';
  document.getElementById('orderSummaryBox').style.display = 'none';
  document.querySelector('.orders').style.display = 'none';
}
})
.catch((error) => {
console.error('Error fetching data:', error.message);
});
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
        })
        .catch((error) => {
            console.error('Error canceling order:', error.message);
        });
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
              
                <span class="rating">${star}${data.food_ratings}/5</span>
            </section>
            <section class="lower-sec">
                <strong class="food-prize">	&#8377;${data.food_price}</strong>
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
        // document.getElementById('totalItem').textContent = cartItems.length;

        // Copy cartItems to a new array to avoid modifying the original array in the loop
        const orderedItems = [...cartItems];

        // Clear cartItems
        cartItems = [];
        document.getElementById('totalItems').textContent = cartItems.length;
        // document.getElementById('totalItem').textContent = cartItems.length;

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
        });
        updateCartPopup();
        // Optionally, you can update the cart popup here
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

    hours = hours % 12 || 12;

    return `${hours}:${minutes}:${seconds} ${meridiem}`;
}

// Function to get the total number of items in localStorage
function getTotalItemsInLocalStorage() {
    const storedCartItems = localStorage.getItem('cartItems');
    return storedCartItems ? JSON.parse(storedCartItems).length : 0;
}
function updateCartPopup() {
    const cartItemsDiv = document.getElementById('cartItems');
    const totalPriceSpan = document.getElementById('totalPrice');
    const totalItemElement = document.querySelector('.totalItem');

    // Clear existing content
    cartItemsDiv.innerHTML = '';

    // Iterate through cartItems and display each item
    cartItems.forEach((item) => {
        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `<span> <img src="${item.img}" alt="item" class="popup-img"></span>
                            <p>${item.foodName} - 	&#8377;${item.price} </p>
                            <button class="removeBtn" data-id="${item.id}">Remove</button>`;

        // Attach the event listener to the "Remove" button
        const removeBtn = itemDiv.querySelector('.removeBtn');
        removeBtn.addEventListener('click', () => removeItem(item.id));

        cartItemsDiv.appendChild(itemDiv);
    });

    // Display total price with two decimal places
    totalPriceSpan.textContent = `$${totalPrice.toFixed(2)}`;

    // // Display the cartPopup
    // const cartPopup = document.getElementById('cartPopup');
    // cartPopup.style.display = 'block';

    // Update the visibility of total item element based on cartItems length
    if (cartItems.length > 0) {
        totalItemElement.style.display = 'block';
        totalItemElement.textContent = cartItems.length;
    } else {
        totalItemElement.style.display = 'none';
    }
}


function removeItem(id) {
    console.log(`Removing item with ID: ${id}`);
    const index = cartItems.findIndex(item => item.id === id);
    if (index !== -1) {
        totalPrice -= Math.abs(cartItems[index].price); // Subtract the absolute value
        const removedItem = cartItems.splice(index, 1)[0];

        // Remove the event listener for the removed item
        const removeBtn = document.querySelector(`.removeBtn[data-id="${removedItem.id}"]`);
        if (removeBtn) {
            removeBtn.removeEventListener('click', () => removeItem(removedItem.id));
        }

        document.querySelector('.totalItem').textContent = cartItems.length;

        // Update local storage after removing the item
        updateCartLocalStorage();

        // Display the updated cart popup
        updateCartPopup();
    }
    if (cartItems.length < 1) {
        document.querySelector('#cartPopup').style.display = 'none';
        document.querySelector('.totalItem').style.display = 'none';
    }
}

// Function to check if the user is logged in
function isUserLoggedIn() {
    const user = getAuth().currentUser;
    return !!user;
}

// Updated addToCart function
function addToCart(foodName, img, price, cardDetails) {
    if (!isUserLoggedIn()) {
        alert("Please log in to add items to the cart.");   
        return;
    }

    const parsedPrice = parseFloat(price);

    if (isNaN(parsedPrice)) {
        alert("Invalid price. Please provide a valid number.");
        return;
    }

    const uniqueId = `Card-${cartItems.length + 1}-${Date.now()}`;
    const user = getAuth().currentUser;
    const userEmail = user ? user.email : "Guest";
    cartItems.push({ id: uniqueId, foodName, img, price: parsedPrice, cardDetails, userEmail });
    totalPrice += Math.abs(parsedPrice);

    updateCartPopup();
    addToCartAndUpdateLocalStorage(foodName, img, price, cardDetails, uniqueId);
    
    if (cartItems.length !== 0) {
        document.querySelector('.totalItem').style.display = 'block';
        document.querySelector('.totalItem').textContent = cartItems.length;
    } else {
        document.querySelector('.totalItem').style.display = 'none';
    }
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
                             <p>${item.foodName} - 	&#8377;${item.price} </p>
                             <button class="removeBtn">Remove</button>`;

        // Attach the event listener to the "Remove" button
        const removeBtn = itemDiv.querySelector('.removeBtn');
        removeBtn.addEventListener('click', () => removeItem(item.id));

        cartItemsDiv.appendChild(itemDiv);
    });

    // Display total price with two decimal places
    totalPriceSpan.textContent = `	₹${totalPrice.toFixed(2)}`;

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

