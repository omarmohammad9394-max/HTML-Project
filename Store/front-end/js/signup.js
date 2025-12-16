console.log("✔ signup.js LOADED");

function signup() {
    console.log("✔ signup() FUNCTION CALLED");

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;

    if (!name || !email || !password || !confirm) {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== confirm) {
        alert("Passwords do not match.");
        return;
    }

    fetch("http://127.0.0.1:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    })
        .then(res => res.json())
        .then(data => {
            console.log("SERVER RESPONSE:", data);

            if (data.message === "Signup successful") {
                alert("Signup successful!");
                window.location.href = "login.html";
            } else {
                alert(data.message);
            }
        })
        .catch(err => {
            console.error("FETCH ERROR:", err);
            alert("Error connecting to server.");
        });
}

// 👉 MAKE THE FUNCTION GLOBAL
window.signup = signup;
