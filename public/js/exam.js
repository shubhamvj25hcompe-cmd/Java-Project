// ==========================================
// EXAMINATION PAGE
// ==========================================

let examDurationSeconds = 0;
let timerInterval = null;


// ==========================================
// LOAD EXAM
// ==========================================

async function loadExam() {

    const questionsContainer =
        document.getElementById("questionsContainer");

    const examTitle =
        document.getElementById("examTitle");

    const subjectName =
        document.getElementById("subjectName");

    const examInfo =
        document.getElementById("examInfo");

    const examTimer =
        document.getElementById("examTimer");

    const params =
        new URLSearchParams(window.location.search);

    const examId =
        params.get("examId");

    if (!examId) {

        questionsContainer.innerHTML = `
            <p>
                Invalid exam.
            </p>
        `;

        return;
    }

    try {

        const response =
            await fetch(
                `/api/student-exams/${examId}`
            );

        const data =
            await response.json();

        console.log(
            "EXAM DATA:",
            data
        );

        if (
            !response.ok ||
            !data.success
        ) {

            questionsContainer.innerHTML = `
                <p>
                    ${
                        data.message ||
                        "Unable to load exam."
                    }
                </p>
            `;

            return;
        }


        // ==================================
        // DISPLAY EXAM INFORMATION
        // ==================================

        examTitle.textContent =
            data.exam.exam_title;

        subjectName.textContent =
            `${data.exam.subject_code} • ${data.exam.subject_name}`;

        examInfo.textContent =
            `${data.exam.question_count} Questions • ${data.exam.total_marks} Marks`;


        // ==================================
        // START TIMER
        // ==================================

        examDurationSeconds =
            data.exam.duration_minutes * 60;

        startTimer(examTimer);


        // ==================================
        // LOAD QUESTIONS
        // ==================================

        questionsContainer.innerHTML = "";

        data.questions.forEach(
            (question, index) => {

                const questionBox =
                    document.createElement("div");

                questionBox.className =
                    "exam-question";

                questionBox.innerHTML = `

                    <h3>
                        Question ${index + 1}
                    </h3>

                    <p>
                        ${question.question_text}
                    </p>

                    <label>
                        <input
                            type="radio"
                            name="question_${question.id}"
                            value="A"
                        >
                        ${question.option_a}
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="question_${question.id}"
                            value="B"
                        >
                        ${question.option_b}
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="question_${question.id}"
                            value="C"
                        >
                        ${question.option_c}
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="question_${question.id}"
                            value="D"
                        >
                        ${question.option_d}
                    </label>

                `;

                questionsContainer.appendChild(
                    questionBox
                );

            }
        );

    } catch (error) {

        console.error(
            "LOAD EXAM ERROR:",
            error
        );

        questionsContainer.innerHTML = `
            <p>
                Unable to connect to the server.
            </p>
        `;

    }
}


// ==========================================
// START COUNTDOWN TIMER
// ==========================================

function startTimer(timerElement) {

    updateTimerDisplay(timerElement);

    timerInterval =
        setInterval(() => {

            examDurationSeconds--;

            updateTimerDisplay(
                timerElement
            );

            // ==================================
            // TIME OVER
            // ==================================

            if (
                examDurationSeconds <= 0
            ) {

                clearInterval(
                    timerInterval
                );

                timerElement.textContent =
                    "00:00";

                alert(
                    "Time is over! Your exam will be submitted."
                );

                document
                    .getElementById("examForm")
                    .requestSubmit();

            }

        }, 1000);
}


// ==========================================
// UPDATE TIMER DISPLAY
// ==========================================

function updateTimerDisplay(timerElement) {

    const minutes =
        Math.floor(
            examDurationSeconds / 60
        );

    const seconds =
        examDurationSeconds % 60;

    timerElement.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


// ==========================================
// LOAD EXAM
// ==========================================

// ==========================================
// SUBMIT EXAM
// ==========================================

document
    .getElementById("examForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const params =
            new URLSearchParams(
                window.location.search
            );

        const examId =
            params.get("examId");

        if (!examId) {

            alert("Invalid exam.");

            return;
        }

        const submitButton =
            document.getElementById(
                "submitExamBtn"
            );

        // ==================================
        // COLLECT ANSWERS
        // ==================================

        const answers = {};

        const selectedOptions =
            document.querySelectorAll(
                'input[type="radio"]:checked'
            );

        selectedOptions.forEach(input => {

            const questionId =
                input.name.replace(
                    "question_",
                    ""
                );

            answers[questionId] =
                input.value;

        });

        // ==================================
        // CONFIRM SUBMISSION
        // ==================================

        const confirmSubmit =
            confirm(
                "Are you sure you want to submit your exam?"
            );

        if (!confirmSubmit) {

            return;

        }

        // ==================================
        // DISABLE BUTTON
        // ==================================

        submitButton.disabled = true;

        submitButton.textContent =
            "Submitting...";

        try {

            const response =
                await fetch(
                    `/api/student-exams/${examId}/submit`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                answers:
                                    answers
                            })
                    }
                );

            const data =
                await response.json();

            console.log(
                "SUBMISSION RESULT:",
                data
            );

            if (
                !response.ok ||
                !data.success
            ) {

                alert(
                    data.message ||
                    "Unable to submit exam."
                );

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Submit Exam";

                return;

            }

            // ==================================
            // STOP TIMER
            // ==================================

            if (timerInterval) {

                clearInterval(
                    timerInterval
                );

            }

            // ==================================
            // SHOW RESULT
            // ==================================

            alert(
                `Exam submitted successfully!\n\n` +
                `Score: ${data.result.score} / ${data.result.total_marks}\n` +
                `Percentage: ${data.result.percentage}%`
            );

            window.location.href =
                "student-dashboard.html";

        } catch (error) {

            console.error(
                "SUBMIT EXAM ERROR:",
                error
            );

            alert(
                "Unable to connect to the server."
            );

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Submit Exam";

        }

    });


// ==========================================
// LOAD EXAM
// ==========================================

loadExam();