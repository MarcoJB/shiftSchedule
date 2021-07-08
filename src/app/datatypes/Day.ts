export class Day {
  dayDateTime: number
  participants: string[][]

  constructor(dayDateTime: number, participants: string[][])  {
    this.dayDateTime = dayDateTime
    this.participants = participants
  }

  addParticipant(shift: number, name: string) {
    this.participants[shift].push(name);
  }
}
