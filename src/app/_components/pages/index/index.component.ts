import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { JoinDialogComponent } from '../../dialogs/join-dialog/join-dialog.component';
import { SocketService } from '../../../_services/socket/socket.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  authorized: boolean = false;
  isMobile: boolean = false;

  time: number = 0;

  userData: any = {
    UserName: "",
    Password: ""
  }

  players: any = [];
  messages: any = [];
  word: string = "";

  constructor(
    public dialog: MatDialog,
    private socket: SocketService,
    private snackBar: MatSnackBar
  ) { }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  ngOnInit() {
    console.log(localStorage.getItem("user"));
    if (localStorage.getItem("user") != "undefined") {
      if (JSON.parse(localStorage.getItem("user")) != null) {
        if (JSON.parse(localStorage.getItem("user")).UserName) {
          this.userData = JSON.parse(localStorage.getItem("user"));
        } else {
          localStorage.removeItem("user");
        }
      }
    } else {
      localStorage.removeItem("user");
    }

    var ua = navigator.userAgent;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }


    setTimeout(function () {
      this.openJoinDialog();
    }.bind(this), 700);

    this.socket
      .getTime()
      .subscribe((message: any) => {
        this.time = message;
      });
    this.socket
      .getUsers()
      .subscribe((players: any) => {
        console.log(players)
        this.players = players;
        for (var i = 0; i < this.players.length; i++) {
          if (this.players[i].UserName == this.userData.UserName) {
            this.userData = this.players[i];
          }
        }
      });
    this.socket
      .getAllMessages()
      .subscribe((messages: any) => {
        console.log(messages)
        this.messages = messages.messages;
        console.log(this.messages);
        this.word = messages.word;
      });
    this.socket
      .getJoined()
      .subscribe((data: any) => {
        console.log(data)
        this.players = data.players;
        for (var i = 0; i < this.players.length; i++) {
          if (this.players[i].UserName == this.userData.UserName) {
            this.userData = this.players[i];
          }
        }
      });
    this.socket
      .endOfGame()
      .subscribe((data: any) => {
        console.log(data);
        this.congrats(data);
      });
    this.socket
      .ping()
      .subscribe((data: any) => {
        console.log(data);
        this.socket.userJoin(this.userData);
      });
  }

  congrats(data) {
    //let snackBarRef = this.snackBar.open(message, 'Got it');
    this.snackBar.openFromComponent(PopupSnack, {
      data: data
    });
  }

  openJoinDialog(): void {
    const dialogRef = this.dialog.open(JoinDialogComponent, {
      width: '300px',
      data: this.userData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authorized = true;
        this.players = result.players;
        this.userData = result.userData;
        localStorage.setItem("user", JSON.stringify(result.userData));
      }
      console.log(result);
    });
  }

}


import { Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'snack-bar',
  template: `<div style="display: flex; align-items: center;" *ngIf="!data.hasWinner"><div>😣 No winner for this round 😣 <br> 
  🍕&nbsp;&nbsp;Right answer: <b>{{ data.word }}</b> 🍕<br>
  😉 <b>{{data.nextPlayer.UserName}}</b> is building pizza next! 😉</div> 
  <button mat-raised-button style="margin-left: 5px;" mat-stroked-button (click)="snackBarRef.dismiss()">Ok!</button></div>
  <div style="display: flex; align-items: center;" *ngIf="data.hasWinner"><div>🏆 <b>{{data.nextPlayer.UserName}}</b> is the winner of this round 🏆 <br> 
  🍕&nbsp;&nbsp;Right answer: <b>{{ data.word }}</b> 🍕<br>
  😉 <b>{{data.nextPlayer.UserName}}</b> is building pizza next! 😉</div> 
  <button mat-raised-button style="margin-left: 5px;" mat-stroked-button (click)="snackBarRef.dismiss()">Ok!</button></div>`,
})
export class PopupSnack {
  constructor(
    public snackBarRef: MatSnackBarRef<PopupSnack>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) { }
}