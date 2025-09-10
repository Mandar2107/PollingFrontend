import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as signalR from '@microsoft/signalr';

interface Message {
  user: string;
  text: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-component.html',
  styleUrls: ['./chat-component.scss']
})
export class ChatComponent implements OnInit {
  hubConnection!: signalR.HubConnection;
  chatMessages: Message[] = [];
  newMessage: string = '';
  username: string = '';

  ngOnInit() {
    // 👇 set username from localStorage (already stored when login)
    this.username = localStorage.getItem('loggedInUserName') || 'Guest';

    // 👇 setup hub connection
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7219/chatHub', {
        accessTokenFactory: () => localStorage.getItem('accessToken') || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('✅ Connected to SignalR'))
      .catch(err => console.error('❌ Error connecting SignalR:', err));

    // 👇 listen for messages from server
    this.hubConnection.on('ReceiveMessage', (user: string, text: string) => {
      this.chatMessages.push({ user, text });


      // auto scroll
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  sendChatMessage() {
    if (!this.newMessage.trim()) return;

    const message: Message = {
      user: this.username || 'Guest',
      text: this.newMessage.trim()
    };

    // 👇 push immediately so you see it instantly
    this.chatMessages.push(message);

    // 👇 send to SignalR server so other browsers see it
    this.hubConnection.invoke('SendMessage', message.user, message.text)
      .catch(err => console.error(err));

    this.newMessage = '';
    this.scrollToBottom();
  }
  showChat = true;

toggleChat() {
  this.showChat = !this.showChat;
}

  private scrollToBottom() {
    const container = document.querySelector<HTMLDivElement>('.messages');
    if (container) container.scrollTop = container.scrollHeight;
  }
}
