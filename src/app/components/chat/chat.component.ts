import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { IUser } from '../../interfaces';
import { ChatService, ChatMessage } from '../../services/chat.service.ts';
import { InitialsPipe } from './pipes/initials.pipe';
import { UserFilterPipe } from './pipes/user-filter.pipe';

type RoleName = 'USER' | 'THERAPIST';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, InitialsPipe, UserFilterPipe],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  loading = true;
  currentRole: RoleName | null = null;
  currentUserId: number | null = null;
  targetRole: RoleName | null = null;

  people: IUser[] = [];
  filter = '';

  activePartner: IUser | null = null;
  activeConversationId: string | null = null;
  messages: (ChatMessage & { _createdAt: Date })[] = [];
  text = new FormControl<string>('', { nonNullable: true });

  private unsubscribeMessages: (() => void) | null = null;

  @ViewChild('msgList') msgList?: ElementRef<HTMLDivElement>;

  constructor(
    private userService: UserService,
    private chat: ChatService
  ) {}

  ngOnInit(): void {
    this.userService.getMe().subscribe({
      next: (me) => {
        this.currentUserId = me?.id;
        const name: string = me?.role?.name ?? 'USER';
        this.currentRole = name as RoleName;
        this.targetRole = this.currentRole === 'USER' ? 'THERAPIST' : 'USER';

        this.userService.getByRole(this.targetRole).subscribe({
          next: (res) => { this.people = res.data || []; this.loading = false; },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }

  async openChat(partner: IUser) {
    if (!this.currentUserId) return;
    if (this.unsubscribeMessages) { this.unsubscribeMessages(); this.unsubscribeMessages = null; }

    const convId = await this.chat.openOrCreateConversation(this.currentUserId!, partner.id!);
    this.activeConversationId = convId;
    this.activePartner = partner;

    this.unsubscribeMessages = this.chat.listenMessages(convId, (msgs) => {
      const mapped = msgs.map(m => ({
        ...m,
        _createdAt: (m as any).createdAt?.toDate ? (m as any).createdAt.toDate() : new Date()
      }));
      this.messages = mapped;
      queueMicrotask(() => this.scrollToBottom());
    });
  }

  async send() {
    const t = this.text.value.trim();
    if (!t || !this.activeConversationId || !this.currentUserId) return;
    await this.chat.sendMessage(this.activeConversationId, this.currentUserId, t);
    this.text.setValue('');
    this.scrollToBottom();
  }

  private scrollToBottom() {
    const el = this.msgList?.nativeElement;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  ngOnDestroy(): void {
    if (this.unsubscribeMessages) this.unsubscribeMessages();
  }
}
