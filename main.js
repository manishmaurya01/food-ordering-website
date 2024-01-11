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
