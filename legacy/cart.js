let cart = JSON.parse(localStorage.getItem("cart")) || [];
let div = document.getElementById("cart");
let total = 0;

cart.forEach(p => {
    total += p.price;
    div.innerHTML += `
    <div class="card mb-3 p-3">
      <h5>${p.name}</h5>
      <p>₹${p.price}</p>
    </div>
  `;
});

div.innerHTML += `<h4 class="text-center">Total Amount: ₹${total}</h4>`;
