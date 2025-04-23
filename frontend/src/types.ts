// src/types.ts
export interface NameInfo {
    firstName: string;
    middleName: string;
    lastName: string;
    preferredName: string;
    profilePicUrl?: string;
    email: string;
    ssn: string;
    dob: string;        // ISO date string
    gender: string;
  }
  
  export interface AddressInfo {
    building: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  }
  
  export interface ContactInfo {
    cell: string;
    work: string;
  }
  
  export interface EmploymentInfo {
    visaTitle: string;
    startDate: string;
    endDate: string; 
  }
  
  export interface EmergencyContact {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    relationship: string;
  }
  
  export interface Document {
    id: string;
    name: string;
    url: string;
  }

  export interface ImmigrationInfo {
    /** “Are you a permanent resident or citizen of the U.S.?” */
    isUSResident: boolean;
    /** if isUSResident === true */
    residentStatus?: "Green Card" | "Citizen";
  
    /** if isUSResident === false */
    workAuthType?: "H1-B" | "L2" | "F1" | "H4" | "Other";
    /** only when workAuthType === "Other" */
    otherVisaTitle?: string;
  
    /** only when workAuthType === "F1" */
    optReceiptUrl?: string;
  
    authStartDate?: string; 
    authEndDate?: string;     
  }
  
  export interface PersonalInfo {
    name: NameInfo;
    address: AddressInfo;
    contact: ContactInfo;
    employment: EmploymentInfo;
    emergency: EmergencyContact;
    documents: Document[];
    immigration: ImmigrationInfo;
  }
  