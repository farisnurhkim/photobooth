import { Request, Response, NextFunction } from 'express';
import Schedule from '../models/schedule.model';
import { SlotStatus } from '../interfaces/schedule.interface';

// POST /api/schedules (Admin Only)
export const createSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { date, is_holiday, slots } = req.body;

    // Check if schedule already exists for the date to avoid duplicate day schedules
    // Typically date should be normalized (e.g. set time to 00:00:00) before saving/querying.
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingSchedule = await Schedule.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingSchedule) {
      res.status(400).json({ success: false, message: 'Schedule already exists for this date.' });
      return;
    }

    const schedule = await Schedule.create({
      date: startOfDay, 
      is_holiday: is_holiday || false,
      slots: slots || [],
    });

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully.',
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/schedules/available
export const checkAvailableSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { date } = req.query; // Expecting YYYY-MM-DD

    let filter: any = {};
    if (date) {
      const targetDate = new Date(date as string);
      const startOfDay = new Date(targetDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const schedules = await Schedule.find(filter);

    // Filter slots to only show available ones
    const availableSchedules = schedules.map((schedule) => {
      const scheduleObj = schedule.toObject();
      if (!scheduleObj.is_holiday) {
        scheduleObj.slots = scheduleObj.slots.filter(
          (slot: any) => slot.status === SlotStatus.Available
        );
      } else {
         scheduleObj.slots = [];
      }
      return scheduleObj;
    });

    res.status(200).json({
      success: true,
      data: availableSchedules,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/schedules/slots/:slot_id/status (Admin Only / Could be System usage)
export const updateSlotStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slot_id } = req.params;
    const { status } = req.body;

    if (!Object.values(SlotStatus).includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid slot status.' });
      return;
    }

    // Find the schedule containing the slot
    const schedule = await Schedule.findOne({ 'slots._id': slot_id });

    if (!schedule) {
      res.status(404).json({ success: false, message: 'Slot not found.' });
      return;
    }

    // Find the actual slot to check its current status
    const slot = schedule.slots.find((s: any) => s._id.toString() === slot_id);
    if (!slot) {
      res.status(404).json({ success: false, message: 'Slot not found.' });
      return;
    }

    // Prevent transitions if already booked (optional custom logic)
    if (slot.status === SlotStatus.Booked && status === SlotStatus.Available) {
       // Example logic: you can block or allow admin manual overrides.
       // Let's allow since admin might cancel the booking.
    }

    slot.status = status;
    await schedule.save();

    res.status(200).json({
      success: true,
      message: 'Slot status updated successfully.',
      data: slot,
    });
  } catch (error) {
    next(error);
  }
};
