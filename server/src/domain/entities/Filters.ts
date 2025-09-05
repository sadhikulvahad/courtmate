import { FilterProps } from "../../domain/types/EntityProps";



export class Filter {
    private props: FilterProps

    private constructor(props: FilterProps) {
        this.props = props
    }

    static fromDB(props: FilterProps): Filter {
        return new Filter(props)
    }

    get id(): string {
        return this.props._id
    }

    get type(): string {
        return this.props.type
    }

    get option(): string[] | undefined {
        return this.props.options
    }
}