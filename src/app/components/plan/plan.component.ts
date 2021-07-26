import { Component, OnInit } from '@angular/core';
import {formatDate} from "@angular/common";
import {Day} from "../../datatypes/Day";


@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css']
})
export class PlanComponent implements OnInit  {
  serverStatus: number = 0;
  remainingTime: number = 0;
  countdownTimeout: number = 0;
  serverUrl: string;
  ws!: WebSocket;
  currentDayDate: Date;
  shifts: string[] = ["07 - 10 Uhr", "10 - 13 Uhr", "13 - 16 Uhr", "16 - 19 Uhr", "19 - 22 Uhr", "22 - 07 Uhr",
    "Nachtschicht: 22 - 02 Uhr", "Nachtschicht: 02 - 04 Uhr", "Nachtschicht: 04 - 07 Uhr"]
  weekdays: string[] = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]
  participants: Day[] = []

  constructor() {
    if (location.host.indexOf("localhost") >= 0) {
      this.serverUrl = "ws://localhost:3000"
    } else {
      const locationParts = location.host.split(".")
      locationParts[0] = locationParts[0] + "server";
      this.serverUrl = "wss://" + locationParts.join(".")
    }

    this.currentDayDate = new Date()
    this.currentDayDate.setHours(0, 0, 0, 0)

    this.initSocketConnection()
  }

  ngOnInit(): void {
  }

  initSocketConnection(): void {
    this.serverStatus = 0

    this.ws = new WebSocket(this.serverUrl)
    this.ws.addEventListener("open", () => {
      this.serverStatus = 1
    })
    this.ws.addEventListener("error", () => {
      this.serverStatus = -1
      this.remainingTime = 6
      this.updateCountdown()
    })
    this.ws.addEventListener("message", data => {
      try {
        const message = JSON.parse(data.data)

        switch (message.type) {
          case "LIST":
            this.participants = message.participants
            setTimeout(() => {
              // @ts-ignore
              document.querySelector("#shiftschedule").scrollLeft=300
            })
            break
          case "ADD":
            // @ts-ignore
            this.getParticipants(message.dayDateTime)[message.shiftIndex].push(message.name)
            break
          case "DELETE":
            const dayParticipants = this.getParticipants(message.dayDateTime)
            // @ts-ignore
            const index = dayParticipants[message.shiftIndex].indexOf(message.name);
            if (index !== -1) {
              // @ts-ignore
              dayParticipants[message.shiftIndex].splice(index, 1);
            }
            break
        }
      } catch (e) { }
    })
  }

  updateCountdown() {
    if (--this.remainingTime <= 0) {
      this.initSocketConnection()
    } else {
      this.countdownTimeout = setTimeout(() => {
        this.updateCountdown()
      }, 1000)
    }
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

    this.ws.send(JSON.stringify({type: "ADD", dayDateTime, shiftIndex, name: element.value}))

    element.value = ""
  }

  addParticipantForm(dayDateTime: number, shiftIndex: number, element: any) {
    this.addParticipant(dayDateTime, shiftIndex, element.getElementsByTagName("input")[0])
    return false
  }

  removeParticipant(dayDateTime: number, shiftIndex: number, participant: string) {
    if (confirm(participant + " wirklich entfernen?")) {
      this.ws.send(JSON.stringify({type: "DELETE", dayDateTime, shiftIndex, name: participant}))

      const dayParticipants = this.getParticipants(dayDateTime)
      // @ts-ignore
      const index = dayParticipants[shiftIndex].indexOf(participant);
      if (index !== -1) {
        // @ts-ignore
        dayParticipants[shiftIndex].splice(index, 1);
      }
    }
  }

}
