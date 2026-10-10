let currentLoginType = "student";


// ==========================================
// SELECT STUDENT / ADMIN
// ==========================================

function selectLoginType(type) {

    currentLoginType = type;

    document.getElementById("loginType").value = type;

    const studentBtn =
        document.getElementById("studentBtn");

    const adminBtn =
        document.getElementById("adminBtn");

    studentBtn.classList.remove("active");
    adminBtn.classList.remove("active");

    if (type === "student") {

        studentBtn.classList.add("active");

    } else {

        adminBtn.classList.add("active");

    }
}


// ==========================================
// SHOW / HIDE PASSWORD
// ==========================================

function togglePassword() {

    const password =
        document.getElementById("password");

    if (password.type === "password") {

        password.type = "text";

    } else {

        password.type = "password";

    }
}


// ==========================================
// LOGIN
// ==========================================

document
    .getElementById("loginForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("message");

        message.textContent = "Checking login...";

        try {

            const response = await fetch("/api/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    email: email,

                    password: password,

                    loginType: currentLoginType

                })

            });

            const data = await response.json();

            if (!data.success) {

                message.textContent = data.message;

                return;
            }

            message.textContent =
                "Login successful!";

            // ----------------------------------
            // REDIRECT
            // ----------------------------------

            setTimeout(() => {

                if (data.role === "student") {

                    window.location.href =
                        "student-dashboard.html";

                } else {

                    window.location.href =
                        "admin-dashboard.html";

                }

            }, 700);

        } catch (error) {

            console.error(error);

            message.textContent =
                "Unable to connect to server.";

        }

    });