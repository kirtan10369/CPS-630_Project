$(document).ready(function() {
    $(".item").draggable({ revert: "invalid", helper: "clone" });
    $("#cart").droppable({
        accept: ".item",
        drop: function(event, ui) {
            var Item_Id = ui.draggable.data("id");
            addToCart(Item_Id);
        }
    });
    $(".add-to-cart").click(function() {
        var Item_Id = $(this).data("id");
        addToCart(Item_Id);
    });
    $("#cart-items").on("click", ".remove-from-cart", function() {
        var Item_Id = $(this).data("id");
        removeFromCart(Item_Id);
    });
    updateCartDisplay();
});

const items = {
    1: { Item_Id: 1, Item_name: "Adidas Sneaker", Price: 79, Department_Code: "ADI" },
    2: { Item_Id: 2, Item_name: "Nike Sneaker", Price: 99, Department_Code: "NKE" },
    3: { Item_Id: 3, Item_name: "New Balance Sneaker", Price: 89, Department_Code: "NB" }
};

function signup(event) {
    event.preventDefault();
    let user = {
        "User-Id": Date.now(),
        "Login-Id": $("#Login-Id").val(),
        "Password": $("#Password").val(),
        "Name": $("#Name").val(),
        "Tel-no": $("#Tel-no").val(),
        "Address": $("#Address").val(),
        "Email": $("#Email").val(),
        "Balance": 0
    };
    localStorage.setItem("user_" + user["Login-Id"], JSON.stringify(user));
    alert("Sign-up successful! Please sign in.");
    window.location.href = "signin.html";
}

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

function addToCart(Item_Id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(parseInt(Item_Id));
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartDisplay();
}

function removeFromCart(Item_Id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let index = cart.indexOf(parseInt(Item_Id));
    if (index !== -1) {
        cart.splice(index, 1);
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
            if (item) {
                $("#cart-items").append(
                    `<div class="cart-item">
                        <span>${item.Item_name} - $${item.Price}</span>
                        <button class="remove-from-cart" data-id="${item.Item_Id}"><i class="fas fa-trash"></i> Remove</button>
                    </div>`
                );
                total += item.Price;
            }
        });
    }
    $("#cart-count").text(cart.length);
    $("#cart-total").text(total.toFixed(2));
}

function processCheckout() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let Total_Price = cart.reduce((sum, id) => sum + (items[id] ? items[id].Price : 0), 0);
    let userId = localStorage.getItem("loggedIn");
    let order = {
        "Order-Id": Date.now(),
        "Date-issued": new Date().toISOString().split("T")[0],
        "Date-received": $("#Date-received").val(),
        "Total_Price": Total_Price,
        "User-Id": userId,
        "Trip-Id": Date.now() + 1
    };
    $("#invoice").html(`<h2>Invoice</h2><p>Total: $${Total_Price.toFixed(2)}</p>`);
    localStorage.setItem("currentOrder", JSON.stringify(order));
    window.location.href = "payment.html";
}

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
    let origin = $("#Source-Code").val();
    $("#map").show();
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: { lat: 43.6532, lng: -79.3832 }
    });
    var directionsService = new google.maps.DirectionsService();
    var directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    var request = {
        origin: origin,
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

function processPayment(event) {
    event.preventDefault();
    let cardNumber = $("#card-number").val();
    if (cardNumber.length >= 16) {
        let order = JSON.parse(localStorage.getItem("currentOrder"));
        order["Payment-Code"] = "CC-" + Date.now();
        order["Receipt-Id"] = Date.now() + 2;
        order["Truck-Id"] = 1;
        localStorage.setItem("order_" + order["Order-Id"], JSON.stringify(order));
        localStorage.removeItem("cart");
        localStorage.removeItem("currentOrder");
        window.location.href = "confirmation.html";
    } else {
        alert("Invalid card number!");
    }
}

$(document).ready(function() {
    if (window.location.pathname.includes("confirmation.html")) {
        let latestOrderKey = Object.keys(localStorage).filter(k => k.startsWith("order_")).pop();
        let order = JSON.parse(localStorage.getItem(latestOrderKey));
        $("#confirmation-details").html(
            `<p id='order_id'>Order-Id: ${order["Order-Id"]}</p>` +
            `<p>Total: $${order["Total_Price"].toFixed(2)}</p>` +
            `<p>Delivery: ${order["Date-received"]} ${$("#Delivery-Time").val()}</p>` +
            `<p>Truck-Id: ${order["Truck-Id"]}</p>`
        );
    }
});