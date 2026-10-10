// ==========================================
// LOAD LOGGED-IN STUDENT
// ==========================================

async function loadStudent() {

    try {

        const response = await fetch("/api/me");
        const data = await response.json();

        // ----------------------------------
        // NOT LOGGED IN
        // ----------------------------------

        if (!response.ok || !data.success) {

            window.location.href = "index.html";
            return;

        }

        // ----------------------------------
        // MAKE SURE IT IS A STUDENT
        // ----------------------------------

        if (data.user.role !== "student") {

            window.location.href = "index.html";
            return;

        }

        // ----------------------------------
        // SHOW STUDENT NAME
        // ----------------------------------

        document.getElementById(
            "welcomeMessage"
        ).textContent =
            `Welcome, ${data.user.fullName}!`;


        // ----------------------------------
        // LOAD SUBJECTS
        // ----------------------------------

        loadSubjects();


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        window.location.href = "index.html";

    }

}


// ==========================================
// LOAD SUBJECTS
// ==========================================

async function loadSubjects() {

    const subjectGrid =
        document.getElementById(
            "dashboardSubjectGrid"
        );


    try {

        const response =
            await fetch("/api/student-subjects");

        const data =
            await response.json();


        console.log(
            "SUBJECTS FROM DATABASE:",
            data
        );


        // ----------------------------------
        // ERROR
        // ----------------------------------

        if (!response.ok || !data.success) {

            subjectGrid.innerHTML = `
                <p>
                    Unable to load subjects.
                </p>
            `;

            return;

        }


        // ----------------------------------
        // NO SUBJECTS
        // ----------------------------------

        if (
            !data.subjects ||
            data.subjects.length === 0
        ) {

            subjectGrid.innerHTML = `
                <p>
                    No subjects available.
                </p>
            `;

            return;

        }


        // ----------------------------------
        // CLEAR LOADING
        // ----------------------------------

        subjectGrid.innerHTML = "";


        // ----------------------------------
        // CREATE SUBJECT CARDS
        // ----------------------------------

        data.subjects.forEach(
            function(subject) {

                const card =
                    document.createElement("div");


                card.className =
                    "subject-card";


                // ----------------------------------
                // MAKE CARD CLICKABLE
                // ----------------------------------

                card.style.cursor = "pointer";


                card.innerHTML = `

                    <span>
                        ${subject.subject_code}
                    </span>

                    <p>
                        ${subject.subject_name}
                    </p>

                    <small>
                        View available exams →
                    </small>

                `;


                // ----------------------------------
                // OPEN SUBJECT EXAMS
                // ----------------------------------

                card.addEventListener(
                    "click",
                    function() {

                        window.location.href =
                            `student-exams.html?subjectId=${subject.id}`;

                    }
                );


                subjectGrid.appendChild(card);

            }
        );


    } catch (error) {

        console.error(
            "Subject loading error:",
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
// START DASHBOARD
// ==========================================

loadStudent();
