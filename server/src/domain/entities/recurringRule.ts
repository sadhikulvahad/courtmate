import { Frequency, RecurringRuleProps } from '../types/EntityProps';

export class RecurringRule {
  private props: RecurringRuleProps;

  constructor(props: RecurringRuleProps) {
    if (
      !props.advocateId ||
      !props.description ||
      !props.startDate ||
      !props.endDate ||
      !props.frequency ||
      !props.daysOfWeek.length ||
      !props.timeSlot
    ) {
      throw new Error(
        'Required fields (advocateId, description, startDate, endDate, frequency, daysOfWeek, timeSlot) are missing',
      );
    }
    if (new Date(props.startDate) > new Date(props.endDate)) {
      throw new Error('End date must be after start date');
    }
    if (!['weekly', 'monthly'].includes(props.frequency)) {
      throw new Error('Invalid frequency');
    }
    if (props.daysOfWeek.some((day) => day < 0 || day > 6)) {
      throw new Error('Invalid days of week');
    }
    if (!/^\d{2}:\d{2}$/.test(props.timeSlot)) {
      throw new Error('Invalid timeSlot format (expected HH:mm)');
    }
    this.props = { ...props, exceptions: props.exceptions || [] };
  }

  get id(): string {
    return this.props._id || '';
  }

  get advocateId(): string {
    if (!this.props.advocateId) {
      throw new Error('advocateId is missing in props');
    }
    return this.props.advocateId.toString();
  }

  get description(): string {
    return this.props.description;
  }

  get startDate(): string {
    return this.props.startDate;
  }

  get endDate(): string {
    return this.props.endDate;
  }

  get frequency(): Frequency {
    return this.props.frequency;
  }

  get daysOfWeek(): number[] {
    return this.props.daysOfWeek;
  }

  get timeSlot(): string {
    return this.props.timeSlot;
  }

  get exceptions(): Date[] {
    return this.props.exceptions || [];
  }

  toJSON() {
    const json = {
      advocateId: this.advocateId,
      startDate: this.startDate,
      endDate: this.endDate,
      frequency: this.frequency,
      daysOfWeek: this.daysOfWeek,
      timeSlot: this.timeSlot,
      description: this.description,
      exceptions: this.exceptions,
    };

    if (this.id) {
      return { _id: this.id, ...json };
    }

    return json;
  }
}