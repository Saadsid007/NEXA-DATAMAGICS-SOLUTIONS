/**
 * Calculates the number of leave days between two dates, excluding weekends.
 * @param {Date} startDate - The start date of the leave period.
 * @param {Date} endDate - The end date of the leave period.
 * @returns {number} The total number of leave days.
 */
export function calculateLeaveDays(startDate, endDate) {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
            count++;
        }
        current.setDate(current.getDate() + 1);
    }
    return count;
}
