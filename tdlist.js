if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(swReg) {
        console.log('Service Worker Registered', swReg);
        swRegistration = swReg;
    })
    .catch(function(error) {
        console.error('Service Worker Error', error);
    });
}

document.getElementById('add-task-button').addEventListener('click', async function() {
    let taskText = document.getElementById('new-task').value;
    let dueDate = document.getElementById('due-date').value;
    if (taskText === '') {
        alert('Please enter a task');
        return;
    }
    
    let li = document.createElement('li');
    
    let taskContent = document.createElement('span');
    taskContent.textContent = taskText;
    
    if (dueDate) {
        let dueDateElement = document.createElement('small');
        dueDateElement.textContent = ` (Due: ${new Date(dueDate).toLocaleString()})`;
        taskContent.appendChild(dueDateElement);

        // Set up the reminder
        let dueTime = new Date(dueDate).getTime();
        let now = new Date().getTime();
        let timeUntilDue = dueTime - now;

        if (timeUntilDue > 0) {
            await scheduleNotification(taskText, timeUntilDue);
        }
    }
    
    let removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', function() {
        li.classList.add('removing');
        li.addEventListener('animationend', () => li.remove());
    });
    
    li.appendChild(taskContent);
    li.appendChild(removeButton);
    
    li.addEventListener('click', function() {
        li.classList.toggle('completed');
    });
    
    document.getElementById('task-list').appendChild(li);
    document.getElementById('new-task').value = '';
    document.getElementById('due-date').value = '';
});

async function scheduleNotification(taskText, timeUntilDue) {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        alert('You need to grant notification permissions for reminders.');
        return;
    }

    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(`Reminder set for ${taskText}`, {
        body: `Reminder will go off in ${Math.round(timeUntilDue / 1000 / 60)} minutes.`,
        icon: 'icon.png', // Optional
    });

    setTimeout(() => {
        registration.showNotification('Task Reminder', {
            body: `${taskText} is due now!`,
            icon: 'icon.png', // Optional
        });
    }, timeUntilDue);
}
self.addEventListener('install', function(event) {
    console.log('Service Worker installed');
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker activated');
});

self.addEventListener('push', function(event) {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: 'icon.png' // You can provide an icon for the notification
    });
});
