
const tripNameInput = document.getElementById("tripName");
const destinationInput = document.getElementById("destination");
const createTripButton = document.getElementById("createTrip");
const tripsContainer = document.getElementById("trips");

let trips = [];
let grandTotal = 0;
const grandTotalDisplay = document.getElementById("grandTotal");

function updateGrandTotal() {
    grandTotalDisplay.textContent = grandTotal.toFixed(2);
}
createTripButton.addEventListener("click", function () {
    const tripName = tripNameInput.value.trim();
    const destination = destinationInput.value.trim();

    if (tripName === "" || destination === "") {
        alert("Please enter both trip name and destination!");
        return;
    }

    const tripCard = document.createElement("div");
    const tripExpenseStorageKey =
    `tripExpenses_${tripName}_${destination}`;
    let thisTripExpenses = JSON.parse(
    localStorage.getItem(tripExpenseStorageKey) || "[]"
);
    tripCard.className = "trip-card";

    const title = document.createElement("h3");
    title.textContent = "✈️ " + tripName;

    const place = document.createElement("p");
    place.textContent = "📍 " + destination;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete Trip";
    deleteButton.className = "delete-button";

    deleteButton.addEventListener("click", function () {
        grandTotal -= thisTripTotal;
updateGrandTotal();
        tripCard.remove();
        trips = trips.filter(trip =>
    !(trip.tripName === tripName && trip.destination === destination)
);

localStorage.setItem("savedTrips", JSON.stringify(trips));

        if (tripsContainer.children.length === 0) {
            tripsContainer.innerHTML =
                "<p>No trips yet. Create your first trip!</p>";
        }
    });

    
    const itineraryTitle = document.createElement("h4");
    itineraryTitle.textContent = "My Itinerary";
    itineraryTitle.style.marginTop = "20px";

    const activityInput = document.createElement("input");
    activityInput.placeholder = "Add an activity...";
    activityInput.style.marginTop = "10px";

    const addActivityButton = document.createElement("button");
    addActivityButton.textContent = "Add Activity";
    addActivityButton.style.marginLeft = "8px";

    const activityList = document.createElement("ul");
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
    activityList.style.margin = "15px 0 15px 20px";

    addExpenseButton.addEventListener("click", function () {
    const name = expenseName.value.trim();
    const amount = Number(expenseAmount.value);

    if (name === "" || expenseAmount.value === "" ||
        !Number.isFinite(amount) || amount <= 0) {
        alert("Enter a valid expense name and amount!");
        return;
    }

    const expenseItem = document.createElement("li");
    const expenseText = document.createElement("span");
    expenseText.textContent = `${name} — ₹${amount.toFixed(2)}`;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.style.marginLeft = "10px";

    deleteButton.addEventListener("click", function () {
        thisTripTotal -= amount;
        grandTotal -= amount;

        tripExpenseTotal.textContent =
            `Trip Total: ₹${thisTripTotal.toFixed(2)}`;

        updateGrandTotal();
        expenseItem.remove();
        thisTripExpenses = thisTripExpenses.filter(
    expense => !(expense.name === name && expense.amount === amount)
);

localStorage.setItem(
    tripExpenseStorageKey,
    JSON.stringify(thisTripExpenses)
);
    });

    expenseItem.append(expenseText, deleteButton);
    tripExpenseList.appendChild(expenseItem);
    thisTripExpenses.push({ name, amount });

localStorage.setItem(
    tripExpenseStorageKey,
    JSON.stringify(thisTripExpenses)
);

    thisTripTotal += amount;
    grandTotal += amount;

    tripExpenseTotal.textContent =
        `Trip Total: ₹${thisTripTotal.toFixed(2)}`;

    updateGrandTotal();

    expenseName.value = "";
    expenseAmount.value = "";
});

    addActivityButton.addEventListener("click", function () {
        const activity = activityInput.value.trim();

        if (activity === "") {
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


        activityInput.value = "";
    });

  tripCard.append(
    title,
    place,
    itineraryTitle,
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


    if (tripsContainer.textContent.includes("No trips yet.")) {
    tripsContainer.innerHTML = "";
}

    tripsContainer.appendChild(tripCard);
    trips.push({ tripName, destination });
localStorage.setItem("savedTrips", JSON.stringify(trips));

    tripNameInput.value = "";
    destinationInput.value = "";
});

const map = L.map("map").setView([15.2993, 74.1240], 8);


L.tileLayer("https://tile.openstreetmap.de/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


L.marker([15.2993, 74.1240])
    .addTo(map)
    .bindPopup("Goa, India")
    .openPopup();



document.getElementById("searchMap").addEventListener("click", async function () {
    const place = document.getElementById("mapSearch").value.trim();

    if (place === "") {
        alert("Please enter a destination!");
        return;
    }

    try {
        const url = "https://nominatim.openstreetmap.org/search?format=json&q="
            + encodeURIComponent(place);

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





const savedTrips = JSON.parse(
    localStorage.getItem("savedTrips") || "[]"
);

savedTrips.forEach(function (trip) {
    tripNameInput.value = trip.tripName;
    destinationInput.value = trip.destination;
    createTripButton.click();
});


