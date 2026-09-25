import {
  fetchLeetCode,
  queries,
  jsonResponse,
  errorResponse,
} from "../../../_shared/leetcode.js";

export async function onRequestGet({ params }) {
  const { username } = params;

  if (!username) {
    return errorResponse("Username is required", 400);
  }

  try {
    // The app displays a rolling trailing-year window (today back to this
    // same date last year), which spans two calendar years for most of the
    // year. LeetCode's calendar API only returns one calendar year per
    // request, so fetch the current year and the previous year and merge
    // them, rather than always returning a single (eventually stale) year.
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const previousYear = currentYear - 1;

    const [currentData, previousData] = await Promise.all([
      fetchLeetCode(queries.calendar, { username, year: currentYear }),
      fetchLeetCode(queries.calendar, { username, year: previousYear }),
    ]);

    if (!currentData.matchedUser) {
      return errorResponse("User not found", 404);
    }

    const currentCalendar = currentData.matchedUser.userCalendar || {};
    const previousCalendar = previousData.matchedUser?.userCalendar || {};

    let currentSubmissions = {};
    let previousSubmissions = {};
    try {
      currentSubmissions = JSON.parse(
        currentCalendar.submissionCalendar || "{}",
      );
    } catch (e) {
      currentSubmissions = {};
    }
    try {
      previousSubmissions = JSON.parse(
        previousCalendar.submissionCalendar || "{}",
      );
    } catch (e) {
      previousSubmissions = {};
    }

    const mergedSubmissions = { ...previousSubmissions, ...currentSubmissions };

    return jsonResponse({
      activeYears:
        currentCalendar.activeYears || previousCalendar.activeYears || [],
      streak: currentCalendar.streak || 0,
      totalActiveDays:
        (currentCalendar.totalActiveDays || 0) +
        (previousCalendar.totalActiveDays || 0),
      submissionCalendar: JSON.stringify(mergedSubmissions),
    });
  } catch (error) {
    console.error("Calendar error:", error);
    return errorResponse(error.message);
  }
}
