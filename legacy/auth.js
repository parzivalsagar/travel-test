function register() {
    let user = {
        name: name.value,
        email: email.value,
        password: password.value
    };
    localStorage.setItem("user", JSON.stringify(user));
    alert("Account created successfully!");
}

function login() {
    let user = JSON.parse(localStorage.getItem("user"));
    if (user && user.email === email.value && user.password === password.value) {
        window.location.href = "home.html";
    } else {
        alert("Invalid login!");
    }
}
