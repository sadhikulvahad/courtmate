import { Address } from "../types/Address";
import { RoleType } from "../types/RoleTypes";
import { UserProps } from "../types/EntityProps";
import { Status } from "../types/status";
import { Types } from "mongoose";


export class User {
    private props: UserProps;

    constructor(props: UserProps) {
        if (!props.name || !props.email || !props.role) {
            throw new Error("Required fields: name, email, role.");
        }
        this.props = { ...props, isActive: props.isActive ?? false }
    }

    get id(): string {
        if (!this.props._id) {
            throw new Error("User ID not available");
        }
        return this.props._id;
    }


    get googleId(): string | null {
        return this.props.googleId || null
    }

    get authMethod(): string {
        return this.props.authMethod
    }

    get name(): string {
        return this.props.name;
    }

    get email(): string {
        return this.props.email;
    }

    get phone(): string | null {
        return this.props.phone !== undefined ? this.props.phone : null;
    }

    get role(): RoleType {
        return this.props.role;
    }

    get languages(): string[] {
        return this.props.languages || [];
    }

    get address(): Address | undefined {
        return this.props.address;
    }

    get isActive(): boolean {
        return this.props.isActive;
    }

    get isBlocked(): boolean {
        return this.props.isBlocked;
    }

    get isVerified(): boolean {
        return this.props.isVerified || false;
    }

    get age(): number {
        if (!this.props.age) {
            return 0
        }
        return this.props.age
    }

    get verifiedAt(): Date | null {
        return this.props.verifiedAt || null;
    }

    get isAdminVerified(): Status {
        return this.props.isAdminVerified
    }

    get experience(): number {
        if (this.props.experience) {
            return this.props.experience
        }
        return 0
    }

    get savedAdvocates(): Types.ObjectId[] {
        return this.props.savedAdvocates || [];

    }

    verifyEmail(): void {
        this.props.isActive = true;
        this.props.isVerified = true;
        this.props.verifiedAt = new Date();
    }


    // 📌 Methods to update entity fields
    updateLanguages(languages: string[]): void {
        this.props.languages = languages;
    }

    updateProfilePhoto(url: string): void {
        this.props.profilePhoto = url;
    }

    updateAddress(address: Address): void {
        this.props.address = address;
    }

    get password(): string {
        if (this.props.authMethod === 'google') {
            return ''; // or throw if you want
        }
        if (!this.props?.password) {
            throw new Error("There is no password available");
        }
        return this.props.password;
    }

    get barCouncilRegisterNumber(): string {
        if (!this.props.barCouncilRegisterNumber) {
            return ''
        }
        return this.props.barCouncilRegisterNumber
    }

    get category(): string {
        if (!this.props.category) {
            return ''
        }
        return this.props.category
    }

    get onlineConsultation(): boolean {
        if (!this.props.onlineConsultation) {
            return false
        }
        return this.props.onlineConsultation
    }

    get practicingField(): string {
        if (!this.props.practicingField) {
            return ''
        }
        return this.props.practicingField
    }

    get typeOfAdvocate(): string {
        if (!this.props.typeOfAdvocate) {
            return ''
        }
        return this.props.typeOfAdvocate
    }

    get profilePhoto(): string {
        if (!this.props.profilePhoto) {
            return ''
        }
        return this.props.profilePhoto
    }

    get bciCertificate(): string {
        if (!this.props.bciCertificate) {
            return ''
        }
        return this.props.bciCertificate
    }

    get bio(): string {
        if (!this.props.bio) {
            return ''
        }
        return this.props.bio
    }

    setPassword(newPassword: string): void {
        if (newPassword.length < 8) {
            throw new Error("Password must be at least 8 characters");
        }
        this.props.password = newPassword;
    }

    toJSON() {
        return {
            id: this.props._id,
            name: this.props.name,
            email: this.props.email,
            phone: this.props.phone,
            role: this.props.role,
            googleId: this.props.googleId,
            authMethod: this.props.authMethod,
            isActive: this.props.isActive,
            isVerified: this.props.isVerified,
            isAdminVerified: this.props.isAdminVerified,
            verifiedAt: this.props.verifiedAt,
            isBlocked: this.props.isBlocked,
            address: this.props.address,
            certification: this.props.certification,
            bio: this.props.bio,
            typeOfAdvocate: this.props.typeOfAdvocate,
            experience: this.props.experience,
            category: this.props.category,
            practicingField: this.props.practicingField,
            profilePhoto: this.props.profilePhoto,
            bciCertificate: this.props.bciCertificate,
            barCouncilIndia: this.props.barCouncilIndia,
            barCouncilRegisterNumber: this.props.barCouncilRegisterNumber,
            age: this.props.age,
            languages: this.props.languages,
            DOB: this.props.DOB,
            onlineConsultation: this.props.onlineConsultation,
            savedAdvocates: this.props.savedAdvocates
        };
    }

    activateAccount(): void {
        if (this.role === 'advocate' && !this.props.certification) {
            throw new Error("Certification required for advocate activation");
        }
        this.props.isActive = true;
    }

}
