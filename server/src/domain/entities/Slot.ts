import { Types } from 'mongoose';
import { isBefore, isValid, startOfDay } from 'date-fns';
import { SlotProps } from '../types/EntityProps';


export class Slot {
  private props: SlotProps;

  private constructor(props: SlotProps) {
    this.props = props;
  }

  static create(props: SlotProps): Slot {
    if (!props.advocateId || !props.date || !props.time || props.isAvailable === undefined) {
      throw new Error('Required fields (advocateId, date, time, isAvailable) are missing');
    }
    if (!isValid(props.date) || !isValid(props.time)) {
      throw new Error('Invalid date or time');
    }
    if (isBefore(props.date, startOfDay(new Date())) || isBefore(props.time, new Date())) {
      throw new Error('Date and time must be in the future');
    }

    return new Slot(props);
  }

  static fromDB(props: SlotProps): Slot {
    return new Slot(props); // no validation
  }

  get id(): string {
    return this.props._id?.toString() ?? '';
  }

  get advocateId(): string {
    return this.props.advocateId.toString();
  }

  get date(): Date {
    return this.props.date;
  }

  get time(): Date {
    return this.props.time;
  }

  get isAvailable(): boolean {
    return this.props.isAvailable;
  }

  get status(): string {
    return this.props.status
  }

  get postponeReason() : string | undefined {
    return this.props.postponeReason
  }

  markAsBooked(): void {
    this.props.isAvailable = false;
  }

  markASAvailable(): void {
    this.props.isAvailable = true
  }

  markAsExpired(): void {
    this.props.isAvailable = false;
    this.props.status = 'expired';
  }

  postpone(newDate: Date, newTime: Date, reason?: string): void {
    if (!isValid(newDate) || !isValid(newTime)) {
      throw new Error('Invalid new date or time');
    }
    if (isBefore(newDate, startOfDay(new Date())) || isBefore(newTime, new Date())) {
      throw new Error('New date and time must be in the future');
    }
    this.props.date = newDate;
    this.props.time = newTime;
    this.props.status = 'postponed';
    this.props.postponeReason = reason;
  }


  toJSON() {
    return {
      id: this.id,
      advocateId: this.advocateId,
      date: this.date,
      time: this.time,
      isAvailable: this.isAvailable,
      status: this.status,
      postponeReason : this.postponeReason
    };
  }
}