import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { PollDto } from './poll.service';

@Injectable({
  providedIn: 'root'
})
export class PollSignalRService {
  private hubConnection!: signalR.HubConnection;
  private pollUpdatesSource = new BehaviorSubject<PollDto | null>(null);
  pollUpdates$ = this.pollUpdatesSource.asObservable();

  startConnection() {
    console.log('Starting SignalR connection...');

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7219/pollHub', {
        accessTokenFactory: () => localStorage.getItem('accessToken') || ''
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information) // 👈 log all details
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('✅ SignalR connected!'))
      .catch(err => console.error('❌ SignalR connection failed: ', err));

    // Listen to server events
    this.hubConnection.on('ReceivePollUpdate', (poll: PollDto) => {
      console.log('📩 Poll update received from SignalR:', poll);
      this.pollUpdatesSource.next(poll);
    });

    // Connection close
    this.hubConnection.onclose(error => {
      console.error('⚠️ SignalR disconnected:', error);
    });
  }
}
