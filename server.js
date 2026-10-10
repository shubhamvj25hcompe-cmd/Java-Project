const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const session = require("express-session");
const path = require("path");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

require("dotenv").config();

// ==========================================
// APP CONFIGURATION
// ==========================================

const app = express();
const PORT = 3000;

// ==========================================
// EMAIL CONFIGURATION - BREVO
// ==========================================

const emailTransporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ==========================================
// DATABASE CONFIGURATION
// ==========================================

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "smart_attendance",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "project_java_super_secret_key",

        resave: false,
        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60 * 2
        }
    })
);

// ==========================================
// SERVE FRONTEND
// ==========================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

// ==========================================
// TEST DATABASE CONNECTION
// ==========================================

async function testDatabase() {
    try {
        const connection = await db.getConnection();

        console.log("----------------------------------");
        console.log("DATABASE CONNECTED SUCCESSFULLY");
        console.log("----------------------------------");

        connection.release();
    } catch (error) {
        console.error("----------------------------------");
        console.error("DATABASE CONNECTION FAILED");
        console.error("----------------------------------");
        console.error(error.message);
    }
}

// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );
});

// ==========================================
// TEST API
// ==========================================

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Project Java server is working!"
    });
});

// ==========================================
// STUDENT REGISTRATION
// ==========================================

app.post("/api/register", async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            dob,
            rollNumber,
            division,
            password
        } = req.body;

        // REQUIRED FIELDS
        if (
            !fullName ||
            !email ||
            !phone ||
            !dob ||
            !rollNumber ||
            !division ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        // PASSWORD VALIDATION
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 6 characters."
            });
        }

        // EMAIL VALIDATION
        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(400).json({
                success: false,
                message:
                    "Please enter a valid email address."
            });
        }

        // PHONE VALIDATION
        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message:
                    "Phone number must contain exactly 10 digits."
            });
        }

        // CLEAN VALUES
        const cleanName = fullName.trim();
        const cleanEmail = email.toLowerCase().trim();
        const cleanPhone = phone.trim();
        const cleanRollNumber = rollNumber.trim();
        const cleanDivision = division.trim();

        // CHECK EXISTING EMAIL / PHONE
        const [existingUsers] = await db.execute(
            `SELECT
                id,
                email,
                phone
             FROM users
             WHERE email = ?
                OR phone = ?
             LIMIT 1`,
            [
                cleanEmail,
                cleanPhone
            ]
        );

        if (existingUsers.length > 0) {
            const existingUser = existingUsers[0];

            if (existingUser.email === cleanEmail) {
                return res.status(409).json({
                    success: false,
                    message:
                        "An account with this email already exists."
                });
            }

            if (existingUser.phone === cleanPhone) {
                return res.status(409).json({
                    success: false,
                    message:
                        "An account with this phone number already exists."
                });
            }
        }

        // HASH PASSWORD
        const passwordHash = await bcrypt.hash(
            password,
            12
        );

        // CREATE USER
        const [userResult] = await db.execute(
            `INSERT INTO users
            (
                full_name,
                email,
                phone,
                password_hash,
                role,
                email_verified,
                phone_verified
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                'student',
                FALSE,
                FALSE
            )`,
            [
                cleanName,
                cleanEmail,
                cleanPhone,
                passwordHash
            ]
        );

        const userId = userResult.insertId;

        // CREATE STUDENT PROFILE
        await db.execute(
            `INSERT INTO student_profiles
            (
                user_id,
                date_of_birth,
                roll_number,
                division
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?
            )`,
            [
                userId,
                dob,
                cleanRollNumber,
                cleanDivision
            ]
        );

        res.status(201).json({
            success: true,
            message:
                "Student account created successfully."
        });

    } catch (error) {
        console.error(
            "REGISTRATION ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error. Registration failed."
        });
    }
});

// ==========================================
// LOGIN
// ==========================================

app.post("/api/login", async (req, res) => {
    try {
        const {
            email,
            password,
            loginType
        } = req.body;

        // REQUIRED FIELDS
        if (
            !email ||
            !password ||
            !loginType
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please fill all fields."
            });
        }

        // VALID LOGIN TYPE
        if (
            !["student", "admin"].includes(loginType)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid login type."
            });
        }

        const cleanEmail =
            email.toLowerCase().trim();

        // FIND USER
        const [users] = await db.execute(
            `SELECT *
             FROM users
             WHERE email = ?
               AND role = ?
             LIMIT 1`,
            [
                cleanEmail,
                loginType
            ]
        );

        // USER NOT FOUND
        if (users.length === 0) {

            await db.execute(
                `INSERT INTO login_attempts
                (
                    email,
                    ip_address,
                    success
                )
                VALUES
                (
                    ?,
                    ?,
                    FALSE
                )`,
                [
                    cleanEmail,
                    req.ip
                ]
            );

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password."
            });
        }

        const user = users[0];

        // CHECK PASSWORD
        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password_hash
            );

        if (!passwordMatch) {

            await db.execute(
                `INSERT INTO login_attempts
                (
                    email,
                    ip_address,
                    success
                )
                VALUES
                (
                    ?,
                    ?,
                    FALSE
                )`,
                [
                    cleanEmail,
                    req.ip
                ]
            );

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password."
            });
        }

        // ==================================
// CHECK ADMIN STATUS
// ==================================

if (
    loginType === "admin" &&
    user.admin_status !== "active"
) {
    return res.status(403).json({
        success: false,
        message: "This admin account has been revoked."
    });
}


        // ==================================
        // ADMIN SUBJECTS
        // ==================================

        let subjects = [];

        if (loginType === "admin") {

            const [adminData] =
                await db.execute(
                    `SELECT
                        s.id,
                        s.subject_code,
                        s.subject_name
                     FROM admin_subjects a
                     INNER JOIN subjects s
                        ON a.subject_id = s.id
                     WHERE a.admin_id = ?
                     ORDER BY s.id ASC`,
                    [
                        user.id
                    ]
                );

            if (adminData.length === 0) {
                return res.status(403).json({
                    success: false,
                    message:
                        "No subjects are assigned to this admin."
                });
            }

            subjects = adminData;
        }

        // CREATE SESSION
        req.session.user = {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            subjects: subjects
        };

        // SUCCESSFUL LOGIN LOG
        await db.execute(
            `INSERT INTO login_attempts
            (
                email,
                ip_address,
                success
            )
            VALUES
            (
                ?,
                ?,
                TRUE
            )`,
            [
                cleanEmail,
                req.ip
            ]
        );

        // LOGIN RESPONSE
        res.json({
            success: true,
            message:
                "Login successful.",
            role:
                user.role,
            subjects:
                subjects
        });

    } catch (error) {
        console.error(
            "LOGIN ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error. Please try again."
        });
    }
});

// ==========================================
// GET CURRENT LOGGED-IN USER / PROFILE
// ==========================================

app.get("/api/me", async (req, res) => {
    try {

        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message:
                    "Not logged in."
            });
        }

        const userId =
            req.session.user.id;

        const [users] = await db.execute(
            `SELECT
                u.id,
                u.full_name,
                u.email,
                u.phone,
                u.role,
                u.email_verified,
                u.phone_verified,
                p.date_of_birth,
                p.roll_number,
                p.division
             FROM users u
             LEFT JOIN student_profiles p
                ON u.id = p.user_id
             WHERE u.id = ?
             LIMIT 1`,
            [
                userId
            ]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Student account not found."
            });
        }

        const user = users[0];

        res.json({
            success: true,
            user: {
                id:
                    user.id,

                fullName:
                    user.full_name,

                email:
                    user.email,

                phone:
                    user.phone,

                role:
                    user.role,

                dob:
                    user.date_of_birth,

                rollNumber:
                    user.roll_number,

                division:
                    user.division,

                emailVerified:
                    Boolean(
                        user.email_verified
                    ),

                phoneVerified:
                    Boolean(
                        user.phone_verified
                    )
            }
        });

    } catch (error) {

        console.error(
            "GET PROFILE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to load student profile."
        });
    }
});

// ==========================================
// SEND EMAIL OTP
// ==========================================

app.post(
    "/api/send-email-otp",
    async (req, res) => {

        try {

            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Please login first."
                });
            }

            if (
                req.session.user.role !==
                "student"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Only students can verify email."
                });
            }

            const userId =
                req.session.user.id;

            const [users] =
                await db.execute(
                    `SELECT
                        id,
                        email,
                        email_verified
                     FROM users
                     WHERE id = ?
                     LIMIT 1`,
                    [
                        userId
                    ]
                );

            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Student account not found."
                });
            }

            const user =
                users[0];

            if (
                Boolean(
                    user.email_verified
                )
            ) {
                return res.json({
                    success: false,
                    message:
                        "Email is already verified."
                });
            }

            // GENERATE OTP
            const otp =
                crypto.randomInt(
                    100000,
                    1000000
                ).toString();

            // HASH OTP
            const otpHash =
                await bcrypt.hash(
                    otp,
                    10
                );

            // OTP EXPIRY
            const expiresAt =
                new Date(
                    Date.now() +
                    10 * 60 * 1000
                );

            // DELETE OLD OTP
            await db.execute(
                `DELETE FROM otp_verifications
                 WHERE user_id = ?
                   AND verified = FALSE`,
                [
                    userId
                ]
            );

            // SAVE OTP
            await db.execute(
                `INSERT INTO otp_verifications
                (
                    user_id,
                    email,
                    otp_hash,
                    expires_at,
                    attempts,
                    verified
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    0,
                    FALSE
                )`,
                [
                    userId,
                    user.email,
                    otpHash,
                    expiresAt
                ]
            );

            // SEND EMAIL
            await emailTransporter.sendMail({

                from:
                    `"Project Java" <${process.env.EMAIL_FROM}>`,

                to:
                    user.email,

                subject:
                    "Project Java - Email Verification OTP",

                text:
                    `Your Project Java email verification OTP is ${otp}. ` +
                    `This OTP will expire in 10 minutes.`,

                html: `
                    <div style="
                        font-family: Arial, sans-serif;
                        max-width: 500px;
                        margin: auto;
                        padding: 25px;
                        border: 1px solid #ddd;
                        border-radius: 12px;
                    ">

                        <h2>Project Java</h2>

                        <p>Hello,</p>

                        <p>
                            Your email verification OTP is:
                        </p>

                        <h1 style="
                            letter-spacing: 8px;
                        ">
                            ${otp}
                        </h1>

                        <p>
                            This OTP will expire in
                            <strong>10 minutes</strong>.
                        </p>

                        <p>
                            If you did not request this OTP,
                            you can safely ignore this email.
                        </p>

                    </div>
                `
            });

            console.log(
                "OTP EMAIL SENT TO:",
                user.email
            );

            res.json({
                success: true,
                message:
                    "OTP sent successfully."
            });

        } catch (error) {

            console.error(
                "SEND OTP ERROR:",
                error
            );

            console.error(
                "ERROR MESSAGE:",
                error.message
            );

            console.error(
                "ERROR CODE:",
                error.code
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to send OTP."
            });
        }
    }
);

// ==========================================
// VERIFY EMAIL OTP
// ==========================================

app.post(
    "/api/verify-email-otp",
    async (req, res) => {

        try {

            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Please login first."
                });
            }

            if (
                req.session.user.role !==
                "student"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Only students can verify email."
                });
            }

            const { otp } = req.body;

            if (
                !otp ||
                !/^\d{6}$/.test(otp)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Please enter a valid 6-digit OTP."
                });
            }

            const userId =
                req.session.user.id;

            const [otpRows] =
                await db.execute(
                    `SELECT
                        id,
                        user_id,
                        email,
                        otp_hash,
                        expires_at,
                        attempts,
                        verified
                     FROM otp_verifications
                     WHERE user_id = ?
                       AND verified = FALSE
                     ORDER BY id DESC
                     LIMIT 1`,
                    [
                        userId
                    ]
                );

            if (otpRows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "No active OTP found. Please request a new OTP."
                });
            }

            const otpRecord =
                otpRows[0];

            // CHECK EXPIRY
            const currentTime =
                new Date();

            const expiryTime =
                new Date(
                    otpRecord.expires_at
                );

            if (
                currentTime >
                expiryTime
            ) {

                await db.execute(
                    `DELETE FROM otp_verifications
                     WHERE id = ?`,
                    [
                        otpRecord.id
                    ]
                );

                return res.status(400).json({
                    success: false,
                    message:
                        "OTP has expired. Please request a new OTP."
                });
            }

            // CHECK ATTEMPTS
            if (
                otpRecord.attempts >= 5
            ) {

                await db.execute(
                    `DELETE FROM otp_verifications
                     WHERE id = ?`,
                    [
                        otpRecord.id
                    ]
                );

                return res.status(429).json({
                    success: false,
                    message:
                        "Too many incorrect attempts. Please request a new OTP."
                });
            }

            // COMPARE OTP
            const otpMatch =
                await bcrypt.compare(
                    otp,
                    otpRecord.otp_hash
                );

            if (!otpMatch) {

                await db.execute(
                    `UPDATE otp_verifications
                     SET attempts = attempts + 1
                     WHERE id = ?`,
                    [
                        otpRecord.id
                    ]
                );

                return res.status(400).json({
                    success: false,
                    message:
                        "Incorrect OTP."
                });
            }

            // MARK OTP VERIFIED
            await db.execute(
                `UPDATE otp_verifications
                 SET verified = TRUE
                 WHERE id = ?`,
                [
                    otpRecord.id
                ]
            );

            // MARK USER EMAIL VERIFIED
            await db.execute(
                `UPDATE users
                 SET email_verified = TRUE
                 WHERE id = ?`,
                [
                    userId
                ]
            );

            res.json({
                success: true,
                message:
                    "Email verified successfully."
            });

        } catch (error) {

            console.error(
                "VERIFY OTP ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to verify OTP."
            });
        }
    }
);

// ==========================================
// GET STUDENT SUBJECTS
// ==========================================

app.get(
    "/api/student-subjects",
    async (req, res) => {

        try {

            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Please login first."
                });
            }

            if (
                req.session.user.role !==
                "student"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Only students can view exams."
                });
            }

            const [subjects] =
                await db.execute(`
                    SELECT
                        id,
                        subject_code,
                        subject_name
                    FROM subjects
                    ORDER BY id ASC
                `);

            res.json({
                success: true,
                subjects:
                    subjects
            });

        } catch (error) {

            console.error(
                "GET STUDENT SUBJECTS ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load available subjects."
            });
        }
    }
);


// ==========================================
// STUDENT PUBLISHED EXAMS
// ==========================================

app.get(
    "/api/student-exams",
    async (req, res) => {

        try {

            // CHECK LOGIN
            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: "Please login first."
                });
            }

            // CHECK STUDENT
            if (
                req.session.user.role !==
                "student"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Only students can view exams."
                });
            }

            // GET ALL PUBLISHED EXAMS
            // ==========================================
// GET SUBJECT ID FROM URL
// ==========================================

const subjectId =
    req.query.subjectId;


// ==========================================
// BUILD EXAM QUERY
// ==========================================

let examQuery = `
    SELECT
        e.id,
        e.subject_id,
        e.exam_title,
        e.duration_minutes,
        e.total_marks,
        e.status,
        s.subject_code,
        s.subject_name,
        COUNT(q.id) AS question_count
    FROM exams e
    INNER JOIN subjects s
        ON e.subject_id = s.id
    LEFT JOIN exam_questions q
        ON e.id = q.exam_id
    WHERE e.status = 'published'
`;

const queryParams = [];


// ==========================================
// FILTER BY SUBJECT IF SELECTED
// ==========================================

if (subjectId) {

    examQuery += `
        AND e.subject_id = ?
    `;

    queryParams.push(subjectId);

}


// ==========================================
// GROUP RESULTS
// ==========================================

examQuery += `
    GROUP BY
        e.id,
        e.subject_id,
        e.exam_title,
        e.duration_minutes,
        e.total_marks,
        e.status,
        s.subject_code,
        s.subject_name
    ORDER BY e.id DESC
`;


// ==========================================
// EXECUTE QUERY
// ==========================================

const [exams] =
    await db.execute(
        examQuery,
        queryParams
    );

            res.json({
                success: true,
                exams: exams
            });

        } catch (error) {

            console.error(
                "GET STUDENT EXAMS ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load available exams."
            });
        }
    }
);




// ==========================================
// GET ONE PUBLISHED EXAM FOR STUDENT
// ==========================================

app.get(
    "/api/student-exams/:id",
    async (req, res) => {

        try {

            // ==================================
            // CHECK LOGIN
            // ==================================

            if (!req.session.user) {

                return res.status(401).json({
                    success: false,
                    message: "Please login first."
                });

            }


            // ==================================
            // CHECK STUDENT
            // ==================================

            if (
                req.session.user.role !==
                "student"
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Only students can take exams."
                });

            }


            const examId =
                req.params.id;

            const studentId =
                req.session.user.id;


            // ==================================
            // CHECK EXAM
            // ==================================

            const [examRows] =
                await db.execute(

                    `SELECT
                        e.id,
                        e.subject_id,
                        e.exam_title,
                        e.duration_minutes,
                        e.total_marks,
                        e.status,
                        s.subject_code,
                        s.subject_name
                     FROM exams e
                     INNER JOIN subjects s
                        ON e.subject_id = s.id
                     WHERE e.id = ?
                       AND e.status = 'published'
                     LIMIT 1`,

                    [
                        examId
                    ]
                );


            // ==================================
            // EXAM NOT FOUND / CLOSED
            // ==================================

            if (
                examRows.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "This exam is not currently available."
                });

            }


            const exam =
                examRows[0];


            // ==================================
            // CHECK EXISTING ATTEMPT
            // ==================================

            const [attemptRows] =
                await db.execute(

                    `SELECT
                        id,
                        status,
                        started_at,
                        submitted_at
                     FROM exam_attempts
                     WHERE student_id = ?
                       AND exam_id = ?
                     LIMIT 1`,

                    [
                        studentId,
                        examId
                    ]
                );


            // ==================================
            // STUDENT HAS ALREADY ATTEMPTED
            // ==================================

            if (
                attemptRows.length > 0
            ) {

                const attempt =
                    attemptRows[0];


                return res.status(403).json({

                    success: false,

                    message:
                        "You have already used your attempt for this exam.",

                    attemptStatus:
                        attempt.status

                });

            }


            // ==================================
            // CREATE FIRST ATTEMPT
            // ==================================

            await db.execute(

                `INSERT INTO exam_attempts
                (
                    student_id,
                    exam_id,
                    status
                )
                VALUES (?, ?, 'in_progress')`,

                [
                    studentId,
                    examId
                ]

            );


            // ==================================
            // GET QUESTIONS
            // ==================================

            const [questions] =
                await db.execute(

                    `SELECT
                        id,
                        question_text,
                        option_a,
                        option_b,
                        option_c,
                        option_d,
                        marks
                     FROM exam_questions
                     WHERE exam_id = ?
                     ORDER BY id ASC`,

                    [
                        examId
                    ]
                );


            // ==================================
            // CHECK QUESTIONS
            // ==================================

            if (
                questions.length === 0
            ) {

                // Remove the attempt because
                // the exam cannot actually be taken

                await db.execute(

                    `DELETE FROM exam_attempts
                     WHERE student_id = ?
                       AND exam_id = ?`,

                    [
                        studentId,
                        examId
                    ]

                );


                return res.status(400).json({

                    success: false,

                    message:
                        "This exam does not contain any questions."

                });

            }


            // ==================================
            // SEND EXAM TO STUDENT
            // ==================================

            res.json({

                success: true,

                exam: {

                    id:
                        exam.id,

                    subject_id:
                        exam.subject_id,

                    exam_title:
                        exam.exam_title,

                    duration_minutes:
                        exam.duration_minutes,

                    total_marks:
                        exam.total_marks,

                    subject_code:
                        exam.subject_code,

                    subject_name:
                        exam.subject_name,

                    question_count:
                        questions.length

                },

                questions:
                    questions

            });


        } catch (error) {

            console.error(
                "GET STUDENT EXAM ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load examination."

            });

        }

    }
);

// ==========================================
// SUBMIT STUDENT EXAM
// ==========================================

// ==========================================
// SUBMIT STUDENT EXAM
// SERVER-CONTROLLED TIMER + ONE ATTEMPT
// ==========================================

app.post(
    "/api/student-exams/:id/submit",
    async (req, res) => {

        let connection;

        try {

            // ==================================
            // CHECK LOGIN
            // ==================================

            if (!req.session.user) {

                return res.status(401).json({
                    success: false,
                    message: "Please login first."
                });

            }

            // ==================================
            // CHECK STUDENT
            // ==================================

            if (
                req.session.user.role !==
                "student"
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Only students can submit exams."
                });

            }

            const examId =
                Number(req.params.id);

            const studentId =
                req.session.user.id;

            const answers =
                req.body.answers || {};

            if (
                !Number.isInteger(examId) ||
                examId <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid exam ID."
                });

            }

            // ==================================
            // GET DATABASE CONNECTION
            // ==================================

            connection =
                await db.getConnection();

            await connection.beginTransaction();

            // ==================================
            // GET EXAM
            // LOCK EXAM RECORD
            // ==================================

            const [examRows] =
                await connection.execute(
                    `SELECT
                        id,
                        total_marks,
                        status,
                        duration_minutes
                     FROM exams
                     WHERE id = ?
                     LIMIT 1
                     FOR UPDATE`,
                    [examId]
                );

            // ==================================
            // EXAM NOT FOUND
            // ==================================

            if (examRows.length === 0) {

                await connection.rollback();

                return res.status(404).json({
                    success: false,
                    message: "Exam not found."
                });

            }

            const exam =
                examRows[0];

            // ==================================
            // CHECK WHETHER ADMIN CLOSED EXAM
            // ==================================

            if (
                exam.status !==
                "published"
            ) {

                await connection.execute(
                    `UPDATE exam_attempts
                     SET status = 'blocked',
                         submitted_at =
                             CURRENT_TIMESTAMP
                     WHERE student_id = ?
                     AND exam_id = ?
                     AND status = 'in_progress'`,
                    [
                        studentId,
                        examId
                    ]
                );

                await connection.commit();

                return res.status(403).json({
                    success: false,
                    message:
                        "This exam has been closed by the administrator. Your submission cannot be accepted."
                });

            }

            // ==================================
            // GET AND LOCK STUDENT ATTEMPT
            // ==================================

            const [attemptRows] =
                await connection.execute(
                    `SELECT
                        id,
                        status,
                        started_at
                     FROM exam_attempts
                     WHERE student_id = ?
                     AND exam_id = ?
                     LIMIT 1
                     FOR UPDATE`,
                    [
                        studentId,
                        examId
                    ]
                );

            // ==================================
            // NO ATTEMPT
            // ==================================

            if (attemptRows.length === 0) {

                await connection.rollback();

                return res.status(403).json({
                    success: false,
                    message:
                        "You do not have an active attempt for this exam."
                });

            }

            const attempt =
                attemptRows[0];

            // ==================================
            // CHECK ATTEMPT STATUS
            // ==================================

            if (
                attempt.status !==
                "in_progress"
            ) {

                await connection.rollback();

                let message =
                    "You have already used your attempt for this exam.";

                if (
                    attempt.status ===
                    "blocked"
                ) {

                    message =
                        "Your attempt was blocked because the exam was closed by the administrator.";

                }

                if (
                    attempt.status ===
                    "abandoned"
                ) {

                    message =
                        "You have exited this exam. Your attempt cannot be used again.";

                }

                if (
                    attempt.status ===
                    "submitted"
                ) {

                    message =
                        "You have already submitted this exam.";

                }

                return res.status(403).json({
                    success: false,
                    message: message
                });

            }

            // ==================================
            // SERVER-SIDE TIMER CHECK
            // ==================================

            const startedAt =
                new Date(attempt.started_at);

            const now =
                new Date();

            const elapsedMilliseconds =
                now.getTime() -
                startedAt.getTime();

            const elapsedMinutes =
                elapsedMilliseconds /
                (1000 * 60);

            const durationMinutes =
                Number(
                    exam.duration_minutes
                );

            const timeExpired =
                elapsedMinutes >
                durationMinutes;

            // ==================================
            // GET CORRECT ANSWERS
            // ==================================

            const [questions] =
                await connection.execute(
                    `SELECT
                        id,
                        correct_option,
                        marks
                     FROM exam_questions
                     WHERE exam_id = ?
                     ORDER BY id ASC`,
                    [examId]
                );

            // ==================================
            // EXAM HAS NO QUESTIONS
            // ==================================

            if (questions.length === 0) {

                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message:
                        "This exam has no questions."
                });

            }

            // ==================================
            // CALCULATE SCORE
            // ==================================

            let score = 0;

            questions.forEach(
                question => {

                    const studentAnswer =
                        answers[question.id];

                    if (
                        studentAnswer &&
                        studentAnswer ===
                        question.correct_option
                    ) {

                        score +=
                            Number(
                                question.marks
                            );

                    }

                }
            );

            // ==================================
            // SAVE RESULT
            // ==================================

            await connection.execute(
                `INSERT INTO exam_results
                (
                    student_id,
                    exam_id,
                    score,
                    total_marks
                )
                VALUES (?, ?, ?, ?)`,
                [
                    studentId,
                    examId,
                    score,
                    exam.total_marks
                ]
            );

            // ==================================
            // MARK ATTEMPT AS SUBMITTED
            // ==================================

            await connection.execute(
                `UPDATE exam_attempts
                 SET status = 'submitted',
                     submitted_at =
                         CURRENT_TIMESTAMP
                 WHERE id = ?
                 AND status = 'in_progress'`,
                [
                    attempt.id
                ]
            );

            // ==================================
            // COMMIT EVERYTHING
            // ==================================

            await connection.commit();

            // ==================================
            // CALCULATE PERCENTAGE
            // ==================================

            const percentage =
                exam.total_marks > 0
                    ? Math.round(
                        (
                            score /
                            exam.total_marks
                        ) * 100
                    )
                    : 0;

            // ==================================
            // SEND RESULT
            // ==================================

            return res.json({

                success: true,

                message:
                    timeExpired
                        ? "Exam submitted. The allowed time had expired, so the server finalized your submission."
                        : "Exam submitted successfully.",

                result: {

                    score:
                        score,

                    total_marks:
                        exam.total_marks,

                    percentage:
                        percentage,

                    time_expired:
                        timeExpired

                }

            });

        } catch (error) {

            // ==================================
            // ROLLBACK IF SOMETHING FAILED
            // ==================================

            if (connection) {

                try {

                    await connection.rollback();

                } catch (rollbackError) {

                    console.error(
                        "ROLLBACK ERROR:",
                        rollbackError
                    );

                }

            }

            console.error(
                "SUBMIT STUDENT EXAM ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to submit exam."

            });

        } finally {

            // ==================================
            // RELEASE DATABASE CONNECTION
            // ==================================

            if (connection) {

                connection.release();

            }

        }

    }
);

// ==========================================
// ADMIN SUBJECTS
// ==========================================

app.get(
    "/api/admin-subjects",
    async (req, res) => {

        try {

            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Not logged in."
                });
            }

            if (
                req.session.user.role !==
                "admin"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Admin access required."
                });
            }

            const [subjects] =
                await db.execute(
                    `SELECT
                        s.id,
                        s.subject_code,
                        s.subject_name
                     FROM admin_subjects a
                     INNER JOIN subjects s
                        ON a.subject_id = s.id
                     WHERE a.admin_id = ?
                     ORDER BY s.id ASC`,
                    [
                        req.session.user.id
                    ]
                );

            res.json({
                success: true,
                subjects:
                    subjects
            });

        } catch (error) {

            console.error(
                "ADMIN SUBJECTS ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load admin subjects."
            });
        }
    }
);

// ==========================================
// ADMIN EXAMS
// ==========================================

// GET ALL EXAMS FOR A SUBJECT

app.get(
    "/api/admin-exams",
    async (req, res) => {

        try {

            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Not logged in."
                });
            }

            if (
                req.session.user.role !==
                "admin"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Admin access required."
                });
            }

            const subjectId =
                req.query.subjectId;

            if (!subjectId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Subject ID is required."
                });
            }

            // CHECK SUBJECT ASSIGNMENT
            const [assigned] =
                await db.execute(
                    `SELECT id
                     FROM admin_subjects
                     WHERE admin_id = ?
                     AND subject_id = ?`,
                    [
                        req.session.user.id,
                        subjectId
                    ]
                );

            if (assigned.length === 0) {
                return res.status(403).json({
                    success: false,
                    message:
                        "This subject is not assigned to you."
                });
            }

            const [exams] =
                await db.execute(
                    `SELECT
                        e.id,
                        e.subject_id,
                        e.exam_title,
                        e.duration_minutes,
                        e.total_marks,
                        e.status,
                        e.created_at,
                        s.subject_code,
                        s.subject_name,
                        COUNT(q.id) AS question_count
                     FROM exams e
                     INNER JOIN subjects s
                        ON e.subject_id = s.id
                     LEFT JOIN exam_questions q
                        ON e.id = q.exam_id
                     WHERE e.subject_id = ?
                     GROUP BY
                        e.id,
                        e.subject_id,
                        e.exam_title,
                        e.duration_minutes,
                        e.total_marks,
                        e.status,
                        e.created_at,
                        s.subject_code,
                        s.subject_name
                     ORDER BY e.id DESC`,
                    [
                        subjectId
                    ]
                );

            res.json({
                success: true,
                exams:
                    exams
            });

        } catch (error) {

            console.error(
                "GET ADMIN EXAMS ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load exams."
            });
        }
    }
);

// ==========================================
// GET ONE ADMIN EXAM
// ==========================================

app.get(
    "/api/admin-exams/:id",
    async (req, res) => {

        try {

            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Not logged in."
                });
            }

            if (
                req.session.user.role !==
                "admin"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Admin access required."
                });
            }

            const examId =
                req.params.id;

            const [exam] =
                await db.execute(
                    `SELECT
                        e.id,
                        e.subject_id,
                        e.exam_title,
                        e.duration_minutes,
                        e.total_marks,
                        e.status,
                        s.subject_code,
                        s.subject_name
                     FROM exams e
                     INNER JOIN subjects s
                        ON e.subject_id = s.id
                     INNER JOIN admin_subjects a
                        ON e.subject_id = a.subject_id
                     WHERE e.id = ?
                     AND a.admin_id = ?`,
                    [
                        examId,
                        req.session.user.id
                    ]
                );

            if (exam.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Exam not found."
                });
            }

            res.json({
                success: true,
                exam:
                    exam[0]
            });

        } catch (error) {

            console.error(
                "GET ADMIN EXAM ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load exam."
            });
        }
    }
);

// ==========================================
// CREATE NEW EXAM
// ==========================================

app.post(
    "/api/admin-exams",
    async (req, res) => {

        try {

            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Not logged in."
                });
            }

            if (
                req.session.user.role !==
                "admin"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Admin access required."
                });
            }

            const {
                subjectId,
                examTitle,
                durationMinutes,
                totalMarks
            } = req.body;

            if (
                !subjectId ||
                !examTitle ||
                !durationMinutes ||
                !totalMarks
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "All exam fields are required."
                });
            }

            const numericDuration =
                Number(durationMinutes);

            const numericTotalMarks =
                Number(totalMarks);

            if (
                numericDuration <= 0 ||
                numericTotalMarks <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Duration and total marks must be greater than zero."
                });
            }

            // CHECK SUBJECT ASSIGNMENT
            const [assigned] =
                await db.execute(
                    `SELECT id
                     FROM admin_subjects
                     WHERE admin_id = ?
                     AND subject_id = ?`,
                    [
                        req.session.user.id,
                        subjectId
                    ]
                );

            if (assigned.length === 0) {
                return res.status(403).json({
                    success: false,
                    message:
                        "This subject is not assigned to you."
                });
            }

            const [result] =
                await db.execute(
                    `INSERT INTO exams
                    (
                        admin_id,
                        subject_id,
                        exam_title,
                        duration_minutes,
                        total_marks,
                        status
                    )
                    VALUES
                    (?, ?, ?, ?, ?, 'draft')`,
                    [
                        req.session.user.id,
                        subjectId,
                        examTitle.trim(),
                        numericDuration,
                        numericTotalMarks
                    ]
                );

            res.json({
                success: true,
                message:
                    "Exam created successfully.",
                examId:
                    result.insertId
            });

        } catch (error) {

            console.error(
                "CREATE ADMIN EXAM ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to create exam."
            });
        }
    }
);

// ==========================================
// GET QUESTIONS FOR EXAM
// ==========================================

app.get(
    "/api/admin-questions",
    async (req, res) => {

        try {

            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Not logged in."
                });
            }

            if (
                req.session.user.role !==
                "admin"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Admin access required."
                });
            }

            const examId =
                req.query.examId;

            if (!examId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Exam ID is required."
                });
            }

            // CHECK EXAM ACCESS
            const [exam] =
                await db.execute(
                    `SELECT
                        e.id,
                        e.total_marks
                     FROM exams e
                     INNER JOIN admin_subjects a
                        ON e.subject_id = a.subject_id
                     WHERE e.id = ?
                     AND a.admin_id = ?`,
                    [
                        examId,
                        req.session.user.id
                    ]
                );

            if (exam.length === 0) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You cannot access this exam."
                });
            }

            const [questions] =
                await db.execute(
                    `SELECT
                        id,
                        exam_id,
                        question_text,
                        option_a,
                        option_b,
                        option_c,
                        option_d,
                        correct_option,
                        marks,
                        created_at
                     FROM exam_questions
                     WHERE exam_id = ?
                     ORDER BY id ASC`,
                    [
                        examId
                    ]
                );

            // Convert database A/B/C/D
            // back to frontend 1/2/3/4
            const mappedQuestions =
                questions.map((question) => {

                    let correctOption = "1";

                    if (
                        question.correct_option === "A"
                    ) {
                        correctOption = "1";
                    } else if (
                        question.correct_option === "B"
                    ) {
                        correctOption = "2";
                    } else if (
                        question.correct_option === "C"
                    ) {
                        correctOption = "3";
                    } else if (
                        question.correct_option === "D"
                    ) {
                        correctOption = "4";
                    }

                    return {
                        ...question,
                        correct_option:
                            correctOption
                    };
                });

            res.json({
                success: true,
                questions:
                    mappedQuestions
            });

        } catch (error) {

            console.error(
                "GET ADMIN QUESTIONS ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load questions."
            });
        }
    }
);

// ==========================================
// ADD QUESTION
// ==========================================

app.post(
    "/api/admin-questions",
    async (req, res) => {

        try {

            // CHECK LOGIN
            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Not logged in."
                });
            }

            // CHECK ADMIN
            if (
                req.session.user.role !==
                "admin"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Admin access required."
                });
            }

            const {
                examId,
                questionText,
                optionA,
                optionB,
                optionC,
                optionD,
                correctOption
            } = req.body;

            // REQUIRED FIELDS
            if (
                !examId ||
                !questionText ||
                !optionA ||
                !optionB ||
                !optionC ||
                !optionD ||
                !correctOption
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "All question fields are required."
                });
            }

            // ==================================
            // FRONTEND 1/2/3/4
            // TO DATABASE A/B/C/D
            // ==================================

            const optionMap = {
                "1": "A",
                "2": "B",
                "3": "C",
                "4": "D"
            };

            const correctOptionDb =
                optionMap[
                    String(correctOption)
                ];

            if (!correctOptionDb) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid correct option."
                });
            }

            // ==================================
            // CHECK EXAM + ADMIN ACCESS
            // ==================================

            const [exam] =
                await db.execute(
                    `SELECT
                        e.id,
                        e.total_marks,
                        e.subject_id
                     FROM exams e
                     INNER JOIN admin_subjects a
                        ON e.subject_id = a.subject_id
                     WHERE e.id = ?
                     AND a.admin_id = ?`,
                    [
                        Number(examId),
                        req.session.user.id
                    ]
                );

            if (exam.length === 0) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You cannot modify this exam."
                });
            }

            const totalMarks =
                Number(
                    exam[0].total_marks
                );

            // ==================================
            // COUNT EXISTING QUESTIONS
            // ==================================

            const [countRows] =
                await db.execute(
                    `SELECT
                        COUNT(*) AS question_count
                     FROM exam_questions
                     WHERE exam_id = ?`,
                    [
                        Number(examId)
                    ]
                );

            const questionCount =
                Number(
                    countRows[0].question_count
                );

            // ==================================
            // STOP EXTRA QUESTIONS
            // ==================================

            if (
                questionCount >=
                totalMarks
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        `This exam requires exactly ${totalMarks} questions. No more questions can be added.`
                });
            }

            // ==================================
            // INSERT QUESTION
            // EVERY QUESTION = 1 MARK
            // ==================================

            const [result] =
                await db.execute(
                    `INSERT INTO exam_questions
                    (
                        exam_id,
                        question_text,
                        option_a,
                        option_b,
                        option_c,
                        option_d,
                        correct_option,
                        marks
                    )
                    VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        Number(examId),

                        questionText.trim(),

                        optionA.trim(),

                        optionB.trim(),

                        optionC.trim(),

                        optionD.trim(),

                        correctOptionDb,

                        1
                    ]
                );

            const newQuestionCount =
                questionCount + 1;

            res.json({
                success: true,

                message:
                    "Question added successfully.",

                questionId:
                    result.insertId,

                questionCount:
                    newQuestionCount,

                totalQuestions:
                    totalMarks,

                remainingQuestions:
                    totalMarks -
                    newQuestionCount
            });

        } catch (error) {

            console.error(
                "ADD ADMIN QUESTION ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to add question."
            });
        }
    }
);

// ==========================================
// DELETE QUESTION
// ==========================================

app.delete(
    "/api/admin-questions/:id",
    async (req, res) => {

        try {

            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Not logged in."
                });
            }

            if (
                req.session.user.role !==
                "admin"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Admin access required."
                });
            }

            const questionId =
                req.params.id;

            const [question] =
                await db.execute(
                    `SELECT
                        q.id
                     FROM exam_questions q
                     INNER JOIN exams e
                        ON q.exam_id = e.id
                     INNER JOIN admin_subjects a
                        ON e.subject_id = a.subject_id
                     WHERE q.id = ?
                     AND a.admin_id = ?`,
                    [
                        questionId,
                        req.session.user.id
                    ]
                );

            if (question.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Question not found."
                });
            }

            await db.execute(
                `DELETE FROM exam_questions
                 WHERE id = ?`,
                [
                    questionId
                ]
            );

            res.json({
                success: true,
                message:
                    "Question deleted successfully."
            });

        } catch (error) {

            console.error(
                "DELETE ADMIN QUESTION ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to delete question."
            });
        }
    }
);

// ==========================================
// PUBLISH / UNPUBLISH EXAM
// ==========================================

app.put(
    "/api/admin-exams/:id/status",
    async (req, res) => {

        try {

            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Not logged in."
                });
            }

            if (
                req.session.user.role !==
                "admin"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Admin access required."
                });
            }

            const examId =
                req.params.id;

            const { status } =
                req.body;

            if (
                status !== "draft" &&
                status !== "published"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid exam status."
                });
            }

            // ==================================
            // GET EXAM
            // ==================================

            const [exam] =
                await db.execute(
                    `SELECT
                        e.id,
                        e.total_marks
                     FROM exams e
                     INNER JOIN admin_subjects a
                        ON e.subject_id = a.subject_id
                     WHERE e.id = ?
                     AND a.admin_id = ?`,
                    [
                        examId,
                        req.session.user.id
                    ]
                );

            if (exam.length === 0) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You cannot modify this exam."
                });
            }

            // ==================================
            // ONLY CHECK QUESTIONS WHEN
            // PUBLISHING
            // ==================================

            if (status === "published") {

                const [countRows] =
                    await db.execute(
                        `SELECT
                            COUNT(*) AS question_count
                         FROM exam_questions
                         WHERE exam_id = ?`,
                        [
                            examId
                        ]
                    );

                const questionCount =
                    Number(
                        countRows[0].question_count
                    );

                const totalMarks =
                    Number(
                        exam[0].total_marks
                    );

                if (
                    questionCount !==
                    totalMarks
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            `You must add exactly ${totalMarks} questions before publishing this exam. Currently there are ${questionCount} questions.`
                    });
                }
            }

            // ==================================
            // UPDATE STATUS
            // ==================================

            await db.execute(
                `UPDATE exams
                 SET status = ?
                 WHERE id = ?`,
                [
                    status,
                    examId
                ]
            );

            res.json({
                success: true,
                message:
                    status === "published"
                        ? "Exam published successfully."
                        : "Exam moved to draft."
            });

        } catch (error) {

            console.error(
                "UPDATE EXAM STATUS ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to update exam status."
            });
        }
    }
);

// ==========================================
// DELETE EXAM
// ==========================================

// ==========================================
// REMOVE EXAM
// ==========================================
//
// IMPORTANT:
// We do NOT physically delete the exam.
//
// We move it back to "draft".
//
// This makes the exam disappear from the
// student's available exams while keeping
// the exam record for Results and Attendance.
//
// ==========================================

app.delete(
    "/api/admin-exams/:id",
    async (req, res) => {

        try {

            // ==================================
            // CHECK LOGIN
            // ==================================

            if (!req.session.user) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Not logged in."
                });

            }


            // ==================================
            // CHECK ADMIN
            // ==================================

            if (
                req.session.user.role !==
                "admin"
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "Admin access required."
                });

            }


            const examId =
                req.params.id;


            // ==================================
            // CHECK EXAM ACCESS
            // ==================================

            const [exam] =
                await db.execute(
                    `SELECT
                        e.id,
                        e.status
                     FROM exams e
                     INNER JOIN admin_subjects a
                        ON e.subject_id = a.subject_id
                     WHERE e.id = ?
                     AND a.admin_id = ?`,
                    [
                        examId,
                        req.session.user.id
                    ]
                );


            // ==================================
            // EXAM NOT FOUND
            // ==================================

            if (
                exam.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Exam not found."
                });

            }


            // ==================================
            // REMOVE EXAM FROM STUDENT VIEW
            // ==================================
            //
            // Instead of DELETE,
            // change status to draft.
            //
            // Results remain safe.
            // Attendance remains safe.
            //
            // ==================================

            await db.execute(
                `UPDATE exams
                 SET status = 'draft'
                 WHERE id = ?`,
                [
                    examId
                ]
            );


            // ==================================
            // SUCCESS
            // ==================================

            res.json({

                success: true,

                message:
                    "Exam removed successfully. Existing results and attendance records have been preserved."

            });


        } catch (error) {

            console.error(
                "REMOVE EXAM ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to remove exam."

            });

        }

    }
);

// =====================================================
// GET STUDENT EXAM RESULTS
// =====================================================



// ==========================================
// LOGOUT
// ==========================================

app.post(
    "/api/logout",
    (req, res) => {

        req.session.destroy(
            (error) => {

                if (error) {
                    return res.status(500).json({
                        success: false,
                        message:
                            "Logout failed."
                    });
                }

                res.clearCookie(
                    "connect.sid"
                );

                res.json({
                    success: true,
                    message:
                        "Logged out successfully."
                });
            }
        );
    }
);

// ==========================================
// TEST EMAIL CONNECTION
// ==========================================

emailTransporter.verify(
    (error, success) => {

        if (error) {

            console.error(
                "EMAIL CONNECTION ERROR:",
                error.message
            );

        } else {

            console.log(
                "EMAIL SERVICE READY"
            );
        }
    }
);

// =====================================================
// STUDENT ATTENDANCE
// =====================================================

// =====================================================
// STUDENT ATTENDANCE
// =====================================================

app.get("/api/student-attendance", async (req, res) => {

    try {

        // ==========================================
        // CHECK LOGIN
        // ==========================================

        if (!req.session.user) {

            return res.status(401).json({
                success: false,
                message: "Please login first."
            });

        }


        // ==========================================
        // CHECK STUDENT
        // ==========================================

        if (req.session.user.role !== "student") {

            return res.status(403).json({
                success: false,
                message:
                    "Only students can view attendance."
            });

        }


        const studentId = req.session.user.id;


        // ==========================================
        // GET ALL PUBLISHED EXAMS
        // ==========================================

        const [exams] = await db.execute(
            `SELECT
                e.id,
                e.exam_title,
                e.subject_id,
                s.subject_name,
                s.subject_code
             FROM exams e
             INNER JOIN subjects s
                ON e.subject_id = s.id
             WHERE e.status = 'published'
             ORDER BY e.id DESC`
        );


        // ==========================================
        // GET EXAMS GIVEN BY STUDENT
        // ==========================================
        //
        // We use exam_results because a result is
        // created only after a successful submission.
        //
        // ==========================================

        const [results] = await db.execute(
            `SELECT DISTINCT
                exam_id
             FROM exam_results
             WHERE student_id = ?`,
            [studentId]
        );


        // ==========================================
        // CREATE SET OF EXAMS GIVEN
        // ==========================================

        const givenExamIds = new Set(
            results.map(result =>
                Number(result.exam_id)
            )
        );


        // ==========================================
        // PREPARE EXAM DETAILS
        // ==========================================

        const examDetails = exams.map(exam => {

            const examWasGiven =
                givenExamIds.has(
                    Number(exam.id)
                );

            return {

                id: exam.id,

                exam_title:
                    exam.exam_title,

                subject_name:
                    exam.subject_name,

                subject_code:
                    exam.subject_code,

                given:
                    examWasGiven

            };

        });


        // ==========================================
        // CALCULATE ATTENDANCE
        // ==========================================

        const totalExams =
            exams.length;


        const examsGiven =
            examDetails.filter(
                exam => exam.given === true
            ).length;


        const examsNotGiven =
            totalExams - examsGiven;


        // ==========================================
        // CALCULATE PERCENTAGE
        // ==========================================

        let percentage = 0;

        if (totalExams > 0) {

            percentage = Number(
                (
                    (examsGiven / totalExams) *
                    100
                ).toFixed(2)
            );

        }


        // ==========================================
        // SEND ATTENDANCE DATA
        // ==========================================

        return res.json({

            success: true,

            attendance: {

                totalExams:
                    totalExams,

                examsGiven:
                    examsGiven,

                examsNotGiven:
                    examsNotGiven,

                percentage:
                    percentage

            },

            exams:
                examDetails

        });


    } catch (error) {

        console.error(
            "LOAD STUDENT ATTENDANCE ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to load attendance."

        });

    }

});

// =====================================================
// GET STUDENT EXAM RESULTS
// =====================================================

app.get("/api/student-results", async (req, res) => {
    try {
        // Check whether the student is logged in
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Please login first."
            });
        }

        // Only students can access their results
        if (req.session.user.role !== "student") {
            return res.status(403).json({
                success: false,
                message: "Only students can view examination results."
            });
        }

        const studentId = req.session.user.id;

        // Fetch this student's results
        const [results] = await db.execute(
            `SELECT
                er.id,
                er.exam_id,
                er.score,
                er.total_marks,
                er.submitted_at,
                e.exam_title AS title,
                s.subject_name AS subject,
                s.subject_code
             FROM exam_results er
             INNER JOIN exams e
                ON er.exam_id = e.id
             INNER JOIN subjects s
                ON e.subject_id = s.id
             WHERE er.student_id = ?
             ORDER BY er.submitted_at DESC`,
            [studentId]
        );

        return res.json({
            success: true,
            results: results
        });

    } catch (error) {
        console.error("LOAD STUDENT RESULTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load examination results."
        });
    }
});



// =====================================================
// ADMIN RESULTS - SUBJECTS
// =====================================================

app.get("/api/admin-results/subjects", async (req, res) => {

    try {

        if (!req.session.user || req.session.user.role !== "admin") {

            return res.status(401).json({
                success: false,
                message: "Admin login required."
            });

        }

        const adminId = req.session.user.id;

        const [subjects] = await db.execute(
            `
            SELECT
                s.id,
                s.subject_code,
                s.subject_name
            FROM subjects s
            INNER JOIN admin_subjects ads
                ON ads.subject_id = s.id
            WHERE ads.admin_id = ?
            ORDER BY s.id ASC
            `,
            [adminId]
        );

        res.json({
            success: true,
            subjects
        });

    } catch (error) {

        console.error(
            "Admin results subjects error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load subjects."
        });

    }

});


// =====================================================
// ADMIN RESULTS - PUBLISHED EXAMS FOR SUBJECT
// =====================================================

app.get("/api/admin-results/exams", async (req, res) => {

    try {

        if (!req.session.user || req.session.user.role !== "admin") {

            return res.status(401).json({
                success: false,
                message: "Admin login required."
            });

        }

        const adminId = req.session.user.id;
        const subjectId = req.query.subjectId;

        if (!subjectId) {

            return res.status(400).json({
                success: false,
                message: "Subject ID is required."
            });

        }


        // Check that this subject belongs to the admin

        const [assignedSubject] = await db.execute(
            `
            SELECT subject_id
            FROM admin_subjects
            WHERE admin_id = ?
              AND subject_id = ?
            `,
            [adminId, subjectId]
        );


        if (assignedSubject.length === 0) {

            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this subject."
            });

        }


        // Only published exams

        const [exams] = await db.execute(
            `
            SELECT
                e.id,
                e.exam_title,
                e.duration_minutes,
                e.total_marks,
                e.status,
                s.subject_code,
                s.subject_name,
                COUNT(q.id) AS question_count
            FROM exams e

            INNER JOIN subjects s
                ON e.subject_id = s.id

            LEFT JOIN exam_questions q
                ON e.id = q.exam_id

            WHERE e.subject_id = ?
              AND e.status = 'published'

            GROUP BY
                e.id,
                e.exam_title,
                e.duration_minutes,
                e.total_marks,
                e.status,
                s.subject_code,
                s.subject_name

            ORDER BY e.id DESC
            `,
            [subjectId]
        );


        res.json({
            success: true,
            exams
        });

    } catch (error) {

        console.error(
            "Admin results exams error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load exams."
        });

    }

});


// =====================================================
// ADMIN RESULTS - STUDENTS BY DIVISION
// =====================================================

app.get("/api/admin-results/students", async (req, res) => {

    try {

        if (!req.session.user || req.session.user.role !== "admin") {

            return res.status(401).json({
                success: false,
                message: "Admin login required."
            });

        }

        const examId = req.query.examId;
        const division = req.query.division;


        if (!examId || !division) {

            return res.status(400).json({
                success: false,
                message: "Exam ID and division are required."
            });

        }


        const adminId = req.session.user.id;


        // Check exam and subject authorization

        const [examAccess] = await db.execute(
            `
            SELECT
                e.id,
                e.exam_title,
                e.total_marks,
                e.subject_id,
                s.subject_code,
                s.subject_name

            FROM exams e

            INNER JOIN subjects s
                ON e.subject_id = s.id

            INNER JOIN admin_subjects ads
                ON ads.subject_id = e.subject_id

            WHERE e.id = ?
              AND e.status = 'published'
              AND ads.admin_id = ?
            `,
            [examId, adminId]
        );


        if (examAccess.length === 0) {

            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this exam."
            });

        }


        const exam = examAccess[0];


        // Load every student in selected division.
        // LEFT JOIN means students who never attempted
        // the exam are also shown.

        const [students] = await db.execute(
            `
            SELECT

                u.id AS student_id,

                u.full_name,

                p.roll_number,

                p.division,

                er.score,

                er.total_marks,

                er.submitted_at,

                CASE
                    WHEN er.id IS NOT NULL
                    THEN 1
                    ELSE 0
                END AS attended

            FROM users u

            INNER JOIN student_profiles p
                ON p.user_id = u.id

            LEFT JOIN exam_results er
                ON er.student_id = u.id
               AND er.exam_id = ?

            WHERE u.role = 'student'
              AND p.division = ?

            ORDER BY
                p.roll_number ASC,
                u.full_name ASC
            `,
            [examId, division]
        );


        res.json({
            success: true,
            exam,
            division,
            students
        });

    } catch (error) {

        console.error(
            "Admin results students error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load student results."
        });

    }

});

// =====================================================
// ADMIN MANAGEMENT
// =====================================================

// ==========================================
// CHECK MAIN ADMIN
// ==========================================

async function requireMainAdmin(req, res, next) {

    try {

        if (!req.session.user) {

            return res.status(401).json({
                success: false,
                message: "Admin login required."
            });

        }

        if (req.session.user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Admin access required."
            });

        }

        const [users] = await db.execute(
            `
            SELECT
                id,
                role,
                is_main_admin,
                admin_status
            FROM users
            WHERE id = ?
            LIMIT 1
            `,
            [req.session.user.id]
        );

        if (users.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Admin account not found."
            });

        }

        const user = users[0];

        if (
            user.role !== "admin" ||
            Number(user.is_main_admin) !== 1 ||
            user.admin_status !== "active"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Only the Main Admin can perform this action."
            });

        }

        next();

    } catch (error) {

        console.error(
            "MAIN ADMIN CHECK ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to verify Main Admin access."
        });

    }

}


// ==========================================
// GENERATE ADMIN KEY
// ==========================================

app.post(
    "/api/admin-management/generate-key",
    requireMainAdmin,
    async (req, res) => {

        try {

            const mainAdminId =
                req.session.user.id;


            // ==================================
            // REVOKE OLD ACTIVE KEYS
            // ==================================

            await db.execute(
                `
                UPDATE admin_invites
                SET status = 'revoked'
                WHERE created_by = ?
                  AND status = 'active'
                `,
                [mainAdminId]
            );


            // ==================================
            // GENERATE NEW RANDOM KEY
            // ==================================

            const inviteKey =
                "JAVA-ADMIN-" +
                crypto
                    .randomBytes(6)
                    .toString("hex")
                    .toUpperCase();


            // ==================================
            // SAVE NEW KEY
            // ==================================

            await db.execute(
                `
                INSERT INTO admin_invites
                (
                    invite_key,
                    created_by,
                    status
                )
                VALUES
                (?, ?, 'active')
                `,
                [
                    inviteKey,
                    mainAdminId
                ]
            );


            res.json({

                success: true,

                message:
                    "New Admin Key generated successfully.",

                inviteKey:
                    inviteKey

            });

        } catch (error) {

            console.error(
                "GENERATE ADMIN KEY ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to generate Admin Key."

            });

        }

    }
);


// ==========================================
// GET CURRENT ADMIN KEY
// ==========================================

app.get(
    "/api/admin-management/current-key",
    requireMainAdmin,
    async (req, res) => {

        try {

            const [keys] =
                await db.execute(
                    `
                    SELECT
                        id,
                        invite_key,
                        status,
                        created_at
                    FROM admin_invites
                    WHERE created_by = ?
                      AND status = 'active'
                    ORDER BY id DESC
                    LIMIT 1
                    `,
                    [req.session.user.id]
                );


            if (keys.length === 0) {

                return res.json({

                    success: true,

                    hasKey: false,

                    inviteKey: null

                });

            }


            res.json({

                success: true,

                hasKey: true,

                inviteKey:
                    keys[0].invite_key,

                createdAt:
                    keys[0].created_at

            });

        } catch (error) {

            console.error(
                "GET CURRENT ADMIN KEY ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to load current Admin Key."

            });

        }

    }
);


// ==========================================
// GET SECONDARY ADMINS
// ==========================================

app.get(
    "/api/admin-management/admins",
    requireMainAdmin,
    async (req, res) => {

        try {

            const [admins] =
                await db.execute(
                    `
                    SELECT
                        id,
                        full_name,
                        email,
                        phone,
                        admin_status
                    FROM users
                    WHERE role = 'admin'
                      AND is_main_admin = 0
                    ORDER BY id ASC
                    `
                );


            res.json({

                success: true,

                admins:
                    admins

            });

        } catch (error) {

            console.error(
                "GET SECONDARY ADMINS ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to load secondary admins."

            });

        }

    }
);


// ==========================================
// REVOKE SECONDARY ADMIN
// ==========================================

app.put(
    "/api/admin-management/admins/:id/revoke",
    requireMainAdmin,
    async (req, res) => {

        try {

            const adminId =
                Number(req.params.id);


            if (
                !Number.isInteger(adminId) ||
                adminId <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid admin ID."

                });

            }


            // ==================================
            // CHECK TARGET ADMIN
            // ==================================

            const [admins] =
                await db.execute(
                    `
                    SELECT
                        id,
                        role,
                        is_main_admin,
                        admin_status
                    FROM users
                    WHERE id = ?
                    LIMIT 1
                    `,
                    [adminId]
                );


            if (admins.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Admin account not found."

                });

            }


            const targetAdmin =
                admins[0];


            // ==================================
            // NEVER ALLOW MAIN ADMIN REVOCATION
            // ==================================

            if (
                targetAdmin.role !== "admin" ||
                Number(targetAdmin.is_main_admin) === 1
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "The Main Admin cannot be revoked."

                });

            }


            // ==================================
            // REVOKE SECONDARY ADMIN
            // ==================================

            await db.execute(
                `
                UPDATE users
                SET admin_status = 'revoked'
                WHERE id = ?
                  AND role = 'admin'
                  AND is_main_admin = 0
                `,
                [adminId]
            );


            res.json({

                success: true,

                message:
                    "Secondary Admin revoked successfully."

            });

        } catch (error) {

            console.error(
                "REVOKE ADMIN ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to revoke secondary admin."

            });

        }

    }
);


// ==========================================
// SECONDARY ADMIN JOIN
// ==========================================

app.post(
    "/api/admin-management/join",
    async (req, res) => {

        try {

            const {
                fullName,
                email,
                phone,
                adminKey,
                password,
                confirmPassword
            } = req.body;


            // ==================================
            // BASIC VALIDATION
            // ==================================

            if (
                !fullName ||
                !email ||
                !phone ||
                !adminKey ||
                !password ||
                !confirmPassword
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please fill in all fields."
                });

            }


            if (password.length < 6) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Password must be at least 6 characters."
                });

            }


            if (password !== confirmPassword) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Passwords do not match."
                });

            }


            const cleanName =
                fullName.trim();

            const cleanEmail =
                email.trim().toLowerCase();

            const cleanPhone =
                phone.trim();

            const cleanKey =
                adminKey.trim();


            // ==================================
            // CHECK ADMIN KEY
            // ==================================

            const [inviteRows] =
                await db.execute(
                    `
                    SELECT
                        id,
                        invite_key,
                        created_by,
                        status
                    FROM admin_invites
                    WHERE invite_key = ?
                    LIMIT 1
                    `,
                    [cleanKey]
                );


            if (inviteRows.length === 0) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid Admin Key."
                });

            }


            const invite =
                inviteRows[0];


            // ==================================
            // KEY MUST BE ACTIVE
            // ==================================

            if (invite.status !== "active") {

                return res.status(400).json({
                    success: false,
                    message:
                        "This Admin Key has already been used or revoked."
                });

            }


            // ==================================
            // CHECK EMAIL
            // ==================================

            const [existingEmail] =
                await db.execute(
                    `
                    SELECT
                        id,
                        role
                    FROM users
                    WHERE email = ?
                    LIMIT 1
                    `,
                    [cleanEmail]
                );


            if (existingEmail.length > 0) {

                return res.status(409).json({
                    success: false,
                    message:
                        "An account with this email already exists."
                });

            }


            // ==================================
            // CHECK PHONE
            // ==================================

            const [existingPhone] =
                await db.execute(
                    `
                    SELECT
                        id
                    FROM users
                    WHERE phone = ?
                    LIMIT 1
                    `,
                    [cleanPhone]
                );


            if (existingPhone.length > 0) {

                return res.status(409).json({
                    success: false,
                    message:
                        "An account with this phone number already exists."
                });

            }


            // ==================================
            // GET MAIN ADMIN
            // ==================================

            const [mainAdmins] =
                await db.execute(
                    `
                    SELECT
                        id
                    FROM users
                    WHERE id = ?
                      AND role = 'admin'
                      AND is_main_admin = 1
                      AND admin_status = 'active'
                    LIMIT 1
                    `,
                    [invite.created_by]
                );


            if (mainAdmins.length === 0) {

                return res.status(400).json({
                    success: false,
                    message:
                        "The Main Admin account is not active."
                });

            }


            // ==================================
            // HASH PASSWORD
            // ==================================

            const passwordHash =
                await bcrypt.hash(
                    password,
                    10
                );


            // ==================================
            // CREATE SECONDARY ADMIN
            // ==================================

            const [newAdmin] =
                await db.execute(
                    `
                    INSERT INTO users
                    (
                        full_name,
                        email,
                        phone,
                        password_hash,
                        role,
                        is_main_admin,
                        admin_status
                    )
                    VALUES
                    (?, ?, ?, ?, 'admin', 0, 'active')
                    `,
                    [
                        cleanName,
                        cleanEmail,
                        cleanPhone,
                        passwordHash
                    ]
                );


            const newAdminId =
                newAdmin.insertId;


            // ==================================
            // COPY MAIN ADMIN SUBJECTS
            // ==================================

            await db.execute(
                `
                INSERT INTO admin_subjects
                (
                    admin_id,
                    subject_id
                )
                SELECT
                    ?,
                    subject_id
                FROM admin_subjects
                WHERE admin_id = ?
                `,
                [
                    newAdminId,
                    invite.created_by
                ]
            );


            // ==================================
            // MARK ADMIN KEY AS USED
            // ==================================

            await db.execute(
                `
                UPDATE admin_invites
                SET
                    status = 'used',
                    used_by = ?,
                    used_at = CURRENT_TIMESTAMP
                WHERE id = ?
                  AND status = 'active'
                `,
                [
                    newAdminId,
                    invite.id
                ]
            );


            // ==================================
            // SUCCESS
            // ==================================

            return res.json({

                success: true,

                message:
                    "Secondary Admin account created successfully."

            });

        }
        catch (error) {

            console.error(
                "SECONDARY ADMIN JOIN ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to create Secondary Admin account."

            });

        }

    }
);
// ==========================================
// FORGOT PASSWORD - SEND OTP
// ==========================================

app.post(
    "/api/forgot-password/send-otp",
    async (req, res) => {

        try {

            const email =
                String(req.body.email || "")
                    .trim()
                    .toLowerCase();


            // CHECK EMAIL
            if (!email) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please enter your email."
                });

            }


            // FIND STUDENT ACCOUNT
            const [users] =
                await db.execute(
                    `SELECT
                        id,
                        full_name,
                        email,
                        role
                     FROM users
                     WHERE email = ?
                       AND role = 'student'
                     LIMIT 1`,
                    [email]
                );


            /*
             * We intentionally use the same message
             * whether the email exists or not.
             *
             * This prevents someone from checking
             * which emails have student accounts.
             */

            if (users.length === 0) {

                return res.json({
                    success: true,
                    message:
                        "If a student account exists with this email, an OTP has been sent."
                });

            }


            const user = users[0];


            // GENERATE 6-DIGIT OTP
            const otp =
                crypto.randomInt(
                    100000,
                    1000000
                ).toString();


            // HASH OTP
            const otpHash =
                await bcrypt.hash(
                    otp,
                    10
                );


            // OTP VALID FOR 10 MINUTES
            const expiresAt =
                new Date(
                    Date.now() +
                    10 * 60 * 1000
                );


            // REMOVE OLD RESET OTPS
            await db.execute(
                `DELETE FROM password_reset_otps
                 WHERE user_id = ?`,
                [user.id]
            );


            // SAVE NEW OTP
            await db.execute(
                `INSERT INTO password_reset_otps
                (
                    user_id,
                    email,
                    otp_hash,
                    expires_at,
                    attempts,
                    verified
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    0,
                    FALSE
                )`,
                [
                    user.id,
                    user.email,
                    otpHash,
                    expiresAt
                ]
            );


            // SEND OTP EMAIL
            await emailTransporter.sendMail({

                from:
                    `"Project Java" <${process.env.EMAIL_FROM}>`,

                to:
                    user.email,

                subject:
                    "Project Java - Password Reset OTP",

                text:
                    `Hello ${user.full_name}, ` +
                    `your Project Java password reset OTP is ${otp}. ` +
                    `This OTP will expire in 10 minutes.`,

                html: `
                    <div style="
                        font-family: Arial, sans-serif;
                        max-width: 500px;
                        margin: auto;
                        padding: 25px;
                        border: 1px solid #ddd;
                        border-radius: 12px;
                    ">

                        <h2>
                            Project Java
                        </h2>

                        <p>
                            Hello ${user.full_name},
                        </p>

                        <p>
                            We received a request to reset
                            your Project Java password.
                        </p>

                        <p>
                            Your password reset OTP is:
                        </p>

                        <h1 style="
                            letter-spacing: 8px;
                            color: #2563eb;
                        ">
                            ${otp}
                        </h1>

                        <p>
                            This OTP will expire in
                            <strong>10 minutes</strong>.
                        </p>

                        <p>
                            If you did not request a
                            password reset, you can safely
                            ignore this email.
                        </p>

                    </div>
                `
            });


            console.log(
                "PASSWORD RESET OTP SENT TO:",
                user.email
            );


            res.json({

                success: true,

                message:
                    "If a student account exists with this email, an OTP has been sent."

            });


        } catch (error) {

            console.error(
                "FORGOT PASSWORD SEND OTP ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to send password reset OTP."

            });

        }

    }
);


// ==========================================
// FORGOT PASSWORD - VERIFY OTP
// ==========================================

app.post(
    "/api/forgot-password/verify-otp",
    async (req, res) => {

        try {

            const email =
                String(req.body.email || "")
                    .trim()
                    .toLowerCase();

            const otp =
                String(req.body.otp || "")
                    .trim();


            // VALIDATE INPUT
            if (
                !email ||
                !/^\d{6}$/.test(otp)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter a valid 6-digit OTP."

                });

            }


            // FIND STUDENT
            const [users] =
                await db.execute(
                    `SELECT
                        id,
                        email,
                        role
                     FROM users
                     WHERE email = ?
                       AND role = 'student'
                     LIMIT 1`,
                    [email]
                );


            if (users.length === 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid OTP."

                });

            }


            const user = users[0];


            // FIND ACTIVE OTP
            const [otpRows] =
                await db.execute(
                    `SELECT
                        id,
                        user_id,
                        email,
                        otp_hash,
                        expires_at,
                        attempts,
                        verified
                     FROM password_reset_otps
                     WHERE user_id = ?
                       AND verified = FALSE
                     ORDER BY id DESC
                     LIMIT 1`,
                    [user.id]
                );


            if (otpRows.length === 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No active OTP found. Please request a new OTP."

                });

            }


            const otpRecord =
                otpRows[0];


            // CHECK EXPIRY
            const currentTime =
                new Date();

            const expiryTime =
                new Date(
                    otpRecord.expires_at
                );


            if (
                currentTime >
                expiryTime
            ) {

                await db.execute(
                    `DELETE FROM password_reset_otps
                     WHERE id = ?`,
                    [otpRecord.id]
                );


                return res.status(400).json({

                    success: false,

                    message:
                        "OTP has expired. Please request a new OTP."

                });

            }


            // CHECK ATTEMPTS
            if (
                otpRecord.attempts >= 5
            ) {

                await db.execute(
                    `DELETE FROM password_reset_otps
                     WHERE id = ?`,
                    [otpRecord.id]
                );


                return res.status(429).json({

                    success: false,

                    message:
                        "Too many incorrect attempts. Please request a new OTP."

                });

            }


            // COMPARE OTP
            const otpMatch =
                await bcrypt.compare(
                    otp,
                    otpRecord.otp_hash
                );


            if (!otpMatch) {

                await db.execute(
                    `UPDATE password_reset_otps
                     SET attempts = attempts + 1
                     WHERE id = ?`,
                    [otpRecord.id]
                );


                return res.status(400).json({

                    success: false,

                    message:
                        "Incorrect OTP."

                });

            }


            // MARK OTP VERIFIED
            await db.execute(
                `UPDATE password_reset_otps
                 SET verified = TRUE
                 WHERE id = ?`,
                [otpRecord.id]
            );


            res.json({

                success: true,

                message:
                    "OTP verified successfully."

            });


        } catch (error) {

            console.error(
                "FORGOT PASSWORD VERIFY OTP ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to verify OTP."

            });

        }

    }
);


// ==========================================
// FORGOT PASSWORD - RESET PASSWORD
// ==========================================

app.post(
    "/api/forgot-password/reset",
    async (req, res) => {

        try {

            const email =
                String(req.body.email || "")
                    .trim()
                    .toLowerCase();

            const password =
                String(req.body.password || "");


            // VALIDATE INPUT
            if (!email) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email is required."

                });

            }


            if (password.length < 6) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Password must be at least 6 characters."

                });

            }


            // FIND STUDENT
            const [users] =
                await db.execute(
                    `SELECT
                        id,
                        email,
                        role
                     FROM users
                     WHERE email = ?
                       AND role = 'student'
                     LIMIT 1`,
                    [email]
                );


            if (users.length === 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Unable to reset password."

                });

            }


            const user = users[0];


            // CHECK THAT OTP WAS VERIFIED
            const [otpRows] =
                await db.execute(
                    `SELECT
                        id
                     FROM password_reset_otps
                     WHERE user_id = ?
                       AND verified = TRUE
                     ORDER BY id DESC
                     LIMIT 1`,
                    [user.id]
                );


            if (otpRows.length === 0) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Please verify the OTP first."

                });

            }


            // HASH NEW PASSWORD
            const passwordHash =
                await bcrypt.hash(
                    password,
                    12
                );


            // UPDATE PASSWORD
            await db.execute(
                `UPDATE users
                 SET password_hash = ?
                 WHERE id = ?
                   AND role = 'student'`,
                [
                    passwordHash,
                    user.id
                ]
            );


            // DELETE USED RESET OTP
            await db.execute(
                `DELETE FROM password_reset_otps
                 WHERE user_id = ?`,
                [user.id]
            );


            console.log(
                "STUDENT PASSWORD RESET:",
                user.email
            );


            res.json({

                success: true,

                message:
                    "Password reset successfully."

            });


        } catch (error) {

            console.error(
                "FORGOT PASSWORD RESET ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to reset password."

            });

        }

    }
);

// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    async () => {

        console.log(
            "----------------------------------"
        );

        console.log(
            "SMART ATTENDANCE SYSTEM"
        );

        console.log(
            "PROJECT JAVA"
        );

        console.log(
            "----------------------------------"
        );

        console.log(
            `Server running on http://localhost:${PORT}`
        );

        console.log(
            "----------------------------------"
        );

        await testDatabase();
    }
);