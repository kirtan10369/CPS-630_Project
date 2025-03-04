$(document).ready(function() {
    // Load all sneakers initially
    loadSneakers("");

    // Make sneaker images draggable
    $("#sneakerList").on("mouseenter", ".sneaker-img", function() {
        $(this).draggable({ 
            revert: "invalid", 
            helper: "clone",
            cursor: "move"
        });
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
    $("#sneakerList").on("click", ".add-to-cart", function() {
        var Item_Id = $(this).data("id");
        addToCart(Item_Id);
    });

    // Remove from cart
    $("#cart-items").on("click", ".remove-from-cart", function() {
        var Item_Id = $(this).data("id");
        removeFromCart(Item_Id);
    });

    updateCartDisplay();

    // Search functionality
    $("#searchForm").on("submit", function(event) {
        event.preventDefault();
        let searchTerm = $("#searchInput").val();
        loadSneakers(searchTerm);
    });

    $("#searchInput").on("input", function() {
        let searchTerm = $(this).val();
        loadSneakers(searchTerm);
    });

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

    // Bootstrap form validation for payment form
    $('#paymentForm').on('submit', function(event) {
        if (!this.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
            $(this).addClass('was-validated');
        }
    });
});

// Dynamic items object populated from database
const items = {};

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
            } else {
                console.warn(`Item with ID ${id} not found in items object`);
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

    const cardPattern = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvPattern = /^\d{3,4}$/;

    $("#payment-error").text("");

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

    let order = JSON.parse(localStorage.getItem("currentOrder"));
    order["Payment-Code"] = "CC-" + Date.now();
    order["Receipt-Id"] = Date.now() + 2;
    order["Truck-Id"] = 1;
    localStorage.setItem("order_" + order["Order-Id"], JSON.stringify(order));
    localStorage.removeItem("cart");
    localStorage.removeItem("currentOrder");
    window.location.href = "confirmation.html";
}

// Load sneakers from database
function loadSneakers(searchTerm) {
    console.log("Loading sneakers with search term:", searchTerm);
    $.get("search.php", { q: searchTerm }, function(data) {
        console.log("Search response:", data);
        $("#sneakerList").html("");
        if (data.error) {
            $("#sneakerList").html(`<p class='text-danger text-center'>Error: ${data.error}</p>`);
            console.error("Search error:", data.error);
        } else if (data.length === 0) {
            $("#sneakerList").html("<p class='text-muted text-center'>No sneakers found for '${searchTerm}'.</p>");
        } else {
            data.forEach(item => {
                items[item.Item_Id] = { // Update items object with database data
                    Item_Id: item.Item_Id,
                    Item_name: item.Item_name,
                    Price: item.Price,
                    Image: item.Image
                };
                $("#sneakerList").append(
                    `<div class="col-md-4 col-sm-6 sneaker-item" data-name="${item.Item_name}">
                        <div class="card h-100 text-center">
                            <img src="${item.Image}" class="card-img-top mx-auto mt-3 sneaker-img" data-id="${item.Item_Id}" alt="${item.Item_name}">
                            <div class="card-body">
                                <h5 class="card-title">${item.Item_name}</h5>
                                <p class="card-text">$${item.Price}</p>
                                <button class="btn btn-primary add-to-cart" data-id="${item.Item_Id}"><i class="fas fa-cart-plus"></i> Add to Cart</button>
                            </div>
                        </div>
                    </div>`
                );
            });
            console.log("Loaded items:", items);
        }
    }, "json").fail(function(xhr, status, error) {
        $("#sneakerList").html(`<p class='text-danger text-center'>Failed to load sneakers: ${status} - ${error}. Check console.</p>`);
        console.error("AJAX error details:", {
            status: status,
            error: error,
            responseText: xhr.responseText,
            statusCode: xhr.status
        });
    });
}
