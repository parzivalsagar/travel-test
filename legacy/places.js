const placesData = [
  {
    name: "Mullayanagiri",
    price: 1500,
    distance: 20,
    image: "images/mullayanagiri.jpg",
    quote: "Climb the mountains and feel the peace."
  },
  {
    name: "Baba Budangiri",
    price: 1200,
    distance: 25,
    image: "images/bababudangiri.jpg",
    quote: "Where nature whispers serenity."
  },
  {
    name: "Hebbe Falls",
    price: 1800,
    distance: 30,
    image: "images/hebbefalls.jpg",
    quote: "Let the water wash away your worries."
  }
];

const container = document.getElementById("places");

/* RENDER CARDS */
placesData.forEach((place, index) => {
  const col = document.createElement("div");
  col.className = "col-md-4 mb-4 place-appear";
  col.style.animationDelay = `${index * 0.35}s`;

  col.innerHTML = `
    <div class="card place-card h-100">
      <img src="${place.image}" class="card-img-top" alt="${place.name}">
      <div class="card-body">
        <h5 class="card-title">${place.name}</h5>
        <p class="fst-italic">${place.quote}</p>
        <p>💰 ₹${place.price}</p>
        <p>📍 ${place.distance} km</p>

        <!-- SINGLE SMART BUTTON -->
        <button
          class="btn btn-success w-100 mt-2"
          onclick="handleJourney('${place.name}', this)"
          data-added="false"
        >
          Add to Journey
        </button>
      </div>
    </div>
  `;

  container.appendChild(col);
});

/* SMART BUTTON LOGIC */
function handleJourney(placeName, btn) {
  const added = btn.getAttribute("data-added");

  // FIRST CLICK → ADD
  if (added === "false") {
    // Toast
    const toast = document.getElementById("toast");
    const msg = document.getElementById("toast-msg");

    msg.textContent = `🌿 ${placeName} added to your journey`;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);

    // Change button state
    btn.textContent = "View My Journey →";
    btn.classList.remove("btn-success");
    btn.classList.add("btn-outline-success");
    btn.setAttribute("data-added", "true");

  }
  // SECOND CLICK → GO TO JOURNEY
  else {
    window.location.href = "cart.html";
  }
}
