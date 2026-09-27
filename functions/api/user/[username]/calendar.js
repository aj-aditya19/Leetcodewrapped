import { fetchLeetCode, queries, jsonResponse, errorResponse } from '../../../_shared/leetcode.js';

export async function onRequestGet({ params }) {
  const { username } = params;

  if (!username) {
    return errorResponse('Username is required', 400);
  }

  try {
    // The wrapped covers a rolling 12-month window that usually spans two
    // calendar years, and LeetCode returns one year per request, so fetch
    // this year and last year and merge the submission maps.
    const year = new Date().getUTCFullYear();
    const [current, previous] = await Promise.all([
      fetchLeetCode(queries.calendar, { username, year }),
      fetchLeetCode(queries.calendar, { username, year: year - 1 }),
    ]);

    if (!current.matchedUser) {
      return errorResponse('User not found', 404);
    }

    const calendar = current.matchedUser.userCalendar || {};
    const previousCalendar = previous.matchedUser?.userCalendar || {};

    return jsonResponse({
      activeYears: calendar.activeYears || [],
      streak: calendar.streak || 0,
      totalActiveDays: calendar.totalActiveDays || 0,
      submissionCalendar: JSON.stringify({
        ...parseCalendar(previousCalendar.submissionCalendar),
        ...parseCalendar(calendar.submissionCalendar),
      }),
    });
  } catch (error) {
    console.error('Calendar error:', error);
    return errorResponse(error.message);
  }
}

function parseCalendar(json) {
  try {
    return JSON.parse(json || '{}');
  } catch {
    return {};
  }
}
