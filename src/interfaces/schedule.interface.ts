import { Document } from 'mongoose';

export enum SlotStatus {
  Available = 'available',
  Pending = 'pending',
  Booked = 'booked',
}

export interface ISlot {
  start_time: string;
  end_time: string;
  status: SlotStatus;
}

export interface ISchedule {
  date: Date;
  is_holiday: boolean;
  slots: ISlot[];
}

export interface IScheduleDocument extends ISchedule, Document {
  // If we had methods, they'd go here
}
