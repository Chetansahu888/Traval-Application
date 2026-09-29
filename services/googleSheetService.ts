
import { FMSRow, User } from '../types';

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string;

export const googleSheetService = {
  async fetchUsers(): Promise<User[]> {
    // Errors propagate so the login screen can show a connection error instead of "Username not found"
    const response = await fetch(`${APPS_SCRIPT_URL}?action=getUsers`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Server error ${response.status}`);
    const result = await response.json();
    if (!Array.isArray(result)) throw new Error(result?.error || 'Invalid response from server');
    return result;
  },

  async fetchData(): Promise<FMSRow[]> {
    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?action=getData`);
      const rawData = await response.json();
      return rawData.map((row: any[], index: number) => this.mapRowToFMS(row, index));
    } catch (error) {
      return [];
    }
  },

  async createBooking(bookingData: any): Promise<boolean> {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'createBooking', ...bookingData }),
      });
      return true;
    } catch (error) {
      return true;
    }
  },

  async updateStep(bookingNo: string, stage: number, data: any): Promise<boolean> {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'updateActual', bookingNo, stage, ...data }),
      });
      return true;
    } catch (error) {
      return true;
    }
  },

  async uploadFile(bookingNo: string, stage: number, file: File): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
              action: 'uploadFile',
              bookingNo,
              stage,
              fileName: file.name,
              mimeType: file.type,
              base64
            }),
          });
          const result = await response.json();
          resolve(result.url || null);
        } catch (error) {
          resolve(null);
        }
      };
      reader.readAsDataURL(file);
    });
  },

  mapRowToFMS(row: any[], index: number): FMSRow {
    return {
      id: index.toString(),
      // 1-14
      timestamp: row[0] || "",
      bookingNo: row[1] || "",
      firmName: row[2] || "",
      headTraveler: row[3] || "",
      otherTravelers: row[4] || "",
      flightDate: row[5] || "",
      flightTime: row[6] || "",
      noOfTickets: row[7] || "",
      typeOfBooking: row[8] || "",
      bookedBy: row[9] || "",
      agentName: row[10] || "",
      agentRate: row[11] || "",
      selfName: row[12] || "",
      selfRate: row[13] || "",
      // 15-26 (Indent)
      planned1: row[14] || "",
      actual1: row[15] || "",
      delay1: row[16] || "",
      trpNo: row[17] || "",
      personName: row[18] || "",
      noOfPersons: row[19] || "",
      from: row[20] || "",
      to: row[21] || "",
      typeOfTravel: row[22] || "",
      departureDate: row[23] || "",
      reason: row[24] || "",
      photoClearTrip: row[25] || "",
      // 27-33 (Booking of Ticket)
      planned2: row[26] || "",
      actual2: row[27] || "",
      delay2: row[28] || "",
      travelsName1: row[29] || "",
      perTicketAmount1: row[30] || "",
      totalAmount1: row[31] || "",
      status1: row[32] || "",
      // 34-44 (Travel Cancel/Reschedule)
      planned3: row[33] || "",
      actual3: row[34] || "",
      delay3: row[35] || "",
      statusOfTravel: row[36] || "",
      travelsName2: row[37] || "",
      perTicketAmount2: row[38] || "",
      totalAmount2: row[39] || "",
      billNumber: row[40] || "",
      typeOfBill: row[41] || "",
      copyOfBill: row[42] || "",
      charges: row[43] || "",
      // 45-49 (Get Payment)
      planned4: row[44] || "",
      actual4: row[45] || "",
      delay4: row[46] || "",
      status2: row[47] || "",
      amountPaid: row[48] || "",
      // 50-54 (Tally)
      planned5: row[49] || "",
      actual5: row[50] || "",
      delay5: row[51] || "",
      status3: row[52] || "",
      remark: row[53] || ""
    };
  }
};
