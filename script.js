document.addEventListener('DOMContentLoaded', function () {
  const prevMonthButton = document.getElementById('prevMonth');
  const nextMonthButton = document.getElementById('nextMonth');
  const currentMonthYear = document.getElementById('currentMonthYear');
  const calendarGrid = document.getElementById('calendarGrid');
  const weekLabelsContainer = document.getElementById('weekLabels');
  const periodInput = document.getElementById('periodInput');

  let currentDate = new Date();
  let periodStartDate = null;

  function updateCalendar() {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();

    currentMonthYear.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`;
    calendarGrid.innerHTML = '';
    weekLabelsContainer.innerHTML = '';

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekDays.forEach(day => {
      const weekLabel = document.createElement('div');
      weekLabel.classList.add('week-label');
      weekLabel.textContent = day;
      weekLabelsContainer.appendChild(weekLabel);
    });

    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dayElement = document.createElement('div');
      dayElement.textContent = i;
      dayElement.classList.add('day');

      if (periodStartDate) {
        if (isWithinPeriod(day, periodStartDate, 7)) {
          dayElement.classList.add('period');
        } else if (isWithinPeriod(day, getNextCycleStartDate(periodStartDate), 7)) {
          dayElement.classList.add('next-cycle');
        }
      }

      calendarGrid.appendChild(dayElement);
    }
  }


  function isWithinPeriod(date, periodStart, days) {
    const diffTime = Math.abs(date - periodStart);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays < days;
  }

  function getNextCycleStartDate(periodStart) {
    const nextCycleStartDate = new Date(periodStart);
    nextCycleStartDate.setDate(periodStart.getDate() + 7 + 28);
    return nextCycleStartDate;
  }

  prevMonthButton.addEventListener('click', function () {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
  });

  nextMonthButton.addEventListener('click', function () {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
  });

  periodInput.addEventListener('change', function () {
    const inputDate = new Date(periodInput.value);
    if (!isNaN(inputDate)) {
      periodStartDate = inputDate;
      updateCalendar();
    }
  });

  updateCalendar();
});
// chatbot
const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
const API_KEY = "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"; // Paste your API key here
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    // Create a chat <li> element with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi; // return chat <li> element
}

const generateResponse = (chatElement) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const messageElement = chatElement.querySelector("p");

    // Define the properties and message for the API request
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: userMessage}],
        })
    }

    // Send POST request to API, get response and set the reponse as paragraph text
    fetch(API_URL, requestOptions).then(res => res.json()).then(data => {
        messageElement.textContent = data.choices[0].message.content.trim();
    }).catch(() => {
        messageElement.classList.add("error");
        messageElement.textContent = "Oops! Something went wrong. Please try again.";
    }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

const handleChat = () => {
    userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
    if(!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    setTimeout(() => {
        // Display "Thinking..." message while waiting for the response
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

chatInput.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window 
    // width is greater than 800px, handle the chat
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));