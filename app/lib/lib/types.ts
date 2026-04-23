export interface UserMark {
  name: string;
  color: string;
}

export interface DayMarks {
  [dateKey: string]: UserMark[];
}
