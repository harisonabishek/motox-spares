// ============================================================
// MOTOX - BIKE SPARE PARTS E-COMMERCE
// Frontend JavaScript + MongoDB Order Connection
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    // ========================================================
    // PRODUCT DATA
    // ========================================================

    const products = [
        {
            id: "ENG001",
            name: "Premium Engine Oil",
            category: "Engine",
            price: 899,
            oldPrice: 1099,
            image: "https://images.unsplash.com/photo-1619771914272-e3c1a1a4d3c3?auto=format&fit=crop&w=700&q=80"
        },
        {
            id: "BRK001",
            name: "Performance Brake Pads",
            category: "Brakes",
            price: 1299,
            oldPrice: 1599,
            image: "https://images.unsplash.com/photo-1558980664-10ea8a0e6a72?auto=format&fit=crop&w=700&q=80"
        },
        {
            id: "ELE001",
            name: "LED Headlight",
            category: "Electrical",
            price: 1499,
            oldPrice: 1899,
            image: "https://images.unsplash.com/photo-1558980663-3686c4a3f5d7?auto=format&fit=crop&w=700&q=80"
        },
        {
            id: "ACC001",
            name: "Premium Riding Gloves",
            category: "Accessories",
            price: 799,
            oldPrice: 999,
            image: "https://images.unsplash.com/photo-1558981033-0f0309284409?auto=format&fit=crop&w=700&q=80"
        },
        {
            id: "ENG002",
            name: "Performance Air Filter",
            category: "Engine",
            price: 699,
            oldPrice: 899,
            image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&q=80"
        },
        {
            id: "BRK002",
            name: "Front Disc Brake",
            category: "Brakes",
            price: 2199,
            oldPrice: 2599,
            image: "https://images.unsplash.com/photo-1558980664-10ea8a0e6a72?auto=format&fit=crop&w=700&q=80"
        },
        {
            id: "ELE002",
            name: "Motorcycle Battery",
            category: "Electrical",
            price: 2499,
            oldPrice: 2999,
            image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=700&q=80"
        },
        {
            id: "ACC002",
            name: "Motorcycle Phone Holder",
            category: "Accessories",
            price: 599,
            oldPrice: 799,
            image: "https://images.unsplash.com/photo-1558980394-0c2f6f6f6c56?auto=format&fit=crop&w=700&q=80"
        }
    ];


    // ========================================================
    // DOM ELEMENTS
    // ========================================================

    const productGrid = document.getElementById("productGrid");
    const noProducts = document.getElementById("noProducts");

    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");

    const cartButton = document.getElementById("cartButton");
    const cartSidebar = document.getElementById("cartSidebar");
    const cartOverlay = document.getElementById("cartOverlay");
    const closeCart = document.getElementById("closeCart");

    const cartItemsContainer = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const cartTotal = document.getElementById("cartTotal");

    const checkoutButton = document.getElementById("checkoutButton");

    const mobileMenu = document.getElementById("mobileMenu");
    const navigation = document.getElementById("navigation");

    const newsletterForm = document.getElementById("newsletterForm");

    const toast = document.getElementById("toast");


    // ========================================================
    // CART
    // ========================================================

    let cart = JSON.parse(localStorage.getItem("motoxCart")) || [];


    // ========================================================
    // SAVE CART
    // ========================================================

    function saveCart() {
        localStorage.setItem("motoxCart", JSON.stringify(cart));
    }


    // ========================================================
    // FORMAT PRICE
    // ========================================================

    function formatPrice(price) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(price);
    }


    // ========================================================
    // SHOW TOAST
    // ========================================================

    function showToast(message) {

        if (!toast) return;

        const toastText = toast.querySelector("span");

        if (toastText) {
            toastText.textContent = message;
        }

        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }


    // ========================================================
    // DISPLAY PRODUCTS
    // ========================================================

    function displayProducts(productList = products) {

        if (!productGrid) return;

        productGrid.innerHTML = "";

        if (productList.length === 0) {

            if (noProducts) {
                noProducts.style.display = "block";
            }

            return;
        }

        if (noProducts) {
            noProducts.style.display = "none";
        }


        productList.forEach(product => {

            const productCard = document.createElement("div");

            productCard.className = "product-card";

            productCard.innerHTML = `
                <div class="product-image">
                    <img 
                        src="${product.image}" 
                        alt="${product.name}"
                        loading="lazy"
                    >

                    <span class="product-category">
                        ${product.category}
                    </span>
                </div>

                <div class="product-info">

                    <h3>${product.name}</h3>

                    <div class="product-price">
                        <strong>${formatPrice(product.price)}</strong>

                        <del>${formatPrice(product.oldPrice)}</del>
                    </div>

                    <button 
                        class="add-to-cart"
                        data-id="${product.id}"
                    >
                        <i class="fa-solid fa-cart-plus"></i>
                        Add to Cart
                    </button>

                </div>
            `;

            productGrid.appendChild(productCard);
        });


        // Add to cart buttons
        document.querySelectorAll(".add-to-cart").forEach(button => {

            button.addEventListener("click", () => {

                const productId = button.dataset.id;

                addToCart(productId);

            });

        });
    }


    // ========================================================
    // ADD TO CART
    // ========================================================

    function addToCart(productId) {

        const product = products.find(
            item => item.id === productId
        );

        if (!product) return;


        const existingItem = cart.find(
            item => item.productId === productId
        );


        if (existingItem) {

            existingItem.quantity++;

        } else {

            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            });

        }


        saveCart();

        updateCart();

        showToast(`${product.name} added to cart`);

    }


    // ========================================================
    // UPDATE CART
    // ========================================================

    function updateCart() {

        if (!cartItemsContainer) return;


        // Cart count
        const totalQuantity = cart.reduce(
            (total, item) => total + item.quantity,
            0
        );

        if (cartCount) {
            cartCount.textContent = totalQuantity;
        }


        // Empty cart
        if (cart.length === 0) {

            cartItemsContainer.innerHTML = `
                <div class="empty-cart">

                    <i class="fa-solid fa-cart-shopping"></i>

                    <h3>Your cart is empty</h3>

                    <p>Add some bike parts to get started.</p>

                </div>
            `;

            if (cartTotal) {
                cartTotal.textContent = "₹0";
            }

            return;
        }


        // Cart items
        cartItemsContainer.innerHTML = "";


        cart.forEach(item => {

            const cartItem = document.createElement("div");

            cartItem.className = "cart-item";

            cartItem.innerHTML = `

                <div class="cart-item-image">
                    <img 
                        src="${item.image}" 
                        alt="${item.name}"
                    >
                </div>

                <div class="cart-item-details">

                    <h4>${item.name}</h4>

                    <strong>${formatPrice(item.price)}</strong>

                    <div class="cart-item-controls">

                        <button 
                            class="quantity-btn decrease"
                            data-id="${item.productId}"
                        >
                            −
                        </button>

                        <span>${item.quantity}</span>

                        <button 
                            class="quantity-btn increase"
                            data-id="${item.productId}"
                        >
                            +
                        </button>

                        <button 
                            class="remove-item"
                            data-id="${item.productId}"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>

                </div>
            `;

            cartItemsContainer.appendChild(cartItem);

        });


        // Calculate total
        const total = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );


        if (cartTotal) {
            cartTotal.textContent = formatPrice(total);
        }


        // Increase quantity
        document.querySelectorAll(".increase").forEach(button => {

            button.addEventListener("click", () => {

                const item = cart.find(
                    item => item.productId === button.dataset.id
                );

                if (item) {
                    item.quantity++;
                }

                saveCart();
                updateCart();

            });

        });


        // Decrease quantity
        document.querySelectorAll(".decrease").forEach(button => {

            button.addEventListener("click", () => {

                const item = cart.find(
                    item => item.productId === button.dataset.id
                );

                if (!item) return;


                if (item.quantity > 1) {

                    item.quantity--;

                } else {

                    cart = cart.filter(
                        cartItem =>
                            cartItem.productId !== button.dataset.id
                    );

                }


                saveCart();
                updateCart();

            });

        });


        // Remove item
        document.querySelectorAll(".remove-item").forEach(button => {

            button.addEventListener("click", () => {

                cart = cart.filter(
                    item =>
                        item.productId !== button.dataset.id
                );

                saveCart();

                updateCart();

                showToast("Product removed from cart");

            });

        });

    }


    // ========================================================
    // OPEN CART
    // ========================================================

    function openCart() {

        if (cartSidebar) {
            cartSidebar.classList.add("active");
        }

        if (cartOverlay) {
            cartOverlay.classList.add("active");
        }

        document.body.style.overflow = "hidden";
    }


    // ========================================================
    // CLOSE CART
    // ========================================================

    function closeCartSidebar() {

        if (cartSidebar) {
            cartSidebar.classList.remove("active");
        }

        if (cartOverlay) {
            cartOverlay.classList.remove("active");
        }

        document.body.style.overflow = "";
    }


    if (cartButton) {
        cartButton.addEventListener("click", openCart);
    }

    if (closeCart) {
        closeCart.addEventListener("click", closeCartSidebar);
    }

    if (cartOverlay) {
        cartOverlay.addEventListener("click", closeCartSidebar);
    }


    // ========================================================
    // PRODUCT FILTERS
    // ========================================================

    document.querySelectorAll(".filter").forEach(filterButton => {

        filterButton.addEventListener("click", () => {

            document.querySelectorAll(".filter").forEach(button => {
                button.classList.remove("active");
            });

            filterButton.classList.add("active");


            const category = filterButton.dataset.filter;


            if (category === "All") {

                displayProducts(products);

            } else {

                const filteredProducts = products.filter(
                    product =>
                        product.category === category
                );

                displayProducts(filteredProducts);

            }

        });

    });


    // ========================================================
    // CATEGORY CARDS
    // ========================================================

    document.querySelectorAll(".category-card").forEach(card => {

        card.addEventListener("click", () => {

            const category = card.dataset.category;

            const filterButton = document.querySelector(
                `.filter[data-filter="${category}"]`
            );


            if (filterButton) {
                filterButton.click();
            }


            const productsSection =
                document.getElementById("products");

            if (productsSection) {
                productsSection.scrollIntoView({
                    behavior: "smooth"
                });
            }

        });

    });


    // ========================================================
    // SEARCH
    // ========================================================

    function performSearch() {

        const searchTerm =
            searchInput.value.trim().toLowerCase();


        if (!searchTerm) {

            displayProducts(products);

            return;
        }


        const results = products.filter(product => {

            return (
                product.name.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm)
            );

        });


        displayProducts(results);

    }


    if (searchButton) {
        searchButton.addEventListener(
            "click",
            performSearch
        );
    }


    if (searchInput) {

        searchInput.addEventListener("keydown", event => {

            if (event.key === "Enter") {
                performSearch();
            }

        });

    }


    // ========================================================
    // CHECKOUT
    // ========================================================

    if (checkoutButton) {

        checkoutButton.addEventListener("click", () => {

            if (cart.length === 0) {

                showToast("Your cart is empty");

                return;
            }


            openCheckoutForm();

        });

    }


    // ========================================================
    // CHECKOUT FORM
    // ========================================================

    function openCheckoutForm() {

        const existingCheckout =
            document.getElementById("checkoutModal");

        if (existingCheckout) {
            existingCheckout.remove();
        }


        const total = cart.reduce(
            (sum, item) =>
                sum + item.price * item.quantity,
            0
        );


        const modal = document.createElement("div");

        modal.id = "checkoutModal";

        modal.innerHTML = `

            <div class="checkout-modal-overlay">

                <div class="checkout-modal">

                    <button 
                        type="button"
                        class="checkout-close"
                        id="checkoutClose"
                    >
                        <i class="fa-solid fa-xmark"></i>
                    </button>

                    <h2>Complete Your Order</h2>

                    <p class="checkout-subtitle">
                        Enter your details to place your order.
                    </p>


                    <form id="checkoutForm">

                        <h3>Customer Details</h3>

                        <div class="checkout-field">

                            <label>Full Name</label>

                            <input
                                type="text"
                                id="customerName"
                                placeholder="Enter your full name"
                                required
                            >

                        </div>


                        <div class="checkout-field">

                            <label>Email</label>

                            <input
                                type="email"
                                id="customerEmail"
                                placeholder="Enter your email"
                                required
                            >

                        </div>


                        <div class="checkout-field">

                            <label>Phone Number</label>

                            <input
                                type="tel"
                                id="customerPhone"
                                placeholder="Enter your phone number"
                                pattern="[0-9]{10}"
                                maxlength="10"
                                required
                            >

                        </div>


                        <h3>Delivery Address</h3>


                        <div class="checkout-field">

                            <label>Address</label>

                            <textarea
                                id="customerAddress"
                                placeholder="House No, Street, Area"
                                required
                            ></textarea>

                        </div>


                        <div class="checkout-row">

                            <div class="checkout-field">

                                <label>City</label>

                                <input
                                    type="text"
                                    id="customerCity"
                                    placeholder="City"
                                    required
                                >

                            </div>


                            <div class="checkout-field">

                                <label>State</label>

                                <input
                                    type="text"
                                    id="customerState"
                                    placeholder="State"
                                    required
                                >

                            </div>

                        </div>


                        <div class="checkout-field">

                            <label>PIN Code</label>

                            <input
                                type="text"
                                id="customerPincode"
                                placeholder="6-digit PIN code"
                                pattern="[0-9]{6}"
                                maxlength="6"
                                required
                            >

                        </div>


                        <h3>Payment Method</h3>


                        <div class="payment-options">

                            <label class="payment-option">

                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="COD"
                                    checked
                                >

                                <span>
                                    <i class="fa-solid fa-money-bill"></i>
                                    Cash on Delivery
                                </span>

                            </label>


                            <label class="payment-option">

                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="ONLINE"
                                >

                                <span>
                                    <i class="fa-solid fa-credit-card"></i>
                                    Online Payment
                                    <em class="rzp-badge">Razorpay</em>
                                </span>

                            </label>

                        </div>


                        <div class="checkout-summary">

                            <span>Order Total</span>

                            <strong>
                                ${formatPrice(total)}
                            </strong>

                        </div>


                        <button
                            type="submit"
                            class="place-order-btn"
                            id="placeOrderButton"
                        >
                            Place Order
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>

                    </form>

                </div>

            </div>
        `;


        document.body.appendChild(modal);


        // Close checkout
        document
            .getElementById("checkoutClose")
            .addEventListener("click", () => {

                modal.remove();

            });


        // Submit order
        document
            .getElementById("checkoutForm")
            .addEventListener("submit", submitOrder);

    }


    // ========================================================
    // SUBMIT ORDER TO MONGODB
    // ========================================================

    async function submitOrder(event) {

        event.preventDefault();

        const button = document.getElementById("placeOrderButton");
        button.disabled = true;
        button.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Processing...
        `;

        const name = document.getElementById("customerName").value.trim();
        const email = document.getElementById("customerEmail").value.trim();
        const phone = document.getElementById("customerPhone").value.trim();
        const address = document.getElementById("customerAddress").value.trim();
        const city = document.getElementById("customerCity").value.trim();
        const state = document.getElementById("customerState").value.trim();
        const pincode = document.getElementById("customerPincode").value.trim();
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

        const totalAmount = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const orderData = {
            customer: { name, email, phone },
            shippingAddress: { address, city, state, pincode },
            items: cart.map(item => ({
                productId: String(item.productId),
                name: item.name,
                price: Number(item.price),
                quantity: Number(item.quantity),
                image: item.image || ""
            })),
            totalAmount: Number(totalAmount),
            paymentMethod,
            orderStatus: "Pending"
        };

        try {
            // Load Razorpay only when ONLINE payment is selected.
            if (paymentMethod === "ONLINE") {
                await loadRazorpay();

                const createResponse = await fetch("/api/payment/create-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: totalAmount })
                });

                const paymentOrder = await createResponse.json();

                if (!createResponse.ok || !paymentOrder.success) {
                    throw new Error(paymentOrder.message || "Unable to start online payment");
                }

                const options = {
                    key: paymentOrder.keyId,
                    amount: paymentOrder.order.amount,
                    currency: paymentOrder.order.currency,
                    name: "MOTOX",
                    description: "Bike Spare Parts Order",
                    order_id: paymentOrder.order.id,
                    prefill: { name, email, contact: phone },
                    theme: { color: "#ff5722" },
                    handler: async function (payment) {
                        try {
                            const verifyResponse = await fetch("/api/payment/verify", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    razorpay_order_id: payment.razorpay_order_id,
                                    razorpay_payment_id: payment.razorpay_payment_id,
                                    razorpay_signature: payment.razorpay_signature,
                                    orderData
                                })
                            });

                            const result = await verifyResponse.json();

                            if (!verifyResponse.ok || !result.success) {
                                throw new Error(result.message || "Payment verification failed");
                            }

                            cart = [];
                            saveCart();
                            updateCart();

                            const modal = document.getElementById("checkoutModal");
                            if (modal) modal.remove();
                            closeCartSidebar();
                            showOrderSuccess(result.order);
                        } catch (error) {
                            console.error("Payment verification error:", error);
                            alert("Payment was received, but order verification failed. Please contact MOTOX support.");
                            button.disabled = false;
                            button.innerHTML = `Place Order <i class="fa-solid fa-arrow-right"></i>`;
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            button.disabled = false;
                            button.innerHTML = `Place Order <i class="fa-solid fa-arrow-right"></i>`;
                        }
                    }
                };

                const razorpay = new Razorpay(options);
                razorpay.on("payment.failed", function (response) {
                    console.error("Razorpay payment failed:", response.error);
                    alert(response.error.description || "Payment failed. Please try again.");
                    button.disabled = false;
                    button.innerHTML = `Place Order <i class="fa-solid fa-arrow-right"></i>`;
                });
                razorpay.open();
                return;
            }

            // COD: use the existing order API.
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to place order");
            }

            cart = [];
            saveCart();
            updateCart();

            const modal = document.getElementById("checkoutModal");
            if (modal) modal.remove();
            closeCartSidebar();
            showOrderSuccess(result.order);

        } catch (error) {
            console.error("Order submission error:", error);
            alert(error.message || "Unable to place your order. Please make sure MongoDB and the Node.js server are running.");
            button.disabled = false;
            button.innerHTML = `Place Order <i class="fa-solid fa-arrow-right"></i>`;
        }
    }

    // Load Razorpay without changing your original HTML.
    function loadRazorpay() {
        return new Promise((resolve, reject) => {
            if (window.Razorpay) {
                resolve();
                return;
            }

            const existing = document.querySelector('script[data-motox-razorpay="true"]');
            if (existing) {
                existing.addEventListener("load", resolve, { once: true });
                existing.addEventListener("error", () => reject(new Error("Razorpay could not be loaded")), { once: true });
                return;
            }

            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.dataset.motoxRazorpay = "true";
            script.onload = resolve;
            script.onerror = () => reject(new Error("Razorpay could not be loaded"));
            document.head.appendChild(script);
        });
    }

    // ========================================================
    // ORDER SUCCESS
    // ========================================================

    function showOrderSuccess(order) {

        const orderId =
            order?._id
                ? order._id
                : "Successfully Placed";


        const successModal =
            document.createElement("div");


        successModal.id = "orderSuccessModal";


        successModal.innerHTML = `

            <div class="checkout-modal-overlay">

                <div class="order-success">

                    <div class="success-icon">

                        <i class="fa-solid fa-check"></i>

                    </div>


                    <h2>Order Placed Successfully!</h2>


                    <p>
                        Thank you for shopping with MOTOX.
                    </p>


                    <div class="order-number">

                        <span>Order ID</span>

                        <strong>${orderId}</strong>

                    </div>


                    <p>
                        We will contact you shortly
                        regarding your order.
                    </p>


                    <button
                        id="successClose"
                        class="place-order-btn"
                    >
                        Continue Shopping
                    </button>

                </div>

            </div>
        `;


        document.body.appendChild(successModal);


        document
            .getElementById("successClose")
            .addEventListener("click", () => {

                successModal.remove();

            });

    }


    // ========================================================
    // NEWSLETTER
    // ========================================================

    if (newsletterForm) {

        newsletterForm.addEventListener("submit", event => {

            event.preventDefault();

            const email =
                document.getElementById("email").value.trim();


            if (!email) return;


            showToast(
                "Thank you for subscribing!"
            );


            newsletterForm.reset();

        });

    }


    // ========================================================
    // MOBILE MENU
    // ========================================================

    if (mobileMenu && navigation) {

        mobileMenu.addEventListener("click", () => {

            navigation.classList.toggle("active");

        });


        document
            .querySelectorAll("#navigation a")
            .forEach(link => {

                link.addEventListener("click", () => {

                    navigation.classList.remove("active");

                });

            });

    }


    // ========================================================
    // INITIALIZE WEBSITE
    // ========================================================

    displayProducts();

    updateCart();

});