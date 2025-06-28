import { CaseProps } from "../types/EntityProps";

export class Case {
    private props: CaseProps;

    private constructor(props: CaseProps) {
        this.props = props;
    }

    static create(props: CaseProps): Case {
        if (!props.title || !props.caseType || !props.clientName) {
            throw new Error("Required fields are empty");
        }

        return new Case({
            ...props,
            hearingHistory: props.hearingHistory ?? [],
        });
    }

    static fromDB(props: CaseProps): Case {
        return new Case(props);
    }

    get id() {
        return this.props._id;
    }

    get advocateId() {
        return this.props.advocateId
    }

    get title() {
        return this.props.title;
    }

    get clientName() {
        return this.props.clientName;
    }

    get caseType() {
        return this.props.caseType;
    }

    get priority() {
        return this.props.priority;
    }

    get nextHearingDate() {
        return this.props.nextHearingDate;
    }

    get description() {
        return this.props.description;
    }

    get hearingHistory() {
        return this.props.hearingHistory;
    }

    addHearing(date: Date) {
        this.props.hearingHistory.push(date);
    }

    toJSON() {
        return {
            _id: this.props._id,
            advocateId : this.props.advocateId,
            title: this.props.title,
            clientName: this.props.clientName,
            caseType: this.props.caseType,
            priority: this.props.priority,
            nextHearingDate: this.props.nextHearingDate,
            description: this.props.description,
            hearingHistory: this.props.hearingHistory,
        }
    }
}