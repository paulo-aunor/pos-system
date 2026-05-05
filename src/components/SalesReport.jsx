//screen for sales reports
import { useState, useEffect } from "react";
import {
  getTodayReport,
  getWeeklyReport,
  getMonthlyReport,
  getReportByRange,
} from "../db/reportDb";

//component for displaying sales reports
export default function SalesReport() {
  //state for report data and filter
  const [reportData, setReportData] = useState([]);
  const [filter, setFilter] = useState("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  //effects
  //fetch report data when filter changes
  const loadReportData = async () => {
    let data = [];
    switch (filter) {
      case "today":
        data = await getTodayReport();
        break;
      case "weekly":
        data = await getWeeklyReport();
        break;
      case "monthly":
        data = await getMonthlyReport();
        break;
      case "custom":
        if (customStart && customEnd) {
          const startDate = new Date(customStart);
          const endDate = new Date(customEnd);
          data = await getReportByRange(startDate, endDate);
        }
        break;
      default:
        data = [];
    }
    setReportData(data);
  };

  //effect to load report data when filter or custom dates change
  useEffect(() => {
    loadReportData();
  }, [filter, customStart, customEnd]);

  //total revenue calculation
  const totalRevenue = reportData.reduce(
    (sum, transaction) => sum + transaction.total,
    0,
  );

  //payment method totals
  const paymentTotals = {};
  reportData.forEach((transaction) => {
    const method = transaction.paymentMethod;
    if (!paymentTotals[method]) {
      paymentTotals[method] = 0;
    }
    paymentTotals[method] += transaction.total;
  });

  //calculate item sales totals
  const itemTotals = {};
  reportData.forEach((transaction) => {
    transaction.items.forEach((item) => {
      if (!itemTotals[item.name]) {
        itemTotals[item.name] = { quantity: 0, revenue: 0 };
      }
      itemTotals[item.name].quantity += item.quantity;
      itemTotals[item.name].revenue += item.quantity * item.price;
    });
  });

  //get best selling items sort by quantity sold desc and take top 5
  //returns array of [itemName, {quantity, revenue}]
  //a and b are [itemName, {quantity, revenue}]. We compare b[1].quantity and a[1].quantity to sort in descending order
  const bestSellers = Object.entries(itemTotals)
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 5);

  //render
  return (
    <div className="pos-reports">
      <div className="report-filters">
        <button onClick={() => setFilter("today")}>Today</button>
        <button onClick={() => setFilter("weekly")}>Weekly</button>
        <button onClick={() => setFilter("monthly")}>Monthly</button>
        <button onClick={() => setFilter("custom")}>Custom</button>
        {filter === "custom" && (
          <div className="custom-filters">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
        )}
      </div>
      <p>{reportData.length} Sales</p>
      <p>Total Revenue: ₱{totalRevenue.toFixed(2)}</p>
      {Object.entries(paymentTotals).map(([method, total]) => (
        <div key={method}>
          <span>{method}</span>
          <span>₱{total.toFixed(2)}</span>
        </div>
      ))}
      <p>Best Selling Items:</p>
      {bestSellers.map(([itemName, { quantity, revenue }]) => (
        <div key={itemName}>
          <span>{itemName}</span>
          <span>{quantity}</span>
          <span>₱{revenue.toFixed(2)}</span>
        </div>
      ))}

      <div className="report-data">
        {reportData.map((transaction) => (
          <div key={transaction.id} className="report-item">
            <p>{new Date(transaction.timestamp).toLocaleString()}</p>
            <p>₱{transaction.total.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
