//all database queries needed for sales reports
//reports are read only so I separated them from transactionsDb.js
import { db } from "./db";

//date helper functions
//returns midnight of the day for a given date
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

//returns 11:59:59 PM of the day for a given date
const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

//returns date 7 days from now
const sevenDaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  d.setHours(0, 0, 0, 0);
  return d;
};

//returns the first day of the current month
const startOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

//core queries
export const getReportByRange = async (startDate, endDate) => {
  return await db.transactions
    .where("timestamp")
    .between(startDate, endDate)
    .toArray();
};

//gets transactions for the current day, week, or month based on the filter
export const getTodayReport = async () => {
  const start = startOfDay(new Date());
  const end = endOfDay(new Date());
  return getReportByRange(start, end);
};

export const getWeeklyReport = async () => {
  const start = sevenDaysAgo();
  const end = endOfDay(new Date());
  return getReportByRange(start, end);
};

export const getMonthlyReport = async () => {
  const start = startOfMonth();
  const end = endOfDay(new Date());
  return getReportByRange(start, end);
};
