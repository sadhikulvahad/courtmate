import { RRule, RRuleSet, rrulestr } from 'rrule';
import { startOfDay} from 'date-fns';

/**
 * Deserialize an RFC-5545 formatted rule string to an RRule object
 */
export const deserializeRule = (ruleString: string): RRule => {
  return rrulestr(ruleString) as RRule;
};

/**
 * Create an RRule with exceptions
 */
export const createRuleWithExceptions = (rule: RRule, exceptions: Date[]): RRuleSet => {
  const ruleSet = new RRuleSet();
  ruleSet.rrule(rule);
  
  // Add exceptions
  exceptions.forEach(exceptionDate => {
    ruleSet.exdate(exceptionDate);
  });
  
  return ruleSet;
};

/**
 * Generate slots from a recurrence rule
 */
export const generateSlots = (
  rule: RRule, 
  startDate: Date, 
  endDate: Date
): Array<{ _id: string; date: Date; time: Date }> => {
  // Get all recurrence dates from the rule
  const dates = rule.between(startDate, endDate, true);
  
  // Map to slot format
  return dates.map(date => {
    return {
      _id: `generated-${date.getTime()}`,
      date: new Date(date),
      time: new Date(date)
    };
  });
};

/**
 * Parse time string (HH:MM) to Date object
 */
export const parseTime = (timeString: string, baseDate: Date = new Date()): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const time = new Date(baseDate);
  time.setHours(hours, minutes, 0, 0);
  return time;
};

/**
 * Format RRule to human-readable string
 */
export const formatRRule = (rule: RRule): string => {
  return rule.toText();
};

/**
 * Check if a date has exceptions
 */
export const hasException = (date: Date, exceptions: Date[]): boolean => {
  const dayStart = startOfDay(date);
  return exceptions.some(exception => {
    const exceptionStart = startOfDay(new Date(exception));
    return dayStart.getTime() === exceptionStart.getTime();
  });
};

/**
 * Generate summary description for a recurrence rule
 */
export const generateRuleDescription = (rule: RRule): string => {
  return rule.toText();
};