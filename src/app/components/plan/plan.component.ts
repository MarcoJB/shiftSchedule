import { Component, OnInit } from '@angular/core';
import {formatDate} from "@angular/common";
import { HttpClient } from '@angular/common/http';
import {Day} from "../../datatypes/Day";


@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css']
})
export class PlanComponent implements OnInit  {
  currentDayDate: Date;
  shifts: string[] = ["07 - 10 Uhr", "10 - 13 Uhr", "13 - 16 Uhr", "16 - 19 Uhr", "19 - 22 Uhr", "22 - 07 Uhr",
    "Nachtschicht: 22 - 02 Uhr", "Nachtschicht: 02 - 04 Uhr", "Nachtschicht: 04 - 07 Uhr"]
  weekdays: string[] = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]
  participants: Day[] = []

  constructor(private http: HttpClient) {
    this.currentDayDate = new Date()
    this.currentDayDate.setHours(0, 0, 0, 0)

    this.http.get<Day[]>("https://schichtplanserver.klimacamp-ka.de/participants").subscribe(participants => {
      this.participants = participants
    })
  }

  ngOnInit(): void {
  }

  getDayTitle(dayDateTime: number) {
    const dayDate = new Date(dayDateTime)
    return this.weekdays[dayDate.getDay()] + ", " + formatDate(dayDateTime, "dd.MM.yyyy", "en-US")
  }

  getParticipants(dayDateTime: number) {
    for (const day of this.participants) {
      if (day.dayDateTime == dayDateTime) return day.participants
    }
    return null
  }

  addParticipant(dayDateTime: number, shiftIndex: number, element: any) {
    if (element.value.trim() == "") return

    // @ts-ignore
    this.getParticipants(dayDateTime)[shiftIndex].push(element.value)
    this.http.post<any>("https://schichtplanserver.klimacamp-ka.de/participants", {
      dayDateTime, shiftIndex, name: element.value
    }).subscribe(participants => {
      this.participants = participants
    })

    element.value = ""
  }

  addParticipantForm(dayDateTime: number, shiftIndex: number, element: any) {
    this.addParticipant(dayDateTime, shiftIndex, element.getElementsByTagName("input")[0])
    return false
  }

  removeParticipant(dayDateTime: number, shiftIndex: number, participant: string) {
    if (confirm(participant + " wirklich entfernen?")) {
      this.http.delete<any>("https://schichtplanserver.klimacamp-ka.de/participants/" + dayDateTime + "/" + shiftIndex + "/" +
        encodeURIComponent(participant)).subscribe(participants => {
        this.participants = participants
      })
    }
  }

}
