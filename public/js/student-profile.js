// ==========================================
// STUDENT PROFILE
// ==========================================


// ==========================================
// LOAD STUDENT PROFILE
// ==========================================

async function loadStudentProfile() {

    try {

        const response =
            await fetch("/api/me");

        const data =
            await response.json();


        // ----------------------------------
        // CHECK LOGIN
        // ----------------------------------

        if (!data.success) {

            window.location.href =
                "index.html";

            return;
        }


        // ----------------------------------
        // CHECK STUDENT
        // ----------------------------------

        if (data.user.role !== "student") {

            window.location.href =
                "index.html";

            return;
        }


        const user =
            data.user;


        // ----------------------------------
        // PROFILE HEADER
        // ----------------------------------

        document.getElementById(
            "profileName"
        ).textContent =
            user.fullName;


        document.getElementById(
            "profileEmail"
        ).textContent =
            user.email;


        // ----------------------------------
        // FULL NAME
        // ----------------------------------

        document.getElementById(
            "fullName"
        ).textContent =
            user.fullName;


        // ----------------------------------
        // EMAIL
        // ----------------------------------

        document.getElementById(
            "email"
        ).textContent =
            user.email;


        // ----------------------------------
        // PHONE
        // ----------------------------------

        document.getElementById(
            "phone"
        ).textContent =
            user.phone || "Not available";


        // ----------------------------------
        // DATE OF BIRTH
        // ----------------------------------

        if (user.dob) {

            const date =
                new Date(user.dob);

            document.getElementById(
                "dob"
            ).textContent =
                date.toLocaleDateString("en-IN");

        } else {

            document.getElementById(
                "dob"
            ).textContent =
                "Not available";

        }


        // ----------------------------------
        // ROLL NUMBER
        // ----------------------------------

        document.getElementById(
            "rollNumber"
        ).textContent =
            user.rollNumber || "Not available";


        // ----------------------------------
        // DIVISION
        // ----------------------------------

        document.getElementById(
            "division"
        ).textContent =
            user.division || "Not available";


        // ----------------------------------
        // EMAIL VERIFICATION STATUS
        // ----------------------------------

        const emailStatus =
            document.getElementById(
                "emailStatus"
            );

        const sendOtpBtn =
            document.getElementById(
                "sendOtpBtn"
            );


        if (user.emailVerified) {

            emailStatus.textContent =
                "Verified";

            if (sendOtpBtn) {

                sendOtpBtn.style.display =
                    "none";

            }

        } else {

            emailStatus.textContent =
                "Not Verified";

        }


        // ----------------------------------
        // PHONE VERIFICATION STATUS
        // ----------------------------------

        const phoneStatus =
            document.getElementById(
                "phoneStatus"
            );


        if (phoneStatus) {

            if (user.phoneVerified) {

                phoneStatus.textContent =
                    "Verified";

            } else {

                phoneStatus.textContent =
                    "Not Verified";

            }

        }


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        alert(
            "Unable to load student profile."
        );

    }

}


// ==========================================
// SEND EMAIL OTP
// ==========================================

async function sendEmailOTP() {

    const button =
        document.getElementById(
            "sendOtpBtn"
        );


    try {

        // ----------------------------------
        // DISABLE BUTTON
        // ----------------------------------

        if (button) {

            button.disabled = true;

            button.textContent =
                "Sending OTP...";

        }


        // ----------------------------------
        // SEND REQUEST
        // ----------------------------------

        const response =
            await fetch(
                "/api/send-email-otp",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );


        // ----------------------------------
        // GET SERVER RESPONSE
        // ----------------------------------

        const data =
            await response.json();


        console.log(
            "OTP SERVER RESPONSE:",
            data
        );


        // ----------------------------------
        // SERVER ERROR
        // ----------------------------------

        if (!response.ok || !data.success) {

            alert(
                "OTP ERROR:\n\n" +
                (data.message ||
                    "Unable to send OTP.")
            );


            if (button) {

                button.disabled = false;

                button.textContent =
                    "Verify Email";

            }

            return;
        }


        // ----------------------------------
        // OPEN OTP POPUP
        // ----------------------------------

        const modal =
            document.getElementById(
                "otpModal"
            );


        if (modal) {

            modal.style.display =
                "flex";

        }


        const otpMessage =
            document.getElementById(
                "otpMessage"
            );


        if (otpMessage) {

            otpMessage.textContent =
                "OTP sent successfully. Check your email.";

        }


        // ----------------------------------
        // FOCUS OTP INPUT
        // ----------------------------------

        const otpInput =
            document.getElementById(
                "otpInput"
            );


        if (otpInput) {

            otpInput.value = "";

            otpInput.focus();

        }


        if (button) {

            button.textContent =
                "OTP Sent";

        }


    } catch (error) {

        // ----------------------------------
        // NETWORK / JAVASCRIPT ERROR
        // ----------------------------------

        console.error(
            "Send OTP error:",
            error
        );


        alert(
            "OTP ERROR:\n\n" +
            error.message
        );


        if (button) {

            button.disabled = false;

            button.textContent =
                "Verify Email";

        }

    }

}


// ==========================================
// CLOSE OTP POPUP
// ==========================================

function closeOTPModal() {

    const modal =
        document.getElementById(
            "otpModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// ==========================================
// VERIFY EMAIL OTP
// ==========================================

async function verifyEmailOTP() {

    const otpInput =
        document.getElementById(
            "otpInput"
        );

    const verifyButton =
        document.getElementById(
            "verifyOtpBtn"
        );

    const otpMessage =
        document.getElementById(
            "otpMessage"
        );


    const otp =
        otpInput.value.trim();


    // ----------------------------------
    // CHECK OTP FORMAT
    // ----------------------------------

    if (!/^\d{6}$/.test(otp)) {

        otpMessage.textContent =
            "Please enter a valid 6-digit OTP.";

        return;

    }


    try {

        verifyButton.disabled = true;

        verifyButton.textContent =
            "Verifying...";


        // ----------------------------------
        // SEND OTP TO SERVER
        // ----------------------------------

        const response =
            await fetch(
                "/api/verify-email-otp",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            otp: otp
                        })
                }
            );


        const data =
            await response.json();


        console.log(
            "VERIFY OTP RESPONSE:",
            data
        );


        // ----------------------------------
        // OTP ERROR
        // ----------------------------------

        if (!response.ok || !data.success) {

            otpMessage.textContent =
                data.message ||
                "Invalid OTP.";


            verifyButton.disabled =
                false;

            verifyButton.textContent =
                "Verify OTP";

            return;
        }


        // ----------------------------------
        // SUCCESS
        // ----------------------------------

        otpMessage.textContent =
            "Email verified successfully!";


        otpMessage.style.color =
            "#4ade80";


        document.getElementById(
            "emailStatus"
        ).textContent =
            "Verified";


        // Hide verify button
        const sendOtpBtn =
            document.getElementById(
                "sendOtpBtn"
            );


        if (sendOtpBtn) {

            sendOtpBtn.style.display =
                "none";

        }


        verifyButton.textContent =
            "Verified";


        // Close popup after 1.5 seconds
        setTimeout(() => {

            closeOTPModal();

        }, 1500);


    } catch (error) {

        console.error(
            "Verify OTP error:",
            error
        );


        otpMessage.textContent =
            "Unable to verify OTP.";

        verifyButton.disabled =
            false;

        verifyButton.textContent =
            "Verify OTP";

    }

}


// ==========================================
// START
// ==========================================

loadStudentProfile();