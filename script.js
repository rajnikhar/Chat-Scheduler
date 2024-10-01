// DOM Elements
const messagesDiv = document.getElementById('messages');
const sendButton = document.getElementById('sendButton');
const scheduleButton = document.getElementById('scheduleButton');
const messageText = document.getElementById('messageText');
const scheduleTime = document.getElementById('scheduleTime');

// Store scheduled messages locally
let scheduledMessages = [];

// Function to format the timestamp
function formatTimestamp(date) {
    const d = new Date(date);
    const options = { 
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    };
    return d.toLocaleDateString('en-US', options);
}

// Function to append a message to the chat box
function appendMessage(data) {
    const messageElement = document.createElement('div');
    messageElement.classList.add(data.sender === 'You' ? 'chat-r' : 'chat-l');

    const sp = document.createElement('div');
    sp.classList.add('sp');
    messageElement.appendChild(sp);

    const messDiv = document.createElement('div');
    messDiv.classList.add('mess');
    if (data.sender === 'You') {
        messDiv.classList.add('mess-r');
    }

    const p = document.createElement('p');
    if (data.isScheduled && !data.sent) {
        p.textContent = `${data.sender}: ${data.message} (Scheduled for ${formatTimestamp(data.scheduledAt)})`;
    } else {
        p.textContent = `${data.sender}: ${data.message}`;
    }
    messDiv.appendChild(p);

    const checkDiv = document.createElement('div');
    checkDiv.classList.add('check');

    const span = document.createElement('span');
    span.textContent = formatTimestamp(data.scheduledAt || new Date());

    checkDiv.appendChild(span);
    messDiv.appendChild(checkDiv);
    messageElement.appendChild(messDiv);
    messagesDiv.appendChild(messageElement);

    // Scroll to the bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Send message immediately
sendButton.addEventListener('click', () => {
    const message = messageText.value.trim();
    if (message !== "") {
        const data = {
            sender: 'You',
            receiver: 'Recipient', // You can modify this as needed
            message: message,
            sent: true,
            isScheduled: false
        };
        appendMessage(data); // Append immediately
        messageText.value = ''; // Clear the message input
    }
});

// Schedule a message
scheduleButton.addEventListener('click', () => {
    const message = messageText.value.trim();
    const scheduledAt = scheduleTime.value;

    if (message && scheduledAt) {
        const data = {
            sender: 'You',
            receiver: 'Recipient', // You can modify this as needed
            message: message,
            scheduledAt: new Date(scheduledAt),
            isScheduled: true,
            sent: false
        };

        // Store the scheduled message locally
        scheduledMessages.push(data);

        // Display it as a scheduled message
        appendMessage(data);

        // Clear the message and schedule input fields
        messageText.value = '';
        scheduleTime.value = '';
    } else {
        alert('Please enter a message and select a time.');
    }
});

// Check for messages that need to be sent
setInterval(() => {
    const now = new Date();

    scheduledMessages = scheduledMessages.filter(scheduled => {
        const scheduledTime = new Date(scheduled.scheduledAt);

        if (scheduledTime <= now) {
            // Send the scheduled message as a regular one (but do not create a new message box)
            const data = {
                sender: 'You',
                receiver: 'Recipient',
                message: scheduled.message,
                scheduledAt: new Date(), // Use current time for display
                isScheduled: false, // Mark it as sent
                sent: true
            };

            // Update the existing message in the messagesDiv
            const messageElements = Array.from(messagesDiv.children);
            const scheduledMessageElement = messageElements.find((msg) => {
                return msg.textContent.includes(scheduled.message) && msg.textContent.includes('(Scheduled for');
            });
            if (scheduledMessageElement) {
                // Update the text to show it as sent
                const p = scheduledMessageElement.querySelector('p');
                p.textContent = `${data.sender}: ${data.message}`;
                scheduledMessageElement.querySelector('.check span').textContent = formatTimestamp(new Date()); // Update timestamp
            }

            return false; // Remove from scheduledMessages
        }

        return true; // Keep it in the list if time hasn't arrived
    });
}, 1000); // Check every second
