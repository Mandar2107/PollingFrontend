import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

export interface ChatMessage {
  user: string;
  message: string;
  timestamp?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatSignalRService {
  private hubConnection!: signalR.HubConnection;
  private messagesSource = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSource.asObservable();

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7219/chatHub', {
        accessTokenFactory: () => localStorage.getItem('accessToken') || ''
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection.start()
      .then(() => console.log('✅ SignalR connected!'))
      .catch(err => console.error('❌ SignalR connection failed:', err));

    this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
      const current = this.messagesSource.value;
      this.messagesSource.next([...current, { user, message, timestamp: new Date() }]);
    });
  }

  sendMessage(user: string, message: string) {
    this.hubConnection.invoke('SendMessage', user, message)
      .catch(err => console.error(err));
  }
}
