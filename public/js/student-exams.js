// ==========================================
// LOAD STUDENT EXAMS
// ==========================================

async function loadStudentExams() {

    const subjectGrid =
        document.getElementById("subjectGrid");

    const studentInfo =
        document.getElementById("studentInfo");

    try {

        // ==================================
        // GET CURRENT STUDENT
        // ==================================

        const meResponse =
            await fetch("/api/me");

        const meData =
            await meResponse.json();


        if (
            !meResponse.ok ||
            !meData.success
        ) {

            window.location.href =
                "index.html";

            return;
        }


        studentInfo.textContent =
            `Welcome, ${meData.user.fullName}`;


        // ==================================
        // CHECK FOR SUBJECT ID
        // ==================================

        const params =
            new URLSearchParams(
                window.location.search
            );

        const subjectId =
            params.get("subjectId");


        console.log(
            "SELECTED SUBJECT ID:",
            subjectId
        );


        // ==================================
        // CREATE API URL
        // ==================================

        let apiUrl =
            "/api/student-exams";


        if (subjectId) {

            apiUrl =
                `/api/student-exams?subjectId=${subjectId}`;

        }


        // ==================================
        // GET PUBLISHED EXAMS
        // ==================================

        const response =
            await fetch(apiUrl);

        const data =
            await response.json();


        console.log(
            "STUDENT EXAMS:",
            data
        );


        // ==================================
        // ERROR
        // ==================================

        if (
            !response.ok ||
            !data.success
        ) {

            if (response.status === 401) {

                window.location.href =
                    "index.html";

                return;
            }


            subjectGrid.innerHTML = `
                <p>
                    ${
                        data.message ||
                        "Unable to load exams."
                    }
                </p>
            `;

            return;
        }


        // ==================================
        // NO EXAMS
        // ==================================

        if (
            !data.exams ||
            data.exams.length === 0
        ) {

            subjectGrid.innerHTML = `
                <p>
                    No examinations are currently available
                    for this subject.
                </p>
            `;

            return;
        }


        // ==================================
        // CLEAR LOADING
        // ==================================

        subjectGrid.innerHTML = "";


        // ==================================
        // CREATE EXAM CARDS
        // ==================================

        data.exams.forEach(
            function(exam) {

                const card =
                    document.createElement("div");


                card.className =
                    "subject-card";


                card.innerHTML = `

                    <span>
                        ${exam.subject_code}
                    </span>

                    <p>
                        ${exam.subject_name}
                    </p>

                    <h3>
                        ${exam.exam_title}
                    </h3>

                    <small>
                        Duration:
                        ${exam.duration_minutes}
                        minutes
                    </small>

                    <br>

                    <small>
                        Total Marks:
                        ${exam.total_marks}
                    </small>

                    <br>

                    <small>
                        Questions:
                        ${exam.question_count}
                    </small>

                    <br><br>

                    <button
                        type="button"
                        class="dashboard-action"
                        onclick="startExam(${exam.id})"
                    >
                        Start Exam
                    </button>

                `;


                subjectGrid.appendChild(card);

            }
        );


    } catch (error) {

        console.error(
            "LOAD STUDENT EXAMS ERROR:",
            error
        );


        subjectGrid.innerHTML = `
            <p>
                Unable to connect to the server.
            </p>
        `;

    }

}


// ==========================================
// START EXAM
// ==========================================

function startExam(examId) {

    window.location.href =
        `exam.html?examId=${examId}`;

}


// ==========================================
// START
// ==========================================

loadStudentExams();