async function login() {
    console.log("✔ LOGIN() CALLED");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        console.log("LOGIN RESPONSE:", data);

        if (!res.ok) {
            alert(data.message);
            return;
        }

        // Save token + user in browser
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login successful!");
        window.location.href = "index.html"; // redirect to homepage

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        alert("Cannot connect to server.");
    }
}
