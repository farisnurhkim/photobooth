import mongoose, { Schema } from 'mongoose';
import { IScheduleDocument, SlotStatus } from '../interfaces/schedule.interface';

const slotSchema = new Schema({
  start_time: {
    type: String,
    required: true,
  },
  end_time: {
    type: String,
    required: true, // example: "10:00"
  },
  status: {
    type: String,
    enum: Object.values(SlotStatus),
    default: SlotStatus.Available,
  },
});

const scheduleSchema: Schema<IScheduleDocument> = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    is_holiday: {
      type: Boolean,
      default: false,
    },
    slots: {
      type: [slotSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Schedule = mongoose.model<IScheduleDocument>('Schedule', scheduleSchema);

export default Schedule;
