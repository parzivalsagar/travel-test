function book() {
    let booking = {
        id: Math.floor(Math.random() * 100000),
        phone: phone.value,
        date: date.value
    };
    localStorage.setItem("booking", JSON.stringify(booking));
    window.location.href = "receipt.html";
}
