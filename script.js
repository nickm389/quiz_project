var quiz_data = {
    name: "",
    selectedQuiz: "",
    currentQuestion: 0,
    score: 0,
    total: 5,
    startTime: 0
}

function render_view(view_id, context = {}) {
    var source = document.querySelector(view_id).innerHTML
    var template = Handlebars.compile(source)
    var html = template(context)
    document.querySelector("#view_widget").innerHTML = html
}

function start_quiz() {
    render_view("#home_view")

    document.querySelector("#start_form").addEventListener("submit", function (e) {
        e.preventDefault()
        quiz_data.name = document.querySelector("#studentName").value
        quiz_data.selectedQuiz = document.querySelector("#quizSelect").value
        quiz_data.currentQuestion = 0
        quiz_data.score = 0
        quiz_data.startTime = Date.now()
        quiz_data.total = 5
        next_question()
    })
}

async function fetch_question(number) {
    let url = `https://my-json-server.typicode.com/nickm389/quizquestions/db`
    let response = await fetch(url)
    let data = await response.json()
    let quizSet = data.quiz_questions[quiz_data.selectedQuiz]
    return quizSet[number]
}


function next_question() {
    if (quiz_data.currentQuestion >= quiz_data.total) {
        end_quiz()
        return
    }

    fetch_question(quiz_data.currentQuestion).then(function (question) {
        render_view("#quiz_view", {
            name: quiz_data.name,
            score: quiz_data.score,
            total: quiz_data.total,
            current: quiz_data.currentQuestion + 1,
            question: question
        })

        var buttons = document.querySelectorAll(".answer-btn")
        buttons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                var correct = btn.dataset.correct === "true"
                handle_answer(correct)
            })
        })
    })
}


function handle_answer(correct) {
    var explanations = {
        python: [
            { 
                correct: ".py", 
                explanation: " Python files use the .py extension." 
            },
            { 
                correct: "def", 
                explanation: " Functions in Python are defined using the def keyword." 
            },
            { 
                correct: "# This is a comment",
                explanation: "Python uses # to start single-line comments." 
            },
            { 
                correct: "[1, 2, 3]", 
                explanation: "Python lists are declared using square brackets." 
            },
            { 
                correct: "<class 'int'>", 
                explanation: "type(42) returns <class 'int'> because 42 is an integer." 
            }
        ],
        java: [
            { 
                correct: "class", 
                xplanation: " In Java, the class keyword is used to define a new class." 
            },
            { 
                correct: "main()", 
                explanation: " Java programs start from the main() method, public static void main(String[] args) { }" },
            { 
                correct: "int number = 5;", 
                explanation: " You need to declare integers in Java with a type, a variable name, and a value." },
            { 
                correct: ";", 
                explanation: " Java semicolons are used to end a statement." },
            { 
                correct: "public", 
                explanation: " The public access modifier allows the most visibility in a java file." 
            }
        ]
    }

    var current = quiz_data.currentQuestion
    var info = explanations[quiz_data.selectedQuiz][current]

    if (correct) {
        quiz_data.score = quiz_data.score + 1
        render_view("#feedback_correct", { 
            message: "Good Job!" })
        setTimeout(function () {
            quiz_data.currentQuestion =  quiz_data.currentQuestion + 1
            next_question()
        }, 1000)
    } 
    else {
        render_view("#feedback_wrong", {
            correct: info.correct,
            explanation: info.explanation
        })

        setTimeout(function () {
            var nextBtn = document.querySelector("#nextBtn")
            if (nextBtn) {
                nextBtn.addEventListener("click", function () {
                    quiz_data.currentQuestion =  quiz_data.currentQuestion + 1
                    next_question()
                })
            }
        }, 100)
    }
}

function end_quiz() {
    var raw = quiz_data.score / quiz_data.total * 100
    var percent = Math.round(raw)
    var message = ""

    if (raw >= 70) {
        message = "Quiz Passed!"
    } 
    else {
        message = "Quiz Failed!"
    }

    render_view("#result_view", {
        message: message,
        score: percent
    })

    document.querySelector("#go_home").addEventListener("click", function () {
        location.reload()
    })
}

window.addEventListener("DOMContentLoaded", function () {
    start_quiz()
})
