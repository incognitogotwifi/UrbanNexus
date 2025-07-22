function onAdminLogin(player) {

    //if player never had a Duty 
    if (this.onDuty == undefined) { this.onDuty = false; return;}



    if (this.adminlevel >= 1 && this.onDuty == false) {
        this.onDuty = false;
        this.title = " ";
        this.clanname = "";
        this.namecolor = "white";
    } else if (this.adminlevel >= 1 && this.onDuty == true) {
        this.scheduleevent(0.1, "staffduty", player);
    }
}

function onStaffTag(player) {
    if (this.chat == "settag") {
    if (this.onDuty == false && this.adminlevel >= 1) {
        onStaffDuty(player);
    } else if (this.onDuty == true && this.adminlevel >= 1) {
        onStaffSignOff(player);
    }
    }
    return;
    //this.say("Hmm")
    
}

function onShowGlow(player) { 
    this.glow = {
      glow1: {
        "position": [24,-30,0],
        "relative": true,
        "interval": 1,
        "quantity": 1,
        "limit": 300,
        "draworder": "down",
        "sound": ["crack"],
        "soundchance": 10,

        "particles": [ 
          {
            "lifetime": 1,
            "image": "westlaw_staff-badge.png",
            "mode": "multiply",
            "alpha": 1,
            "zoom": 1,
            "red": 1,
            "green": 1,
            "blue": 1,
            "angle": 0,
            "speed": 0,

            "effects": [
              
            ]
          }
        ]
      }
    };
    this.triggerclient(player, "showglow")
}

function onStaffDuty(player) {
    //onShowGlow(player);
    this.say("On Duty!-", 0.3);
    this.title = "West Law Staff";
    if (this.id == 5) { this.title = "Nameen' Studio"; }
    this.maxhp = 850;
    this.hp = 850;
    this.weapon = "adminfist"
    this.titlecolor = "white"
    this.onDuty = true;
    this.clanname = this.adminRole;
    if (!this.clanname) { this.clanname = "No Role" }
    this.namecolor = "#FF5733";
    return;
}

function onStaffSignOff(player) {
    this.say("Off Duty!-", 0.3);
    this.onDuty = false;
    this.maxhp = 850;
    this.weapon = "fist"
    this.hp = 850;
    this.title = " ";
    this.clanname = "";
    this.namecolor = "white";
    return;
}

function onAdminSpeaks(player) {
    let requiredcolornamelevel = 1;
    let requiredlevel = 1;

    //Set name color
    if (this.chat.startsWith("setcolor") && this.adminlevel >= requiredcolornamelevel) {
        color = this.chat.slice(9, 30);
        //player.hat = upload;
        this.namecolor = color;
        this.chat = "";
        this.say("Name Color Updated!", 1);
        return;
    }

    if (this.chat.startsWith("sethat") && this.adminlevel >= requiredlevel) {
        upload = this.chat.slice(7, 30);
        this.hat = upload;
        this.chat = "";
        this.say("Outfit Updated!", 1);

    }
    if (this.chat.startsWith("setbody") && this.adminlevel >= requiredlevel) {
        upload = this.chat.slice(8, 30);
        this.body = upload;
        this.chat = "";
        this.say("Outfit Updated!", 1);

    }
    if (this.chat.startsWith("sethead") && this.adminlevel >= requiredlevel) {
        upload = this.chat.slice(8, 30);
        this.head = upload;
        this.chat = "";
        this.say("Outfit Updated!", 1);

    }
    if (this.chat.startsWith("settitle")) {
        newtitle = this.chat.slice(9, 40);
        this.title = newtitle;
        this.chat = "";
        this.say("Title Updated!", 1);

    }
       if (this.chat.startsWith("setnick")) {
        newname = this.chat.slice(8, 40);
        this.name = newname;
        this.chat = "";
        this.say("Name Updated!", 1);

    }



    //Show player their GBT
    if (this.chat == "showgbt") {
        GBT = this.getitemnr("GBT");
        this.say("i have (" + GBT + ") Gang Base Tokens(GBT)!" , 2);
    }
    //Show player their rocks mined
    if (this.chat == "showrocks") {
        rocks = this.rocksMined;
        this.say("i have (" + rocks + ") rocks mined!" , 2);
    }/*
    this.setto = ['kai', 'koa']
    if (this.chat.startsWith(this.setto[0])) {
        this.say("YES", 1);
        return;
    }
        */
    /* if (this.chat.startsWith("tut")) {
        this.message = this.chat.split(" ");
        this.chat = "";
        this.adminID = this.message[1];
        this.tutLevel = this.message [2];
        let adminID = Server.searchPlayers({map:this.map.name, id:this.adminID});
        if (this.tutLevel < 0) { this.say("You need to set a level higher than 0!", 1); return; }
        if (this.tutLevel > 5) { this.say("You need to set a level lower than 5!", 1); return; }
        if (adminID.length == 0) { 
            this.say('This person may be far/offline', 1);
            return;
        }
        
        adminID[0].tutLevel = this.tutLevel;
        adminID[0].say(`Tutorial Level ${adminID[0].tutLevel}!'`, 0.65)
        return;
    }
    */
    
    
    if (this.chat.startsWith("chant") && this.adminlevel > 0) {
        let count = Server.searchplayers({});
        let sliceAmount = 6;
        let systemmessage = this.chat.slice(sliceAmount,200);
        Server.message("<font size = 4>" + systemmessage+ "",{name:"<font size=3><font color=red>[Admin]  <font size=5><font color=white>" + this.name + "<font color=white><font size=4>",head:this.head,hat:this.hat})
        this.say(`Message Sent to (${count.length - 1})!`, 1)
      return;
    }
    onRoleAssign();
    
    
    //this.say(this.message[0])
    
    
}
function onRoleAssign() {
    if (this.id != 5) { return; }
    this.message = this.chat.split(" ");
    
    
    if (this.message[0] == "role") {
        if (!isNaN(this.message[1])) {
            if (this.message[2] != undefined) {
                                    CheckPlayer();
                if (this.message[3] != undefined) {
                    //this.say("Good", 1);
                    CheckPlayer();
                }
                return;
            }
        }
    }
}
function CheckPlayer() {
    let ThePlayer = Server.searchPlayers({id:this.message[1]});
    player.chat = "";
    //if (!Theplayer) {return;}
    if (ThePlayer[0] == undefined) { return; }
    if (ThePlayer[0].isonline == true) {
        ThePlayer[0].adminRole = this.message[2];
        if (ThePlayer[0].title == "West Law Staff") {
            ThePlayer[0].clanname = this.message[2];
        }
        ThePlayer[0].say("I've been promoted to " + this.message[2], 2);
    }
}

module.exports = {
    onAdminLogin,
    onStaffTag,
    onShowGlow,
    onStaffDuty,
    onStaffSignOff,
    onAdminSpeaks,
    onRoleAssign,
    CheckPlayer
};