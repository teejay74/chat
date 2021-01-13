export default class ChatWidget {
  constructor(url) {
    this.url = url;
    this.container = document.querySelector('body');
    this.usersOnline = [];
    this.currentUser = null;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('connected');
    };

    this.ws.onmessage = (evt) => {
      const response = JSON.parse(evt.data);
      if (response.type === 'alreadyName') {
        ChatWidget.showErrorName(document.querySelector('.widget'));
      } else if (response.type === 'users') {
        this.usersOnline = response.data;
        this.deleteForm();
        this.showChat();
      } else if (response.type === 'newMessage') {
        this.showNewMessage(response.data.data);
      } else if (response.type === 'disconnect' || response.type === 'connect') {
        console.log(response.data);
      }
    };

    this.ws.onclose = () => { console.log('Discconected'); };

    this.ws.onerror = () => {
      console.log('error');
    };

    window.addEventListener('beforeunload', () => {
      this.ws.send(JSON.stringify({ type: 'exitUser', user: this.currentUser }));
    });
  }

  init() {
    const form = document.createElement('form');
    form.classList.add('widget');

    form.innerHTML = ` <h2>Вход в чатик</h2>
          <input class="input widget-input" type="text" name="nick" placeholder="Введите свое имя" required>
          <button type="submit" class="btn">Вход</button>`;

    this.container.insertAdjacentElement('afterbegin', form);

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nickName = form.nick.value;
      const response = { type: 'newUser', user: nickName };
      this.currentUser = nickName;
      this.ws.send(JSON.stringify(response));
    });

    form.querySelector('.widget-input').addEventListener('input', () => {
      ChatWidget.deleteErrorName();
    });
  }

  static showErrorName(form) {
    const input = form.querySelector('.widget-input');
    input.focus();

    const error = document.createElement('div');
    error.classList.add('widget-error');
    error.textContent = 'Данное имя уже занято';

    input.insertAdjacentElement('afterend', error);
  }

  static deleteErrorName() {
    if (document.querySelector('.widget-error')) {
      document.querySelector('.widget-error').remove();
    }
  }

  deleteForm() {
    this.container.removeChild(this.container.firstChild);
  }

  showChat() {
    if (!document.querySelector('.container')) {
      const container = document.createElement('div');
      container.classList.add('container');

      container.innerHTML = `
              <div class="chat-container">
               <div class="chat-content"></div>
                  <form class="chat-form">
                      <input class="input chat-form-input" type="text" placeholder="Напишите что-нибудь" aria-label="Ваше сообщение" name="message" required>
                  </form>
              </div>
              <div class="users-list"></div>`;

      this.container.appendChild(container);

      const chatForm = container.querySelector('.chat-form');

      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatForm.message.value;
        const time = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString().slice(0, -3)}`;
        this.ws.send(JSON.stringify({
          type: 'newMessage',
          data: {
            name: this.currentUser,
            message,
            time,
          },
        }));

        chatForm.message.value = '';
      });
    }

    this.showUsers();
  }

  showUsers() {
    const users = document.querySelector('.users-list');
    users.innerHTML = '';

    this.usersOnline.forEach((user) => {
      const userItem = document.createElement('div');
      userItem.classList.add('user');
      const userName = document.createElement('div');
      userName.classList.add('user-name');
      userName.textContent = user.name;

      if (user.name === this.currentUser) {
        userName.textContent = `${user.name}(Вы)`;
      }

      userItem.appendChild(userName);

      users.appendChild(userItem);
    });
  }

  showNewMessage(data) {
    const message = this.createMessage(data);
    this.container.querySelector('.chat-content').appendChild(message);
  }

  createMessage(data) {
    const newMessage = document.createElement('div');
    newMessage.classList.add('chat-message');

    newMessage.innerHTML = ` <div class="mes-top"><span class="chat-message-name"></span>
              <span class="chat-message-time">${data.time}</span></div>
              <div class="chat-mes-content">${data.message}</div>`;

    const userChatName = newMessage.querySelector('.chat-message-name');

    if (data.name === this.currentUser) {
      userChatName.textContent = 'Вы';
      newMessage.classList.add('your-message');
    } else {
      newMessage.classList.remove('your-message');
      userChatName.textContent = data.name;
    }

    return newMessage;
  }
}
