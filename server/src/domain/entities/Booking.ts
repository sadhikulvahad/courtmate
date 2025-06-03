import { Types } from "mongoose";
import { BookingProps, BookingStatus } from "../types/EntityProps";
import { isBefore, isValid } from 'date-fns';

export class Booking {
  private props: BookingProps;

  private constructor(props: BookingProps) {
    this.props = {
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
  }

  static create(props: BookingProps): Booking {
    if (
      !props.advocateId ||
      !props.userId ||
      !props.slotId ||
      !props.date ||
      !props.time ||
      !props.status
    ) {
      throw new Error('Required fields are missing');
    }

    if (!isValid(props.date) || !isValid(props.time)) {
      throw new Error('Invalid date or time');
    }

    // Only validate future date/time when creating a new booking
    if (isBefore(props.date, new Date()) || isBefore(props.time, new Date())) {
      throw new Error('Date and time must be in the future');
    }

    if (!['confirmed', 'pending', 'cancelled', 'postponed'].includes(props.status)) {
      throw new Error('Invalid status');
    }

    return new Booking(props);
  }

  static fromDB(props: BookingProps): Booking {
    // No validations — assume DB data is trusted
    return new Booking(props);
  }



  get advocate(): { id: string; name: string; email: string; phone?: string } | undefined {
    if (isPopulatedAdvocate(this.props.advocateId)) {
      return {
        id: this.props.advocateId._id,
        name: this.props.advocateId.name,
        email: this.props.advocateId.email,
        phone: this.props.advocateId.phone,
      };
    }
    return undefined;
  }


  get id(): string {
    return this.props._id || '';
  }

  get advocateId(): string {
    return this.props.advocateId.toString();
  }

  get userId(): string {
    return this.props.userId.toString();
  }

  get slotId(): string {
    return this.props.slotId.toString();
  }

  get date(): Date {
    return this.props.date;
  }

  get time(): Date {
    return this.props.time;
  }

  get status(): BookingStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }

  get updatedAt(): Date {
    return this.props.updatedAt!;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get postponeReason(): string | undefined {
    return this.props.postponeReason;
  }

  get roomId(): string | undefined {
    return this.props.roomId
  }

  toJSON() {
    return {
      id: this.id,
      advocateId: this.advocateId,
      advocate: this.advocate,
      userId: this.userId,
      slotId: this.slotId,
      date: this.date,
      time: this.time,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      notes: this.notes,
      postponeReason: this.postponeReason,
      roomId: this.roomId
    };
  }
}

function isPopulatedAdvocate(
  advocate: Types.ObjectId | { _id: string; name: string; email: string; phone?: string } | string
): advocate is { _id: string; name: string; email: string; phone?: string } {
  return typeof advocate !== 'string' &&
    'name' in advocate &&
    'email' in advocate;
}