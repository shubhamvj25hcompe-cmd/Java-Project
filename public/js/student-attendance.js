async function loadStudentAttendance() {

    const totalExamsElement =
        document.getElementById("totalExams");

    const examsGivenElement =
        document.getElementById("examsGiven");

    const examsNotGivenElement =
        document.getElementById("examsNotGiven");

    const attendancePercentageElement =
        document.getElementById("attendancePercentage");

    const attendanceProgress =
        document.getElementById("attendanceProgress");

    const attendanceMessage =
        document.getElementById("attendanceMessage");

    const attendanceExamList =
        document.getElementById("attendanceExamList");

    const attendanceWelcome =
        document.getElementById("attendanceWelcome");


    try {

        // ==========================================
        // CHECK LOGGED-IN STUDENT
        // ==========================================

        const meResponse = await fetch("/api/me");

        const meData = await meResponse.json();


        if (!meResponse.ok || !meData.success) {

            window.location.href = "index.html";

            return;
        }


        if (meData.user.role !== "student") {

            window.location.href = "index.html";

            return;
        }


        attendanceWelcome.textContent =
            `Welcome, ${meData.user.fullName}`;


        // ==========================================
        // LOAD ATTENDANCE
        // ==========================================

        const response =
            await fetch("/api/student-attendance");

        const data =
            await response.json();


        console.log("ATTENDANCE DATA:", data);


        if (!response.ok || !data.success) {

            attendanceMessage.textContent =
                data.message ||
                "Unable to load attendance.";

            attendanceExamList.innerHTML =
                `<p>Unable to load examination details.</p>`;

            return;
        }


        // ==========================================
        // DISPLAY MAIN NUMBERS
        // ==========================================

        totalExamsElement.textContent =
            data.attendance.totalExams;

        examsGivenElement.textContent =
            data.attendance.examsGiven;

        examsNotGivenElement.textContent =
            data.attendance.examsNotGiven;

        attendancePercentageElement.textContent =
            `${data.attendance.percentage}%`;


        // ==========================================
        // PROGRESS BAR
        // ==========================================

        attendanceProgress.style.width =
            `${data.attendance.percentage}%`;


        // ==========================================
        // ATTENDANCE MESSAGE
        // ==========================================

        if (data.attendance.totalExams === 0) {

            attendanceMessage.textContent =
                "No examinations have been prepared yet.";

        } else {

            attendanceMessage.textContent =
                `You have given ${data.attendance.examsGiven} out of ${data.attendance.totalExams} examinations.`;
        }


        // ==========================================
        // EXAMINATION DETAILS
        // ==========================================

        if (!data.exams || data.exams.length === 0) {

            attendanceExamList.innerHTML =
                `<p>No examination records available.</p>`;

            return;
        }


        attendanceExamList.innerHTML = "";


        data.exams.forEach(exam => {

            const examCard =
                document.createElement("div");

            examCard.className =
                "attendance-exam-card";


            let statusText = "";

            if (exam.given) {

                statusText = "✓ Given";

            } else {

                statusText = "✗ Not Given";

            }


            examCard.innerHTML = `

                <div>

                    <h3>
                        ${exam.subject_code}
                        - ${exam.exam_title}
                    </h3>

                    <p>
                        ${exam.subject_name}
                    </p>

                </div>


                <div
                    class="attendance-status
                    ${exam.given ? "given" : "not-given"}">

                    ${statusText}

                </div>

            `;


            attendanceExamList.appendChild(examCard);

        });


    } catch (error) {

        console.error(
            "ATTENDANCE ERROR:",
            error
        );

        attendanceMessage.textContent =
            "Unable to connect to the server.";

        attendanceExamList.innerHTML =
            `<p>Unable to connect to the server.</p>`;
    }
}


// ==========================================
// LOGOUT
// ==========================================

document
    .getElementById("logoutBtn")
    .addEventListener("click", async function () {

        try {

            await fetch("/api/logout", {
                method: "POST"
            });

        } catch (error) {

            console.error(error);

        }

        window.location.href = "index.html";

    });


// ==========================================
// START
// ==========================================

loadStudentAttendance();