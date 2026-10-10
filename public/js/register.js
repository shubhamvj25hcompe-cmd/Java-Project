// ==========================================
// PASSWORD VISIBILITY
// ==========================================

function toggleRegisterPassword(inputId) {

    const input =
        document.getElementById(inputId);

    if (input.type === "password") {

        input.type = "text";

    } else {

        input.type = "password";

    }
}


// ==========================================
// REGISTRATION
// ==========================================

document
    .getElementById("registerForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();


        const message =
            document.getElementById("registerMessage");

        const button =
            document.getElementById("registerBtn");


        // ==================================
        // GET FORM VALUES
        // ==================================

        const fullName =
            document.getElementById("fullName")
                .value
                .trim();

        const email =
            document.getElementById("email")
                .value
                .trim();

        const phone =
            document.getElementById("phone")
                .value
                .trim();

        const dob =
            document.getElementById("dob")
                .value;

        const rollNumber =
            document.getElementById("rollNumber")
                .value
                .trim();

        const division =
            document.getElementById("division")
                .value
                .trim();

        const password =
            document.getElementById("password")
                .value;

        const confirmPassword =
            document.getElementById("confirmPassword")
                .value;

        const terms =
            document.getElementById("terms")
                .checked;


        // ==================================
        // VALIDATION
        // ==================================

        if (password.length < 6) {

            message.textContent =
                "Password must contain at least 6 characters.";

            return;
        }


        if (password !== confirmPassword) {

            message.textContent =
                "Passwords do not match.";

            return;
        }


        if (!/^[0-9]{10}$/.test(phone)) {

            message.textContent =
                "Enter a valid 10-digit phone number.";

            return;
        }


        if (!terms) {

            message.textContent =
                "Please accept the terms.";

            return;
        }


        // ==================================
        // DISABLE BUTTON
        // ==================================

        button.disabled = true;

        button.querySelector("span").textContent =
            "Creating Account...";

        message.textContent = "";


        // ==================================
        // SEND TO SERVER
        // ==================================

        try {

            const response = await fetch(
                "/api/register",
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        fullName,
                        email,
                        phone,
                        dob,
                        rollNumber,
                        division,
                        password

                    })

                }
            );


            const data =
                await response.json();


            // ==================================
            // ERROR
            // ==================================

            if (!data.success) {

                message.textContent =
                    data.message;

                button.disabled = false;

                button.querySelector("span").textContent =
                    "Create Account";

                return;
            }


            // ==================================
            // SUCCESS
            // ==================================

            message.textContent =
                "Account created successfully!";


            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 1200);


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            message.textContent =
                "Unable to connect to server.";

            button.disabled = false;

            button.querySelector("span").textContent =
                "Create Account";

        }

    });