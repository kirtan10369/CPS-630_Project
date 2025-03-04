$(document).ready(function() {
    $(".sneaker-img").draggable({ 
        revert: "invalid", 
        helper: "clone",
        cursor: "move"
    });

    // Make cart droppable
    $("#cart").droppable({
        accept: ".sneaker-img",
        drop: function(event, ui) {
            var Item_Id = ui.draggable.data("id");
            addToCart(Item_Id);
        }
    });

    // Add to cart button click
    $(".add-to-cart").click(function() {
        var Item_Id = $(this).data("id");
        addToCart(Item_Id);
    });

    // Remove from cart
    $("#cart-items").on("click", ".remove-from-cart", function() {
        var Item_Id = $(this).data("id");
        removeFromCart(Item_Id);
    });
    updateCartDisplay();


    if (window.location.pathname.includes("confirmation.html")) {
        let latestOrderKey = Object.keys(localStorage).filter(k => k.startsWith("order_")).pop();
        let order = JSON.parse(localStorage.getItem(latestOrderKey));
        let cart = JSON.parse(localStorage.getItem("cartBeforePayment")) || [];

        $("#order-id").text(order["Order-Id"]);
        $("#date-issued").text(order["Date-issued"]);
        $("#total-price").text(order["Total_Price"].toFixed(2));

        $("#source-address").text(order["Source-Address"] || "N/A");
        $("#destination-address").text(order["Destination-Address"] || "N/A");
        $("#delivery-date-time").text(`${order["Date-received"]} at ${order["Delivery-Time"] || "N/A"}`);
        $("#truck-id").text(order["Truck-Id"]);
        cart.forEach(id => {
            let item = items[id];
            if (item) {
                $("#order-items").append(
                    `<div class="list-group-item d-flex justify-content-between align-items-center">
                        <span><img src="${item.Image}" alt="${item.Item_name}" class="cart-item-img me-2">${item.Item_name}</span>
                        <span>$${item.Price.toFixed(2)}</span>
                    </div>`
                );
            }
        });
    }
});

const items = {
    1: { Item_Id: 1, Item_name: "Adidas", Price: 79, Department_Code: "SNEAKERS", Image: "Adidas.jpg" },
    2: { Item_Id: 2, Item_name: "Nike", Price: 99, Department_Code: "SNEAKERS", Image: "Nike.jpeg" },
    3: { Item_Id: 3, Item_name: "New Balance", Price: 89, Department_Code: "SNEAKERS", Image: "New-balance.jpeg" }
};

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
let total = 0;
function updateCartDisplay() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    $("#cart-items").html("");
    if (cart.length === 0) {
        $("#cart-items").html("<p class='text-muted'>Your cart is empty.</p>");
    } else {
        cart.forEach(id => {
            let item = items[id];
            if (item) {
                $("#cart-items").append(
                    `<div class="cart-item d-flex justify-content-between align-items-center mb-2">
                        <span><img src="${item.Image}" alt="${item.Item_name}" class="cart-item-img me-2">${item.Item_name} - $${item.Price}</span>
                        <button class="btn btn-danger btn-sm remove-from-cart" data-id="${item.Item_Id}"><i class="fas fa-trash"></i> Remove</button>
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
        "Delivery-Time": $("#Delivery-Time").val(),
        "Total_Price": total,
        "User-Id": userId,
        "Trip-Id": Date.now() + 1,
        "Source-Address": $("#Source-Code").val(),
        "Destination-Address": $("#Destination-Code").val()
    };
    $("#invoice").html(`<h3 class="text-primary">Invoice</h3><p>Total: $${Total_Price.toFixed(2)}</p>`);
    localStorage.setItem("currentOrder", JSON.stringify(order));
    localStorage.setItem("cartBeforePayment", JSON.stringify(cart));
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
    let form = document.getElementById("paymentForm");
    let cardNumber = $("#card-number").val();
    let expiry = $("#expiry").val();
    let cvv = $("#cvv").val();

    // Define regex patterns
    const cardPattern = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvPattern = /^\d{3,4}$/;

    // Reset error message
    $("#payment-error").text("");

    // Validate inputs
    if (!cardPattern.test(cardNumber)) {
        $("#payment-error").text("Invalid card number. Use format xxxx-xxxx-xxxx-xxxx (e.g., 1234-5678-9012-3456).");
        $("#card-number").addClass("is-invalid");
        return;
    }
    if (!expiryPattern.test(expiry)) {
        $("#payment-error").text("Invalid expiry date. Use format MM/DD (e.g., 12/25).");
        $("#expiry").addClass("is-invalid");
        return;
    }
    if (!cvvPattern.test(cvv)) {
        $("#payment-error").text("Invalid CVV. Must be 3 or 4 digits (e.g., 123 or 1234).");
        $("#cvv").addClass("is-invalid");
        return;
    }

    // If all validations pass, proceed with payment
    let order = JSON.parse(localStorage.getItem("currentOrder"));
    order["Payment-Code"] = "CC-" + Date.now();
    order["Receipt-Id"] = Date.now() + 2;
    order["Truck-Id"] = 1;
    localStorage.setItem("order_" + order["Order-Id"], JSON.stringify(order));
    localStorage.removeItem("cart");
    localStorage.removeItem("currentOrder");
    window.location.href = "confirmation.html";
}

