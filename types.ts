
export enum UserRole {
  ADMIN = 'Admin',
  USER = 'User'
}

export interface User {
  username: string;
  role: UserRole;
  firmName: string;
  permissions: {
    bookingDetails: boolean;
    indentForm: boolean;
    bookingOfTicket: boolean;
    travelCancelled: boolean;
    getPayment: boolean;
    tallyEntry: boolean;
  }
}

export interface FMSRow {
  id: string;
  // 1-14: Booking Form
  timestamp: string;
  bookingNo: string;
  firmName: string;
  headTraveler: string;
  otherTravelers: string;
  flightDate: string;
  flightTime: string;
  noOfTickets: string;
  typeOfBooking: string;
  bookedBy: string;
  agentName: string;
  agentRate: string;
  selfName: string;
  selfRate: string;

  // 15-26: Indent Form (Step 1)
  planned1: string;
  actual1: string;
  delay1: string;
  trpNo: string;
  personName: string;
  noOfPersons: string;
  from: string;
  to: string;
  typeOfTravel: string;
  departureDate: string;
  reason: string;
  photoClearTrip: string;

  // 27-33: Booking of Ticket (Step 2)
  planned2: string;
  actual2: string;
  delay2: string;
  travelsName1: string;
  perTicketAmount1: string;
  totalAmount1: string;
  status1: string;

  // 34-44: Travel / Cancelled / Rescheduled (Step 3)
  planned3: string;
  actual3: string;
  delay3: string;
  statusOfTravel: string;
  travelsName2: string;
  perTicketAmount2: string;
  totalAmount2: string;
  billNumber: string;
  typeOfBill: string;
  copyOfBill: string;
  charges: string;

  // 45-49: Get Payment (Step 4)
  planned4: string;
  actual4: string;
  delay4: string;
  status2: string;
  amountPaid: string;

  // 50-54: Tally Entry (Step 5)
  planned5: string;
  actual5: string;
  delay5: string;
  status3: string;
  remark: string;
}

export type AppStage = 1 | 2 | 3 | 4 | 5;

export const STAGE_NAMES: Record<AppStage, string> = {
  1: 'Indent',
  2: 'Booking Of Ticket',
  3: 'Travel Status',
  4: 'Get Payment',
  5: 'Tally Entry'
};
