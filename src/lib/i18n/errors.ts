import { getMessages, type Locale } from "./i18n";

export function localizeErrorMessage(code: string, fallback: string, locale: Locale): string {
  const errors = getMessages(locale).errors;
  switch (code) {
    case "INVALID_ALIAS": return errors.invalidAlias;
    case "BLOCKED_ALIAS": return errors.blockedAlias;
    case "OPTION_NOT_SELECTED": return errors.optionNotSelected;
    case "SESSION_NOT_FOUND":
    case "SESSION_INVALID":
    case "RESULT_ACCESS_EXPIRED": return errors.safeSession;
    case "RESULT_NOT_AVAILABLE": return errors.resultPending;
    case "LEADERBOARD_EMPTY": return errors.rankingEmpty;
    case "LEADERBOARD_UNAVAILABLE": return errors.rankingUnavailable;
    case "INTERNAL_ERROR": return errors.unexpected;
    default: return fallback;
  }
}
