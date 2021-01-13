import ChatWidget from './ChatWidget';

const chatWidget = new ChatWidget('wss://chat-server-task.herokuapp.com');
// const chatWidget = new ChatWidget('ws://localhost:7070');

chatWidget.init();
