
const tripNameInput = document.getElementById("tripName");
const destinationInput = document.getElementById("destination");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const createTripButton = document.getElementById("createTrip");
const tripsContainer = document.getElementById("trips");
const grandTotalDisplay = document.getElementById("grandTotal");

let trips = [];
let grandTotal = 0;

function updateGrandTotal() {
    grandTotalDisplay.textContent = grandTotal.toFixed(2);
}

function formatDate(date) {
    if (!date) return "Not set";

    const parts = date.split("-");
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// CREATE TRIP
createTripButton.addEventListener("click", function () {
    const tripName = tripNameInput.value.trim();
    const destination = destinationInput.value.trim();
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (!tripName || !destination) {
        alert("Please enter both trip name and destination!");
        return;
    }

    if (startDate && endDate && endDate < startDate) {
        alert("End date cannot be before the start date!");
        return;
    }

    const trip = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        tripName,
        destination,
        startDate,
        endDate
    };

    trips.push(trip);
    localStorage.setItem("savedTrips", JSON.stringify(trips));

    renderTrip(trip);

    tripNameInput.value = "";
    destinationInput.value = "";
    startDateInput.value = "";
    endDateInput.value = "";
});

// DISPLAY A TRIP
function renderTrip(trip) {
    const tripCard = document.createElement("div");
    tripCard.className = "trip-card";

    const title = document.createElement("h3");
    title.textContent = "✈️ " + trip.tripName;

    const place = document.createElement("p");
    place.textContent = "📍 " + trip.destination;


    const dates = document.createElement("p");

    let durationText = "";

    if (trip.startDate && trip.endDate) {
        const start = trip.startDate.split("-").map(Number);
        const end = trip.endDate.split("-").map(Number);

        const startTime = Date.UTC(start[0], start[1] - 1, start[2]);
        const endTime = Date.UTC(end[0], end[1] - 1, end[2]);

        const days = Math.round(
            (endTime - startTime) / (1000 * 60 * 60 * 24)
        ) + 1;

        durationText = ` | ⏳ ${days} day${days === 1 ? "" : "s"}`;
    }

    dates.textContent =
        `📅 Start: ${formatDate(trip.startDate)} | End: ${formatDate(trip.endDate)}${durationText}`;


    const itineraryTitle = document.createElement("h4");
    itineraryTitle.textContent = "Trip Activities";
    itineraryTitle.style.fontWeight = "bold";
    itineraryTitle.style.color = "#38bdf8";
    itineraryTitle.style.fontSize = "18px";
    itineraryTitle.style.marginTop = "20px";

    const activityInput = document.createElement("input");
    activityInput.placeholder = "Add an activity...";
    activityInput.style.marginTop = "10px";

    const addActivityButton = document.createElement("button");
    addActivityButton.textContent = "Add Activity";
    addActivityButton.style.marginLeft = "8px";

    const activityList = document.createElement("ul");

    const progressText = document.createElement("p");
    progressText.textContent = "Trip Activities Progress: 0%";

    const progressBar = document.createElement("progress");
    progressBar.value = 0;
    progressBar.max = 100;
    progressBar.style.width = "100%";
    progressBar.style.margin = "10px 0 15px";

    function updateProgress() {
        const activities = activityList.querySelectorAll(
            ".activity-item input[type='checkbox']"
        );

        const completed = activityList.querySelectorAll(
            ".activity-item input[type='checkbox']:checked"
        );

        const percentage = activities.length
            ? Math.round((completed.length / activities.length) * 100)
            : 0;

        progressBar.value = percentage;
        progressText.textContent = `Itinerary Progress: ${percentage}%`;
    }

    activityList.style.margin = "15px 0 15px 20px";

    // ADD ACTIVITY
    addActivityButton.addEventListener("click", function () {
        const activity = activityInput.value.trim();

        if (!activity) {
            alert("Please enter an activity!");
            return;
        }

        const activityItem = document.createElement("li");
        activityItem.className = "activity-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        const activityText = document.createElement("span");
        activityText.textContent = activity;


        checkbox.addEventListener("change", function () {
            activityText.style.textDecoration =
                checkbox.checked ? "line-through" : "none";

            updateProgress();
        });


        const deleteActivityButton = document.createElement("button");
        deleteActivityButton.textContent = "×";
        deleteActivityButton.className = "delete-activity";

        deleteActivityButton.addEventListener("click", function () {
            activityItem.remove();
        });

        activityItem.append(
            checkbox,
            activityText,
            deleteActivityButton
        );

        activityList.appendChild(activityItem);
        updateProgress();
        activityInput.value = "";
    });

    // EXPENSE SECTION
    const expenseTitle = document.createElement("h4");
    expenseTitle.textContent = "Trip Expenses";

    const expenseName = document.createElement("input");
    expenseName.placeholder = "Expense name (e.g. Hotel)";

    const expenseAmount = document.createElement("input");
    expenseAmount.type = "number";
    expenseAmount.placeholder = "Amount in ₹";

    const addExpenseButton = document.createElement("button");
    addExpenseButton.textContent = "Add Expense";

    const tripExpenseTotal = document.createElement("p");
    tripExpenseTotal.textContent = "Trip Total: ₹0.00";

    const tripExpenseList = document.createElement("ul");

    let thisTripTotal = 0;

    const tripExpenseStorageKey =
        `tripExpenses_${trip.tripName}_${trip.destination}`;

    let thisTripExpenses = JSON.parse(
        localStorage.getItem(tripExpenseStorageKey) || "[]"
    );

    // DISPLAY AN EXPENSE
    function renderExpense(expense) {
        const expenseItem = document.createElement("li");

        const expenseText = document.createElement("span");
        expenseText.textContent =
            `${expense.name} — ₹${Number(expense.amount).toFixed(2)}`;

        const deleteExpenseButton = document.createElement("button");
        deleteExpenseButton.textContent = "Delete";
        deleteExpenseButton.style.marginLeft = "10px";

        deleteExpenseButton.addEventListener("click", function () {
            thisTripTotal -= Number(expense.amount);
            grandTotal -= Number(expense.amount);

            thisTripTotal = Math.max(0, thisTripTotal);
            grandTotal = Math.max(0, grandTotal);

            tripExpenseTotal.textContent =
                `Trip Total: ₹${thisTripTotal.toFixed(2)}`;

            updateGrandTotal();
            expenseItem.remove();

            const index = thisTripExpenses.indexOf(expense);

            if (index !== -1) {
                thisTripExpenses.splice(index, 1);
            }

            localStorage.setItem(
                tripExpenseStorageKey,
                JSON.stringify(thisTripExpenses)
            );
        });

        expenseItem.append(expenseText, deleteExpenseButton);
        tripExpenseList.appendChild(expenseItem);

        thisTripTotal += Number(expense.amount);
        grandTotal += Number(expense.amount);
    }

    // RESTORE SAVED EXPENSES
    thisTripExpenses.forEach(function (expense) {
        renderExpense(expense);
    });

    tripExpenseTotal.textContent =
        `Trip Total: ₹${thisTripTotal.toFixed(2)}`;

    updateGrandTotal();

    // ADD EXPENSE
    addExpenseButton.addEventListener("click", function () {
        const name = expenseName.value.trim();
        const amount = Number(expenseAmount.value);

        if (
            !name ||
            expenseAmount.value === "" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            alert("Enter a valid expense name and amount!");
            return;
        }

        const expense = { name, amount };

        thisTripExpenses.push(expense);

        localStorage.setItem(
            tripExpenseStorageKey,
            JSON.stringify(thisTripExpenses)
        );

        renderExpense(expense);

        tripExpenseTotal.textContent =
            `Trip Total: ₹${thisTripTotal.toFixed(2)}`;

        updateGrandTotal();

        expenseName.value = "";
        expenseAmount.value = "";
    });

    // DELETE TRIP
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete Trip";
    deleteButton.className = "delete-button";

    deleteButton.addEventListener("click", function () {
        grandTotal -= thisTripTotal;
        grandTotal = Math.max(0, grandTotal);
        updateGrandTotal();

        tripCard.remove();

        trips = trips.filter(function (savedTrip) {
            return savedTrip.id !== trip.id;
        });

        localStorage.setItem("savedTrips", JSON.stringify(trips));

        if (tripsContainer.children.length === 0) {
            tripsContainer.innerHTML =
                "<p>No trips yet. Create your first trip!</p>";
        }
    });

    tripCard.append(
        title,
        place,
        dates,
        itineraryTitle,
        progressText,
        progressBar,
        activityInput,
        addActivityButton,
        activityList,
        expenseTitle,
        expenseName,
        expenseAmount,
        addExpenseButton,
        tripExpenseTotal,
        tripExpenseList,
        deleteButton
    );

    if (tripsContainer.querySelector("p") &&
        tripsContainer.children.length === 1 &&
        tripsContainer.textContent.includes("No trips yet.")) {
        tripsContainer.innerHTML = "";
    }

    tripsContainer.appendChild(tripCard);
}

// MAP
const map = L.map("map").setView([15.2993, 74.1240], 8);

L.tileLayer("https://tile.openstreetmap.de/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

L.marker([15.2993, 74.1240])
    .addTo(map)
    .bindPopup("Goa, India")
    .openPopup();

// MAP SEARCH
document.getElementById("searchMap").addEventListener("click", async function () {
    const place = document.getElementById("mapSearch").value.trim();

    if (!place) {
        alert("Please enter a destination!");
        return;
    }

    try {
        const url =
            "https://nominatim.openstreetmap.org/search?format=json&q=" +
            encodeURIComponent(place);

        const response = await fetch(url);
        const results = await response.json();

        if (results.length === 0) {
            alert("Destination not found!");
            return;
        }

        const latitude = Number(results[0].lat);
        const longitude = Number(results[0].lon);

        map.setView([latitude, longitude], 12);

        L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(place)
            .openPopup();

    } catch (error) {
        alert("Unable to search right now. Please try again.");
    }
});

// RESTORE SAVED TRIPS
const savedTrips = JSON.parse(
    localStorage.getItem("savedTrips") || "[]"
);

trips = savedTrips.map(function (trip, index) {
    return {
        ...trip,
        id: trip.id || `old-trip-${index}-${Date.now()}`
    };
});

localStorage.setItem("savedTrips", JSON.stringify(trips));

if (trips.length > 0) {
    tripsContainer.innerHTML = "";

    trips.forEach(function (trip) {
        renderTrip(trip);
    });
}

// DESTINATION DETAILS
function showDestination(place) {
    const details = {
        Goa: {
            description: "Enjoy beautiful beaches, sunsets, water sports and coastal food.",
            image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80"
        },
        Jaipur: {
            description: "Explore royal palaces, historic forts and colorful markets.",
            image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80"
        },
        Agra: {
            description: "Visit the world-famous Taj Mahal and explore Mughal history.",
            image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80"
        },
        Manali: {
            description: "Enjoy snowy mountains, scenic valleys and adventure activities.",
            image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80"
        }
    };

    if (!details[place]) return;

    document.getElementById("modal-title").textContent = place + ", India";
    document.getElementById("modal-description").textContent =
        details[place].description;
    document.getElementById("modal-image").src = details[place].image;
    document.getElementById("modal-image").alt = place + " photo";
    document.getElementById("destination-modal").style.display = "flex";
}

// DESTINATION CARD CLICK
document.querySelectorAll(".destination-card").forEach(function (card) {
    card.addEventListener("click", function () {
        const heading = card.querySelector("h3");

        if (!heading) return;

        const place = heading.textContent.split(",")[0].trim();
        showDestination(place);
    });
});

// CLOSE POPUP
function closeDestination() {
    document.getElementById("destination-modal").style.display = "none";
}

const destinationModal = document.getElementById("destination-modal");

destinationModal.addEventListener("click", function (event) {
    if (event.target === destinationModal) {
        closeDestination();
    }
});

document.querySelector(".close-modal").addEventListener("click", closeDestination);
document.getElementById("close-modal-button").addEventListener("click", closeDestination);

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeDestination();
    }
});


// Supabase connection
const supabaseUrl = "https://epjwawcwqiufqgrnsdar.supabase.co";

const supabasePublishableKey = "PASTE_YOUR_PUBLISHABLE_KEY_HEREsb_publishable_15L5lUga3A-gxDXEuAwjDw_mxDU-Z6S";

const supabaseClient = window.supabase.createClient(
    supabaseUrl,
    supabasePublishableKey
);


document.getElementById("signup-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const message = document.getElementById("auth-message");

    message.textContent = "Creating your account...";

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        message.textContent = error.message;
        return;
    }

    message.textContent = data.user && data.user.identities?.length === 0
        ? "An account with this email may already exist."
        : "Signup successful! Check your email to confirm your account.";
});
