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



  get advocate(): { id: string; name: string; email: string; phone?: string; role?: string } | undefined {
    if (isPopulatedAdvocate(this.props.advocateId)) {
      return {
        id: this.props.advocateId._id,
        name: this.props.advocateId.name,
        email: this.props.advocateId.email,
        phone: this.props.advocateId.phone,
        role: this.props.advocateId.role
      };
    }
    return undefined;
  }

  get user(): { id: string; name: string; email: string; phone?: string; role?: string } | undefined {
    if (isPopulatedUser(this.props.userId)) {
      return {
        id: this.props.userId._id,
        name: this.props.userId.name,
        email: this.props.userId.email,
        phone: this.props.userId.phone,
        role: this.props.userId.role
      };
    }
    return undefined;
  }


  get id(): string {
    return this.props._id || '';
  }

  get advocateId(): string {
    if (typeof this.props.advocateId === "object" && "_id" in this.props.advocateId) {
      return this.props.advocateId._id.toString();
    }
    return this.props.advocateId?.toString?.() ?? '';
  }

  get userId(): string {
    if (typeof this.props.userId === "object" && "_id" in this.props.userId) {
      return this.props.userId._id.toString();
    }
    return this.props.userId?.toString?.() ?? '';
  }

  get slotId(): string {
    return this.props.slotId?.toString?.() ?? '';
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

  get caseId(): string | undefined {
    if (typeof this.props.caseId === "object" && "_id" in this.props.caseId) {
      return this.props.caseId._id.toString();
    }
    return this.props.caseId?.toString?.() ?? '';
  }

  toJSON() {
    return {
      id: this.id,
      advocateId: this.advocateId,
      advocate: this.advocate,
      user: this.user,
      userId: this.userId,
      slotId: this.slotId,
      date: this.date,
      time: this.time,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      notes: this.notes,
      postponeReason: this.postponeReason,
      roomId: this.roomId,
      caseId: this.caseId
    };
  }

}

function isPopulatedAdvocate(
  advocate: Types.ObjectId | { _id: string; name: string; email: string; phone?: string; role?: string } | string | undefined
): advocate is { _id: string; name: string; email: string; phone?: string; role?: string } {
  return (
    advocate !== null &&
    typeof advocate === 'object' &&
    'name' in advocate &&
    'email' in advocate &&
    'role' in advocate
  );
}


function isPopulatedUser(
  user: Types.ObjectId | { _id: string; name: string; email: string; phone?: string; role?: string } | string | undefined
): user is { _id: string; name: string; email: string; phone?: string; role?: string } {
  return (
    user !== null &&
    typeof user === 'object' &&
    'name' in user &&
    'email' in user &&
    'role' in user
  );
}
