import {uuid} from "uuidv4";

export class Shift {
  id: string
  title: string;
  participants: string[];

  constructor(title: string)  {
    this.id = uuid()
    this.title = title;
    this.participants = [];
  }
}
