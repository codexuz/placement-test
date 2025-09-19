// DOM Elements
const progressBar = document.getElementById("progress-bar");
const currentQuestionEl = document.getElementById("current-question");
const totalQuestionsEl = document.getElementById("total-questions");
const scoreEl = document.getElementById("score");
const welcomeScreen = document.getElementById("welcome-screen");
const quizContent = document.getElementById("quiz-content");
const fullNameInput = document.getElementById("full-name");
const startBtn = document.getElementById("start-btn");
const questionContainer = document.getElementById("question-container");
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const resultContainer = document.getElementById("result-container");
const resultIconEl = document.getElementById("result-icon");
const resultTextEl = document.getElementById("result-text");
const correctAnswerEl = document.getElementById("correct-answer");
const nextBtn = document.getElementById("next-btn");
const finishBtn = document.getElementById("finish-btn");
const finalResultsEl = document.getElementById("final-results");
const finalScoreEl = document.getElementById("final-score");
const maxScoreEl = document.getElementById("max-score");
const scorePercentageEl = document.getElementById("score-percentage");
const percentageTextEl = document.getElementById("percentage-text");
const resultStudentNameEl = document.getElementById("result-student-name");
const restartBtn = document.getElementById("restart-btn");
const confettiContainer = document.getElementById("confetti-container");

// Variables
let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedChoiceId = null;
let quizFinished = false;
let studentName = "";
let telegramConfig = {
  enabled: true,
  botToken: "8476979666:AAE0_JzRPi2dzzcpQpykjF-1gzIOHlQNtys",
  chatId: "7087270085",
};

// Fetch quiz data
async function fetchQuizData() {
  try {
    const response = await fetch("sanitized-quiz.json");
    const res = await response.json();
    quizData = res; // Limit to first 10 questions for demo

    // Don't initialize the quiz yet, wait for user to enter name and click start
    // Instead, show the welcome screen
    showWelcomeScreen();
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    questionEl.textContent = "Error loading quiz. Please try again later.";
  }
}

// Show welcome screen
function showWelcomeScreen() {
  welcomeScreen.classList.remove("hidden");
  quizContent.classList.add("hidden");
  document.querySelector(".controls").classList.add("hidden");
  document.querySelector(".stats").classList.add("hidden");
  document.querySelector(".progress-container").classList.add("hidden");
}

// Start the quiz
function startQuiz() {
  // Validate name
  if (!fullNameInput.value.trim()) {
    // Shake the input to indicate it's required
    fullNameInput.style.animation = "shake 0.5s ease-in-out";
    setTimeout(() => {
      fullNameInput.style.animation = "";
    }, 500);
    return;
  }

  // Store the student name
  studentName = fullNameInput.value.trim();

  // Hide welcome screen, show quiz
  welcomeScreen.classList.add("hidden");
  quizContent.classList.remove("hidden");
  document.querySelector(".controls").classList.remove("hidden");
  document.querySelector(".stats").classList.remove("hidden");
  document.querySelector(".progress-container").classList.remove("hidden");

  // Initialize quiz
  initializeQuiz();
}

// Initialize quiz
function initializeQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  quizFinished = false;

  // Update UI elements
  totalQuestionsEl.textContent = quizData.length;
  scoreEl.textContent = score;

  // Display first question
  displayQuestion();

  // Update progress bar
  updateProgressBar();
}

// Display current question
function displayQuestion() {
  const currentQuestion = quizData[currentQuestionIndex];

  if (!currentQuestion) {
    showFinalResults();
    return;
  }

  // Clear previous selection
  selectedChoiceId = null;
  nextBtn.disabled = true;

  // Update question number
  currentQuestionEl.textContent = currentQuestionIndex + 1;

  // Display question
  questionEl.textContent = currentQuestion.title;

  // Clear previous choices
  choicesEl.innerHTML = "";

  // Display choices
  const letters = ["A", "B", "C", "D"];
  currentQuestion.choices.forEach((choice, index) => {
    const choiceElement = document.createElement("div");
    choiceElement.classList.add("choice");
    choiceElement.dataset.id = choice.id;

    const letterSpan = document.createElement("span");
    letterSpan.classList.add("choice-letter");
    letterSpan.textContent = letters[index];

    const labelSpan = document.createElement("span");
    labelSpan.classList.add("choice-label");
    labelSpan.textContent = choice.label;

    choiceElement.appendChild(letterSpan);
    choiceElement.appendChild(labelSpan);

    choiceElement.addEventListener("click", () => selectChoice(choice.id));

    choicesEl.appendChild(choiceElement);
  });

  // Show question container, hide results container
  questionContainer.classList.remove("hidden");
  resultContainer.classList.add("hidden");

  // Show/hide appropriate buttons
  if (currentQuestionIndex === quizData.length - 1) {
    nextBtn.classList.add("hidden");
    finishBtn.classList.remove("hidden");
  } else {
    nextBtn.classList.remove("hidden");
    finishBtn.classList.add("hidden");
  }

  // Reset final results view
  finalResultsEl.classList.add("hidden");

  // Apply animation
  questionContainer.style.animation = "none";
  setTimeout(() => {
    questionContainer.style.animation = "slideIn 0.5s ease-in-out";
  }, 10);
}

// Select a choice
function selectChoice(choiceId) {
  // Prevent selection after answer is checked
  if (resultContainer.classList.contains("hidden") === false) {
    return;
  }

  selectedChoiceId = choiceId;
  nextBtn.disabled = false;
  finishBtn.disabled = false;

  // Update UI to show selected choice
  const choices = choicesEl.querySelectorAll(".choice");
  choices.forEach((choice) => {
    if (choice.dataset.id === choiceId) {
      choice.classList.add("selected");
    } else {
      choice.classList.remove("selected");
    }
  });

  // Apply pulse animation to selected choice
  const selectedChoice = choicesEl.querySelector(
    `.choice[data-id="${choiceId}"]`
  );
  selectedChoice.style.animation = "pulse 0.3s ease-in-out";
  setTimeout(() => {
    selectedChoice.style.animation = "";
  }, 300);
}

// Check answer
function checkAnswer() {
  const currentQuestion = quizData[currentQuestionIndex];
  const isCorrect = selectedChoiceId === currentQuestion.correctAnswer;

  if (isCorrect) {
    score += currentQuestion.score;
    scoreEl.textContent = score;

    // Animate score counter
    scoreEl.style.animation = "pulse 0.5s ease-in-out";
    setTimeout(() => {
      scoreEl.style.animation = "";
    }, 500);
  }

  // Show feedback
  showResultFeedback(isCorrect, currentQuestion);

  // Update choice styling
  const choices = choicesEl.querySelectorAll(".choice");
  choices.forEach((choice) => {
    const choiceId = choice.dataset.id;

    if (choiceId === currentQuestion.correctAnswer) {
      choice.classList.add("correct");
    } else if (choiceId === selectedChoiceId && !isCorrect) {
      choice.classList.add("incorrect");

      // Apply shake animation to incorrect choice
      choice.style.animation = "shake 0.5s ease-in-out";
      setTimeout(() => {
        choice.style.animation = "";
      }, 500);
    }
  });
}

// Show result feedback
function showResultFeedback(isCorrect, question) {
  resultIconEl.className = isCorrect
    ? "fas fa-check-circle correct"
    : "fas fa-times-circle incorrect";
  resultTextEl.textContent = isCorrect ? "Correct!" : "Incorrect!";

  if (!isCorrect) {
    // Find the correct answer text
    const correctAnswerObj = question.choices.find(
      (choice) => choice.id === question.correctAnswer
    );
    correctAnswerEl.textContent = `The correct answer is: ${correctAnswerObj.label}`;
  } else {
    correctAnswerEl.textContent = "";
  }

  resultContainer.classList.remove("hidden");

  if (isCorrect) {
    createConfetti(20);
  }
}

// Move to next question
function nextQuestion() {
  currentQuestionIndex++;
  updateProgressBar();
  displayQuestion();
}

// Update progress bar
function updateProgressBar() {
  const progressPercentage = (currentQuestionIndex / quizData.length) * 100;
  progressBar.style.width = `${progressPercentage}%`;
}

// Show final results
function showFinalResults() {
  questionContainer.classList.add("hidden");
  resultContainer.classList.add("hidden");
  nextBtn.classList.add("hidden");
  finishBtn.classList.add("hidden");
  document.querySelector(".controls").classList.add("hidden");
  finalResultsEl.classList.remove("hidden");

  const totalPossibleScore = quizData.reduce(
    (sum, question) => sum + question.score,
    0
  );
  const percentage = Math.round((score / totalPossibleScore) * 100);

  // Display student name
  resultStudentNameEl.textContent = studentName;

  finalScoreEl.textContent = score;
  maxScoreEl.textContent = totalPossibleScore;

  // Animate the score percentage bar
  setTimeout(() => {
    scorePercentageEl.style.width = `${percentage}%`;
    percentageTextEl.textContent = `${percentage}%`;
  }, 200);

  // Show confetti for good scores
  if (percentage >= 70) {
    createConfetti(100);
  }

  quizFinished = true;

  // Send results to Telegram bot
  sendResultsToTelegram(score, totalPossibleScore, percentage);
}

// Create confetti animation
function createConfetti(count) {
  // Clear previous confetti
  confettiContainer.innerHTML = "";

  const colors = [
    "#ff3366",
    "#36ff66",
    "#3399ff",
    "#ffcc33",
    "#9966ff",
    "#ff6699",
  ];

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");

    // Random properties
    const size = Math.random() * 10 + 5; // Size between 5-15px
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100; // Position from 0-100%
    const duration = Math.random() * 3 + 2; // Animation duration 2-5s
    const delay = Math.random() * 0.5; // Delay 0-0.5s

    // Apply styles
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = color;
    confetti.style.left = `${left}%`;
    confetti.style.animationDuration = `${duration}s`;
    confetti.style.animationDelay = `${delay}s`;

    // Random shape (square, circle, or rotated square)
    const shapeType = Math.floor(Math.random() * 3);
    if (shapeType === 0) {
      confetti.style.borderRadius = "50%";
    } else if (shapeType === 1) {
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    }

    confettiContainer.appendChild(confetti);

    // Remove confetti after animation completes
    setTimeout(() => {
      confetti.remove();
    }, (duration + delay) * 1000);
  }
}

// Send quiz results to Telegram bot
async function sendResultsToTelegram(score, totalScore, percentage) {
  // Create the message with quiz results
  const message = `
📊 Placement Test Results:
👤 Student: ${studentName}
✅ Score: ${score}/${totalScore}
🎯 Percentage: ${percentage}%
📅 Date: ${new Date().toLocaleString()}
  `;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: telegramConfig.chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const result = await response.json();
    if (result.ok) {
      console.log("Quiz results successfully sent to Telegram");

      // Show success notification to user
      const notification = document.createElement("div");
      notification.className = "telegram-notification success";
      notification.textContent = "Results sent to Telegram!";
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.remove();
      }, 3000);
    } else {
      console.error("Failed to send results to Telegram:", result.description);

      // Show error notification to user
      const notification = document.createElement("div");
      notification.className = "telegram-notification error";
      notification.textContent = "Failed to send results to Telegram";
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  } catch (error) {
    console.error("Error sending results to Telegram:", error);
  }
}

// Event Listeners
nextBtn.addEventListener("click", () => {
  if (selectedChoiceId) {
    checkAnswer();

    // Enable the button to proceed after checking answer
    nextBtn.textContent = "Next Question";
    nextBtn.removeEventListener("click", checkAnswer);
    nextBtn.addEventListener("click", nextQuestion, { once: true });
  }
});

finishBtn.addEventListener("click", () => {
  if (selectedChoiceId) {
    checkAnswer();

    // Enable the button to proceed to results after checking answer
    finishBtn.textContent = "See Results";
    finishBtn.removeEventListener("click", checkAnswer);
    finishBtn.addEventListener("click", showFinalResults, { once: true });
  }
});

restartBtn.addEventListener("click", () => {
  // Reset to welcome screen when restarting
  showWelcomeScreen();
  fullNameInput.value = ""; // Clear the name input
});

// Start button event listener
startBtn.addEventListener("click", startQuiz);

// Allow pressing Enter in the name input to start the quiz
fullNameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    startQuiz();
  }
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", fetchQuizData);


