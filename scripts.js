$(document).ready(function() {
    // Drag-and-Drop for Shopping Cart
    $(".item").draggable({ revert: "invalid", helper: "clone" });
    $("#cart").droppable({
        accept: ".item",
        drop: function(event, ui) {
            var Item_Id = ui.draggable.data("id");
            addToCart(Item_Id);
        }
    });

    // Add to Cart Button Click
    $(".add-to-cart").click(function() {
        var Item_Id = $(this).data("id");
        addToCart(Item_Id);
    });

    // Remove from Cart Button Click (delegated event)
    $("#cart-items").on("click", ".remove-from-cart", function() {
        var Item_Id = $(this).data("id");
        removeFromCart(Item_Id);
    });

    // Initialize cart display
    updateCartDisplay();
});

// Simulated Items (Matches Item table)
const items = {
    1: { Item_Id: 1, Item_name: "Smartphone", Price: 299, Department_Code: "ELEC" },
    2: { Item_Id: 2, Item_name: "Laptop", Price: 799, Department_Code: "ELEC" },
    3: { Item_Id: 3, Item_name: "Headphones", Price: 99, Department_Code: "ELEC" }
};

// Sign-Up (POST simulation - Aligns with User table)
function signup(event) {
    event.preventDefault();
    let user = {
        "User-Id": Date.now(), // Unique ID for now
        "Login-Id": $("#Login-Id").val(),
        "Password": $("#Password").val(),
        "Name": $("#Name").val(),
        "Tel-no": $("#Tel-no").val(),
        "Address": $("#Address").val(),
        "Email": $("#Email").val(),
        "Balance": 0 // Default balance
    };
    localStorage.setItem("user_" + user["Login-Id"], JSON.stringify(user));
    alert("Sign-up successful! Please sign in.");
    window.location.href = "signin.html";
}

// Sign-In (GET simulation)
function signin(event) {
    event.preventDefault();
    let loginId = $("#signinLoginId").val();
    let password = $("#signinPassword").val();
    let user = JSON.parse(localStorage.getItem("user_" + loginId));
    if (user && user["Password"] === password) {
        localStorage.setItem("loggedIn", user["User-Id"]);
        window.location.href = "shopping.html";
    } else {
        alert("Invalid credentials!");
    }
}

// Cart Management (Prepares for Shopping/Order tables)
function addToCart(Item_Id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(parseInt(Item_Id)); // Ensure Item_Id is an integer
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartDisplay();
}

function removeFromCart(Item_Id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let index = cart.indexOf(parseInt(Item_Id));
    if (index !== -1) {
        cart.splice(index, 1); // Remove one occurrence of the item
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let total = 0;
    $("#cart-items").html("");
    if (cart.length === 0) {
        $("#cart-items").html("<p>Your cart is empty.</p>");
    } else {
        cart.forEach(id => {
            let item = items[id];
            if (item) { // Check if item exists
                $("#cart-items").append(
                    `<div class="cart-item">
                        <span>${item.Item_name} - $${item.Price}</span>
                        <button class="remove-from-cart" data-id="${item.Item_Id}">Remove</button>
                    </div>`
                );
                total += item.Price;
            }
        });
    }
    $("#cart-count").text(cart.length); // Update total number of items
    $("#cart-total").text(total.toFixed(2)); // Update total price
}

// Checkout (Prepares for Order/Trip tables)
function processCheckout() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let Total_Price = cart.reduce((sum, id) => sum + (items[id] ? items[id].Price : 0), 0);
    let userId = localStorage.getItem("loggedIn");
    let order = {
        "Order-Id": Date.now(), // Unique ID
        "Date-issued": new Date().toISOString().split("T")[0],
        "Date-received": $("#Date-received").val(),
        "Total_Price": Total_Price,
        "User-Id": userId,
        "Trip-Id": Date.now() + 1 // Simulated Trip-Id
    };
    $("#invoice").html(`<h2>Invoice</h2><p>Total: $${Total_Price.toFixed(2)}</p>`);
    localStorage.setItem("currentOrder", JSON.stringify(order));
    window.location.href = "payment.html";
}

// Google Maps (Prepares for Trip table)
function initMap() {
    if (typeof google === 'undefined' || !google.maps) {
        alert("Google Maps API failed to load. Please check your API key and internet connection.");
        return;
    }
    let destination = $("#Destination-Code").val().trim();
    if (!destination) {
        alert("Please enter a delivery address!");
        return;
    }
    let origin = $("#Source-Code").val(); // Dynamically use selected store address
    $("#map").show();
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: { lat: 43.6532, lng: -79.3832 } // Toronto
    });
    var directionsService = new google.maps.DirectionsService();
    var directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    var request = {
        origin: origin, // Use the selected store address
        destination: destination,
        travelMode: "DRIVING"
    };
    directionsService.route(request, function(result, status) {
        if (status === "OK") {
            directionsRenderer.setDirections(result);
        } else {
            alert("Couldn’t find a route—check your addresses! (Error: " + status + ")");
            console.error("Directions request failed: " + status, result);
        }
    });
}

// Payment (Prepares for Order/Shopping tables)
function processPayment(event) {
    event.preventDefault();
    let cardNumber = $("#card-number").val();
    if (cardNumber.length >= 16) {
        let order = JSON.parse(localStorage.getItem("currentOrder"));
        order["Payment-Code"] = "CC-" + Date.now(); // Simulated payment code
        order["Receipt-Id"] = Date.now() + 2; // Simulated receipt ID
        order["Truck-Id"] = 1; // Simulated truck ID
        localStorage.setItem("order_" + order["Order-Id"], JSON.stringify(order));
        localStorage.removeItem("cart");
        localStorage.removeItem("currentOrder");
        window.location.href = "confirmation.html";
    } else {
        alert("Invalid card number!");
    }
}

// Confirmation
$(document).ready(function() {
    if (window.location.pathname.includes("confirmation.html")) {
        let latestOrderKey = Object.keys(localStorage).filter(k => k.startsWith("order_")).pop();
        let order = JSON.parse(localStorage.getItem(latestOrderKey));
        $("#confirmation-details").html(
            `<p>Order-Id: ${order["Order-Id"]}</p>` +
            `<p>Total: $${order["Total_Price"].toFixed(2)}</p>` +
            `<p>Delivery: ${order["Date-received"]} ${$("#Delivery-Time").val()}</p>` +
            `<p>Truck-Id: ${order["Truck-Id"]}</p>`
        );
    }
});