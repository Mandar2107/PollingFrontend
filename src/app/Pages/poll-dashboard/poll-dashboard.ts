import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PollService, PollDto } from '../../Core/services/poll.service';
import { PollSignalRService } from '../../Core/services/signalr';

@Component({
  selector: 'app-poll-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './poll-dashboard.html',
  styleUrls: ['./poll-dashboard.scss']
})
export class PollDashboardComponent implements OnInit, OnDestroy {
  polls: PollDto[] = [];
  allPolls: PollDto[] = [];
  searchTerm = '';
  sortColumn = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  statusFilter: 'active' | 'expired' | null = null;

  currentPage = 1;
  pageSize = 6;
  totalPages = 1;

  selectedOptions: { [pollId: number]: number } = {};
  showResultsMap: { [pollId: number]: boolean } = {};

  barColors: string[] = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#20c997'];
  errorMessage = '';

  private searchTimeout: number | undefined;
  private pollUpdatesSubscription: Subscription | undefined;

  constructor(private pollService: PollService, private signalRService: PollSignalRService) {}

  ngOnInit(): void {
    this.loadPolls();

    this.signalRService.startConnection();

    this.pollUpdatesSubscription = this.signalRService.pollUpdates$.subscribe(updatedPoll => {
      if (updatedPoll) {
            console.log('SignalR update received:', updatedPoll);
        const index = this.polls.findIndex(p => p.id === updatedPoll.id);
        if (index > -1) {
          this.polls[index] = updatedPoll;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.pollUpdatesSubscription?.unsubscribe();
    // optional if your service has stopConnection
  }

  loadPolls(): void {
    this.pollService.getAllPolls(
      this.currentPage,
      this.pageSize,
      this.searchTerm,
      this.sortColumn,
      this.sortDirection,
      this.statusFilter ?? undefined
    ).subscribe({
      next: (res) => {
        this.polls = res.polls;
        this.allPolls = res.polls;
        this.polls.forEach(poll => {
          this.showResultsMap[poll.id] = poll.isVoted ?? false;
        });
        this.totalPages = Math.ceil(res.totalCount / this.pageSize);
        this.sortPolls();
      },
      error: () => {
        this.errorMessage = 'Failed to load polls. Please try again.';
      }
    });
  }

  onSearchChange(value: string) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = window.setTimeout(() => this.loadPolls(), 400);
  }

  sortPolls() {
    this.polls.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (this.sortColumn === 'status') {
        valA = this.isActive(a) ? 1 : 0;
        valB = this.isActive(b) ? 1 : 0;
      } else {
        valA = (a as any)[this.sortColumn];
        valB = (b as any)[this.sortColumn];
      }

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  changeSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortPolls();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadPolls();
  }

  submitVote(poll: PollDto) {
    const optionIndex = this.selectedOptions[poll.id];
    if (optionIndex === undefined) return;

    const optionId = poll.options[optionIndex].id;

    this.pollService.vote(poll.id, { pollOptionId: optionId }).subscribe({
      next: () => {
        this.pollService.getPollById(poll.id).subscribe(updated => {
          const index = this.polls.findIndex(p => p.id === poll.id);
          if (index > -1) this.polls[index] = updated;
          this.showResultsMap[poll.id] = true;
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Something went wrong while voting!';
      }
    });
  }

  getVotePercentage(poll: PollDto, optionIndex: number): number {
    const totalVotes = poll.options.reduce((sum, o) => sum + o.voteCount, 0);
    return totalVotes === 0 ? 0 : Math.round((poll.options[optionIndex].voteCount / totalVotes) * 100);
  }

  isActive(poll: PollDto): boolean {
    return new Date(poll.expiresAt) > new Date();
  }

  getBarColor(index: number): string {
    return this.barColors[index % this.barColors.length];
  }

  getBarStyle(poll: PollDto, optionIndex: number) {
    return {
      '--bar-width': this.getVotePercentage(poll, optionIndex) + '%',
      'background-color': this.getBarColor(optionIndex)
    };
  }
}
