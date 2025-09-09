import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PollService, PollDto, VoteRequestDto } from '../../Core/services/poll.service';
import { ExportCsvComponent } from '../export-csv-component/export-csv-component';

@Component({
  selector: 'app-polls',
  standalone: true,
  imports: [CommonModule, FormsModule,ExportCsvComponent],
  templateUrl: './polls.html',
  styleUrls: ['./polls.scss']
})
export class PollsComponent implements OnInit {
  polls: PollDto[] = [];
  filteredPolls: PollDto[] = [];
  searchTerm = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  showForm = false;
  formTitle = 'Create Poll';
  editingPollId: number | null = null;
  question = '';
  options: string[] = ['', ''];
  expiresAt = '';

  showVoteForm = false;
  activePoll: PollDto | null = null;
  selectedOptionIndex: number | null = null;
  isSubmittingVote = false;

  showResultsMap: { [pollId: number]: boolean } = {};

  constructor(
    private pollService: PollService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPolls();
  }

  // Load polls from backend
  loadPolls(): void {
    this.pollService.getMyPolls(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.polls = res.polls;
        this.totalPages = Math.ceil(res.totalCount / this.pageSize);
        this.polls.forEach(p => this.showResultsMap[p.id] = p.isVoted || false);
        this.applyFilters();
      },
      error: () => this.toastr.error('Failed to load polls')
    });
  }

 applyFilters() {
  // Copy polls array
  let result = [...this.polls];

  // Filter by search term
  if (this.searchTerm) {
    result = result.filter(p =>
      p.question.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Sorting
  if (this.sortColumn) {
    result.sort((a: any, b: any) => {
      let valA: any;
      let valB: any;

      if (this.sortColumn === 'status') {
        // Active = 1, Expired = 0
        valA = this.isActive(a) ? 1 : 0;
        valB = this.isActive(b) ? 1 : 0;
      } else {
        valA = a[this.sortColumn];
        valB = b[this.sortColumn];
      }

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Update filtered polls
  this.filteredPolls = result;
}



  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadPolls();
  }

  showCreateForm() {
    this.showForm = true;
    this.formTitle = 'Create Poll';
    this.editingPollId = null;
    this.question = '';
    this.options = ['', ''];
    this.expiresAt = '';
  }

  showEditForm(poll: PollDto) {
    this.showForm = true;
    this.formTitle = 'Edit Poll';
    this.editingPollId = poll.id;
    this.question = poll.question;
    this.expiresAt = poll.expiresAt ? new Date(poll.expiresAt).toISOString().split('T')[0] : '';
    this.options = poll.options.map(o => o.text);
    this.activePoll = { ...poll };
  }

  closeForm() {
    this.showForm = false;
    this.editingPollId = null;
    this.question = '';
    this.options = ['', ''];
    this.expiresAt = '';
  }

  addOption() {
    this.options.push('');
    setTimeout(() => this.focusLastOption(), 0);
  }

  removeOption(index: number) {
    this.options.splice(index, 1);
  }

  get isPollValid(): boolean {
    if (!this.question?.trim()) return false;
    const validOptions = this.options.filter(o => !!o && o.trim().length > 0);
    return validOptions.length >= 2;
  }

  savePoll() {
    if (!this.isPollValid) {
      this.toastr.warning('Question and at least 2 options are required');
      return;
    }
    if (this.editingPollId) {
      this.updatePoll();
    } else {
      this.createPoll();
    }
  }

  createPoll() {
    const dto: any = {
      question: this.question.trim(),
      options: this.options.filter(o => o.trim())
    };
    if (this.expiresAt) dto.expiresAt = new Date(this.expiresAt).toISOString();

    this.pollService.createPoll(dto).subscribe({
      next: () => {
        this.toastr.success('Poll created successfully');
        this.closeForm();
        this.loadPolls();
      },
      error: () => this.toastr.error('Failed to create poll')
    });
  }

  updatePoll() {
    if (!this.editingPollId || !this.activePoll) return;

    const hasVotes = this.activePoll.options.some(o => o.voteCount > 0);
    if (hasVotes) {
      this.toastr.warning('Cannot update poll with votes');
      this.closeForm();
      return;
    }

    const mappedOptions = this.options
      .filter(o => o.trim())
      .map(text => {
        const existing = this.activePoll!.options.find(o => o.text === text.trim());
        return { id: existing ? existing.id : 0, text: text.trim() };
      });

    const dto: any = {
      question: this.question.trim(),
      options: mappedOptions
    };
    if (this.expiresAt) dto.expiresAt = new Date(this.expiresAt).toISOString();

    this.pollService.updatePoll(this.editingPollId, dto).subscribe({
      next: () => {
        this.toastr.success('Poll updated successfully');
        this.loadPolls();
        this.closeForm();
      },
      error: () => this.toastr.error('Failed to update poll')
    });
  }

  deletePoll(id: number) {
    if (!confirm('Are you sure?')) return;
    this.pollService.deletePoll(id).subscribe({
      next: () => {
        this.toastr.success('Poll deleted');
        this.loadPolls();
      },
      error: () => this.toastr.error('Failed to delete poll')
    });
  }

  vote(poll: PollDto) {
    this.showVoteForm = true;
    this.activePoll = poll;
    this.selectedOptionIndex = null;
  }

  closeVoteForm() {
    this.showVoteForm = false;
    this.activePoll = null;
  }

  submitVote() {
    if (!this.activePoll || this.selectedOptionIndex === null || this.isSubmittingVote) return;

    this.isSubmittingVote = true;
    const optionId = this.activePoll.options[this.selectedOptionIndex].id;
    const dto: VoteRequestDto = { pollOptionId: optionId };

    this.pollService.vote(this.activePoll.id, dto).subscribe({
      next: () => {
        this.showResultsMap[this.activePoll!.id] = true;
        this.pollService.getPollById(this.activePoll!.id).subscribe(p => {
          this.activePoll = p;
          this.loadPolls();
          this.closeVoteForm();
          this.isSubmittingVote = false;
          this.toastr.success('Vote submitted');
        });
      },
      error: () => {
        this.isSubmittingVote = false;
        this.toastr.error('Failed to submit vote');
      }
    });
  }

  getVotePercentage(index: number): number {
    if (!this.activePoll) return 0;
    const total = this.activePoll.options.reduce((sum, o) => sum + o.voteCount, 0);
    if (total === 0) return 0;
    return Math.round((this.activePoll.options[index].voteCount / total) * 100);
  }

  isActive(poll: PollDto): boolean {
    if (!poll.expiresAt) return true;
    return new Date(poll.expiresAt) > new Date();
  }

  trackByIndex(index: number): number {
    return index;
  }

  focusLastOption() {
    const inputs = document.querySelectorAll<HTMLInputElement>('.option-item input');
    if (inputs.length) inputs[inputs.length - 1].focus();
  }
  get pollsCsvData() {
    return this.filteredPolls.map(poll => ({
      Question: poll.question,
      Created: new Date(poll.createdAt).toLocaleString(),
      Expires: poll.expiresAt ? new Date(poll.expiresAt).toLocaleString() : 'Never',
      Status: this.isActive(poll) ? 'Active' : 'Expired',
      Options: poll.options.map(o => o.text).join('; '),
      Votes: poll.options.map(o => o.voteCount).join('; '),
      Percentage: poll.options
        .map((o, i) => this.getVotePercentage(i) + '%')
        .join('; ')
    }));
  }
}
