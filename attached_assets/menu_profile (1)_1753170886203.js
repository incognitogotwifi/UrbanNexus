/*
function onMouseDown(player) {
    this.onActivated(player);
}
function onPlayerTouchsMe(player) {
    this.onActivated(player);
}
*/


function createProfileDiv(headimage, bodyimage, hatimage) {
    return `
    <style>
    
    .container {
        width: 100px;
        height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
        bottom: 8%;
        scale: 2;
    }
    
    .hat {
      
        width: 48px; 
        height: 48px;
        overflow: hidden;
        z-index: 30;
        position: absolute;
        top: 0;
        left: 0px;
        top: -20px;
        background-color: transparent;
    }
    
    .hat > img {
            position: absolute;

       left: -12px;
    }
    
    
    .head {
        width: 48px; 
        height: 48px;
        overflow: hidden;
        z-index: 29;
        position: absolute;
    }
    
    .head > img:hover {
      
      
    }
    
       .hat > img:hover {
      
      
    }
    
      .hands-left {
        width: 8px; 
        height: 11px;
        z-index: 28;
        left: 6px;
       
        position: absolute;
        /*background-color: red;*/
        pointer-events: none;
        top: 40px;
        overflow: hidden;
        
        
    }
    
      .hands-right {
        width: 10px; 
        height: 11px;
        z-index: 28;
        left: 32px;
       
        position: absolute;
        /*background-color: blue;*/
        pointer-events: none;
        top: 40px;
        overflow: hidden;
        transform: scaleX(-1);
        
        
    }
    
    .hands-left > img {
    position: relative;
         right: 15px;
        bottom: 49px;
    }
    
    
     .hands-right > img {
    position: relative;
         right: 15px;
        bottom: 49px;
        transform: scaleX(1);
    }
    
   
    .body {
        width: 48px; 
        height: 48px;
        overflow: hidden;
        position: absolute;
        top: 24px;
    }

    </style>

    <div class="container" style="margin-top: auto;">
       <div style='position: relative; transform: translate(8%, -20%); width: 48px; height: 48px; '>
        <div class="shadow" style="background-color: #00000066; width: 34px; height: 18px; border-radius: 50%; position: absolute; top: 50px; left: 7px;">
        </div>
         <div class="body">
            <img src="${bodyimage}" alt="Player Body">
        </div>
        
        
         <div class="head">
            <img src="${headimage}" alt="Player Head">
        </div>
         <div class="hands-left">
            <img src="${headimage}" alt="Player Head">
        </div>
         <div class="hands-right">
            <img src="${headimage}" alt="Player Head">
        </div>
         <div class="hat">
            <img src="${hatimage}" alt="Hat">
        </div>
        
        </div>
      
        
    </div>
    `;
}


function onActivated(player, data, menu) {
    // echo("onActivated: " + (this.popup? 1 : 0) + " - " + (this.popup && this.popup.parent? 1 : 0));
    this.triggerserver("loadprofile", data.userid);
   
}

function onServerProfile(player, data) {
    this.playerprofiledata = data;

    if (player.map.name.includes("kavua")) { this.showCloneBerryProfile(player); }
    else showPlayerProfile();
}

function showCloneBerryProfile(player, data) {
    const elem = 'cloneberryprofile';
    data.profilestoryid = undefined; // for now
    
   // data = Object.assign (data, {})
    _data = {
        score: 0
    };
    
    data = this.playerprofiledata;
    this.popup = GUI.showpopup({
        title: this.playerprofiledata.name,
        width: 250,
        height: 460,
        
    });
    //player.chat =this.playerprofiledata.head || "Invalid"
    // @TODO: Make a class for these styles
    
    const head_image_url  = GUI.getimageforitem({
            itemtype: "head",
            head: this.playerprofiledata.head
        });
          const body_image_url  = GUI.getimageforitem({
            itemtype: "armor",
            armor: this.playerprofiledata.body
        });
        
        const hat_image = GUI.getimageforitem({
                itemtype: "hat",
                hat: this.playerprofiledata.hat
            })
            
            
            
            let staff_badge_images = {
        0 :"",// no image
        1: "gui/westlaw_gamestaff-badge.png",
        2: "gui/westlaw_gamestaff-badge.png",
        3: "gui/westlaw_gamesheriff-badge.png",
        4: "gui/westlaw_gamedeputy-badge.png",
        5: "gui/westlaw_gamehighstaff-badge.png",
        6: "gui/westlaw_gamehighstaff-badge.png",
        7: "gui/westlaw_gamehighstaff-badge.png",
        8: "gui/westlaw_gamehighstaff-badge.png",
        9: "gui/westlaw_gameowner-badge.png"
    }
             
    let cbp = GUI.create(elem, "", "", 
        `
        <div style="top: 0; left: 0; display: flex; flex-direction: column; width: 100%;">
  <!-- Header -->
  <div style="background-color: transparent; display: flex; justify-content: space-between; align-items: center;">
    <div style="color: white;" class="profile-name">Loading..</div>
    <div class='customclosebtn' style='cursor: pointer; display:flex'></div>
  </div>

  <!-- Player Container -->
  <div style="display: flex; margin-top: 12px;">
    <!-- Profile Section -->
    <div style="
      border: 16px solid #656565;
      border-radius: 14px;
      background: #656565;
      width: 110px;
      height: 180px;
      display: flex;
      align-items: end;
      flex-direction: column;
      justify-content: center;
    ">
    
    
      <div style="transform: translateX(-12px);">
        ${createProfileDiv(head_image_url, body_image_url, hat_image)}
      </div>
      
      
    </div>
    

    <!-- Achievement Score Label -->
    <div style="font-size: 14px; margin-left: 12px;">
      
    </div>

    <!-- Spacer -->
    <div style="background-color: transparent; flex: 1; padding-left: 12px;"></div>
  </div>

  <!-- Status Container -->
  <div style="
  height: 60px;
  max-height: 60px;
    text-align: center;
    border: 16px solid #656565;
    margin-top: 12px;
    font-size: 16px;
    border-radius: 14px;
    background: #656565;
    width: calc(100% - 32px);
    min-height: 30px;
    max-height: 90px;
    overflow-y: scroll;
  " class="game-status-div">
  
  
  </div>
  
   <div style="max-height: 60px; padding: 12px; font-size: 16px">
       
        <div>Cases: ${data.cases}</div>
        <div>Achievement Score: ${data.score}</div>
       
      </div>
</div>



        `
    );
    
  
    
    const popup = this.popup.parentNode;
    popup.style.textAlign="left"
    popup.style.padding='6px'
    const closeBtn = this.popup.parentNode.children[1];
    const titleLbl = this.popup.parentNode.children[0];
    titleLbl.style.display="none"
    // Close Button 
    closeBtn.innerHTML = "X";
     closeBtn.style.top="0px";
    // Title
    titleLbl.style.fontSize = "30px";
    
    // Popup
    popup.style.border = "0px solid #3D3D3D";
   
    popup.style.background = "#3D3D3D";
    const pop = this.popup.parentNode.children[2];
    pop.style.display='none'
    
    popup.style.width="360px";
      popup.style.height="460px";
    popup.style.position = "absolute";

    popup.appendChild(cbp);
    
    closeBtn.remove();
 
 
        popup.querySelector(".profile-name").innerText=data.name;
        popup.querySelector(".game-status-div").innerText= data.status;

 
    
      if (data.adminlevel > 0) {
            popup.querySelector(".admin-label").style.display="flex"
            popup.querySelector(".admin-label").style.alignItems="center";
            popup.querySelector(".admin-label").style.flexDirection="row";

            popup.querySelector(".admin-labeltext").innerText = `ADMIN LVL (${data.adminlevel})`
    }

   
    popup.querySelector(".customclosebtn").appendChild(closeBtn)
    /*popupNode.style = `
        border: 32px solid transparent;
        border-radius: 28px;
        padding: 32px;
        position: absolute;
        margin-left: auto;
        margin-right: auto;
        margin-top: auto;
        margin-bottom: auto;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 100;
        font-size: 20pt;
        letter-spacing: 1px;
        text-shadow: 0 1px 0 #542c1b;
        color: #fff;
        max-width: calc(100% - 128px);
    `*/
}

function showPlayerProfile() {
    const self = this;
    let newlook = Server.getconfig().enablenewgui;
    let data = this.playerprofiledata;

    this.popup = GUI.showpopup({
        title: data.name,
        showbadge: (newlook && data.adminlevel > 0),
        width: 710
    });

    let html = "<div>";
    // html += "ID: " + data.userid;

    // Basic info
    if (newlook) {
        // Westlaw
        html += this.makeTextDiv("Coins:", data.coins | 0, "profile_coins");
        html += this.makeTextDiv("Horseshoes:", data.ec | 0, data.horseshoes);
        html += this.makeTextDiv("Mobs:", data.mobkills | 0, "profile_mobkills");
        html += this.makeTextDiv("Deaths:", data.deaths | 0, "profile_deaths");

        let killstr = data.kills | 0;
        if (data.streak > 0) 
            killstr += " <span class=\"profile_streak\">" + translate("Streak of %d", [data.streak]) + "</streak>";
        html += this.makeTextDiv("Kills:", killstr, "profile_kills");
        html += this.makeTextDiv("Spar:", (data.sparwins | 0) + "-" + (data.sparlost | 0), "profile_spar");

        if (data.onlinetime) 
            html += this.makeTextDiv("Hours:", data.onlinetime, "profile_onlinetime");
    } else {
        // --- horse mount count (does not work)
        this.items = player.getitems(["mount"]).length;
        //data.horsecount = this.items.length * 2;
        
        //
        html += this.makeTextDivIcon(data.ec | 0, "", "profile_eventcoin", "Event Coins");
        html += this.makeTextDivIcon(data.coins | 0, "", "profile_coins", "Coins");
        //html += this.makeTextDivIcon(data.horsecount || -1, "", "profile_bombs", "Horses");
        html += this.makeTextDivIcon(data.mobkills | 0, "", "profile_mobkills", "Killed Monsters/Mobs");
        html += this.makeTextDivIcon("  " + (data.deaths | 0), null, "profile_deaths", "Nr of Deaths");
        let killstr = "" +
            "<span class=\"profile_value\">" + (data.kills | 0) + "</span>";

        if (data.streak > 0)
            killstr += " <span class=\"profile_streak\">" + translate("Streak of %d", [data.streak]) + "</span>";
        html += this.makeTextDivIcon(killstr, null, "profile_kills", "Killed Players");
        html += this.makeTextDivIcon((data.sparwins | 0) + " - " + (data.sparlost | 0),
            "", "profile_spar", "Spars Won/Lost");

        if (data.onlinetime) 
            html += this.makeTextDivIcon(data.onlinetime, "westlaw_justus-clock.png", "profile_onlinetime", "Online Time");
        this.popup.style.top = "30px";
    }
    if (data.ping)
        html += this.makeTextDiv(translate("Ping:"),
            (data.os ? "<img src=\"" + GUI.filespath + "gui/bbuilder_icon_" + data.os.toLowerCase() + ".png\" style=\"vertical-align:middle;\"> " : "") +
            data.ping + "ms", "profile_ping");
    html += this.makeTextDivIcon(data.nc || 0, "", "profile_westlawcoins", "West Law Coins");
    html += this.makeTextDivIcon(data.arrows || 0, "", "profile_arrows", "Arrows");
    html += this.makeTextDivIcon(data.faction || "none", "", "profile_faction", "Faction");
    function partner_link() {
        alert("test")
    }

    html += this.makeTextDivIcon("", "", "profile_relationship", "profile_buttonrelationship", null, "profilebuttonrelationship");





    let partner_html = 
        "<div id=\"profilebuttonsocial2\" style=\"position: relative; left: 10px; top: 105px\">" +
        ( data.partner ?
            this.makeTextDivIcon("Married",
                null, "profile_like", "Unlike Profile", "partner_link") :
            this.makeTextDivIcon("Single",
                null, "profile_like", "Like Profile", null)
        );
        
        
        // let button = this.createButton("partner_link", "relationships", {
        //         x: 10, y: 100
        //         //classname: "profile_editstatus"
        //     },
        //     function(e) {
        //         e.chat = "works";
        //         //GUI.hidepopup();
        //         //self.showEditStatus();
        //     });
        // partner_html += button;
        
        
        partner_html += "</div>";
        
    let socialButtons2 = GUI.create("profile_socialbuttons2", "", "", partner_html);

    this.popup.parentNode.appendChild(socialButtons2);

    // Show admin status and title
    let specialTitle;
    if (data.injail)
        specialTitle = translate("In Jail");
    else if (data.title)
        specialTitle = translate(data.title);
    
    // admin level
    if (!newlook && data.adminlevel > 0)
        specialTitle = (specialTitle ? specialTitle + " (Admin)" : translate("Game Admin"));
    if (data.adminlevel > 0 && player.adminlevel > 0) {
        if (specialTitle) specialTitle += " ";
        else specialTitle = "";
        specialTitle += "<span class=\"profile_specialtitle_level\">lvl " + data.adminlevel + "</span>";
        specialTitle = specialTitle.replace(Server.getconfig().gamename + " Staff", "").trim();
    }
    
    if (specialTitle) {
        //html += this.makeTextDivIcon(specialTitle, null, "profile_specialtitle");
        html += this.makeTextDivIcon("", null, "profile_specialtitle");
        html += `<div style="display: flex; position: absolute; top: -2px; left: 50%; transform: translate(-50%, 0);"><p style="text-align: center; font-size: 16px;">${specialTitle}</p></div>`;
    }
    if (data.userid)
        html += this.makeTextDivIcon(translate("ID:") + " " + data.userid, null, "profile_specialtitle_id");
    if (data.achievementstatus && data.achievementstatus.title)
        html += this.makeTextDivIcon(data.achievementstatus.title, null, "profile_achievementtitle");

    // Online status
    if (data.isonline) {
        if (newlook && data.hp != undefined && data.maxhp)
            html += "<div class=\"profilehpback\"></div>" +
            "<div class=\"profilehp\" style=\"width:" + Math.floor(180 * data.hp / data.maxhp) + "px;\"></div>";
        else {
            html += this.makeTextDiv("Online!", "", "profile_online");
            html += this.makeIcon("Icon_Online.png", "width: 22px; height: 22px; position: absolute; left: 48px; top: 32px;");
        }
            
    } else if (data.offlinetime) {
        html += this.makeTextDiv("Offline:", data.offlinetime, "profile_offlinetime");
        html += this.makeIcon("Icon_Offline_Red.png", "width: 22px; height: 22px; position: absolute; left: 48px; top: 32px;");
    } else {
        html += this.makeTextDiv("Offline!", "", "profile_online");
        html += this.makeIcon("Icon_Offline_Red.png", "width: 22px; height: 22px; position: absolute; left: 48px; top: 32px;");
    }

    // Special buttons
    if (data.isfriend)
        html += this.makeTextDivIcon(translate("Remove Friend") +
            " <img src=\"" + GUI.filespath + "gui/bbuilder_profileicon_removefriend.png\" width=32 height=32 style=\"vertical-align:middle;\">",
            null, "profile_removefriend", null, "profilebuttonremovefriend");
            
    else if (data.canaddfriend)
        html += this.makeTextDivIcon(translate("Add Friend") +
            " <img src=\"" + GUI.filespath + "gui/bbuilder_profileicon_addfriend.png\" width=32 height=32 style=\"vertical-align:middle;\">",
            null, "profile_addfriend", null, "profilebuttonaddfriend");
    if (data.canmessage)
        html += this.makeTextDivIcon(translate("Message") +
            " <img src=\"" + GUI.filespath + "gui/bbuilder_profileicon_message.png\" width=32 height=32 style=\"vertical-align:middle;\">",
            null, "profile_addmessage", null, "profilebuttonmessage");
    if (!data.status && data.name.indexOf("(") >= 0) //TODO: ignore if coming from clan members
        html += this.makeTextDivIcon(translate("View Clan") +
            " <img src=\"" + GUI.filespath + "gui/bbuilder_profileicon_clan.png\" width=32 height=32 style=\"vertical-align:middle;\">",
            null, "profile_viewclan", null, "profilebuttonclan");

    // -----------------------------------------------------------
    // Profile Staff Badge 
    //gui/westlaw_gameguest-badge.png
    
    var staff_badge_images = {
        0: "",
        1: "gui/westlaw_gamestaff-badge.png",
        2: "gui/westlaw_gamestaff-badge.png",
        3: "gui/westlaw_gamesheriff-badge.png",
        4: "gui/westlaw_gamedeputy-badge.png",
        5: "gui/westlaw_gamehighstaff-badge.png",
        6: "gui/westlaw_gamehighstaff-badge.png",
        7: "gui/westlaw_gamehighstaff-badge.png",
        8: "gui/westlaw_gamehighstaff-badge.png",
        9: "gui/westlaw_gameowner-badge.png"
    }

    function createStandardChoiceMenu(options, selectId = 'mySelectMenu', labelText = 'Escolha um item:') {
        // `options` ser� um array de strings, por exemplo: ["Op��o A", "Op��o B", "Op��o C"]
        // `selectId` e `labelText` s�o par�metros opcionais para personaliza��o
      
        let menuHtml = `
          <div class="standard-menu-container" style="position: absolute;right: 12px; font-size: 12px">
            <label for="${selectId}" >${labelText}</label><br>
            <select style="font-size: 15px"id="${selectId}" name="${selectId}">
        `;
      
        // Itera sobre as op��es para criar elementos <option> dinamicamente
        options.forEach((optionText, index) => {
          // Para o 'value' da op��o, podemos usar o pr�prio texto ou uma vers�o "slug" dele
          const optionValue = optionText.toLowerCase().replace(/\s/g, '-');
          menuHtml += `
            <option value="${optionValue}">${optionText}</option>
          `;
        });
      
        menuHtml += `
            </select>
          </div>
        `; // Fecha o <select> e o container do menu
      
        return menuHtml;
      }
      

    if ( data.adminlevel > 0 ) {
        html += this.makeTextDivIcon(
                " <img src=\"" + GUI.filespath + staff_badge_images[data.adminlevel] + "\" width=168 height=200 style=\"vertical-align:middle; position: absolute; top: 60px; right: 28px; display: block\">",
                null, "profile_badge", null, null);
    }
    

    //html += createStandardChoiceMenu(["BADGE 1","BADGE 2","BADGE 3","BADGE 4"],"badgeSelector","SELECT YOUR BADGE");
    // -----------------------------------------------------------

    // Status
    var status = (data.status || data.status2 ? (data.status2 ? data.status2 : "") + (data.status ? data["status"] : "") : null);
    html += "<div class=\"scrollable profile_status\">" +
        (status ? status : "<i><center>" + translate("No status yet") + "</center></i>") +
        "</div>";
    html += this.getProfileCharacter(data) + "</div>";
    this.popup.innerHTML = html;
    
    let socialButtons = GUI.create("profile_socialbuttons", "", "",
        "<div class=\"profilebuttons\">" +
        "<div id=\"profilebuttonsocial\">" +
        ("like" in data ? (data.like ?
            this.makeTextDivIcon(data.nrlikes +
                " <img src=\"" + GUI.filespath + "gui/westlaw_like.png\" width=32 height=32 style=\"vertical-align:middle;\">",
                null, "profile_like", "Unlike Profile", "profilebuttonunlike") :
            this.makeTextDivIcon(data.nrlikes +
                " <img src=\"" + GUI.filespath + "gui/westlaw_unlike.png\" width=32 height=32 style=\"vertical-align:middle;\">",
                null, "profile_like", "Like Profile", "profilebuttonlike")
        ) : "") + "</div>" +
        "<div id=\"profilebuttonprofile\" class=\"profilebutton selected\">" + translate("Profile") + "</div>" +
        "<div id=\"profilebuttonmore\" class=\"profilebutton\">" + translate("More") + "</div>" +
        "</div>");
    this.popup.parentNode.appendChild(socialButtons);

    // More actions in a separate menu now
    if (data.caneditstatus) {
        let button = this.createButton("editstatusbutton", "Edit", {
                y: (newlook ? 64 : 380),
                w: 38,
                h: 38,
                classname: "profile_editstatus"
            },
            function(e) {
                GUI.hidepopup();
                self.showEditStatus();
            });
        this.popup.parentNode.appendChild(button);
    }
    if (data.isself && Server.getconfig().enablechareditorbutton) {
        let button = this.createButton("editcharbutton", "", {
                x: 326,
                y: 110,
                w: 38,
                h: 38,
                classname: "profile_editchar"
            },
            function(e) {
                GUI.hidepopup();
                GUI.showmenu("chareditor");
            });
        this.popup.parentNode.appendChild(button);
    }

    this.addButtonHandlers();
    //GUI.translate("profilebuttonmore");
}

function makeTextDiv(label, value, classname) {
    return "<div class=\"profilefieldlabel" + (classname ? " " + classname : "") + "\">" + translate(label) +
        "<div class=\"profilefield\">" + value + "</div></div>";
}

function makeIcon(img, style) {
    return `<img src="${GUI.filespath + "gui/" + img}" style="${style}">`;
}

function makeTextDivIcon(label, img, classname, help, id) {
    let html = "<div" + (id ? " id=\"" + id + "\"" : "") + " class=\"" + classname + (help ? "" : "") + "\"" +
        (help ? " help=\"" + translate(help) + "\"" : "") + ">";

    html += (img ? " <img src=\"" + (img.indexOf("/") >= 0 ? img : GUI.filespath + "gui/" + img) + "\" style=\"vertical-align:middle;\"> " : "") +
        "<span class=\"profile_value\">" + label + "</span></div>\n";
    return html;
}

function createButton(name, title, options, callback) {
    let zoom = 1;
    let button;
    if (options.help) {
        button = GUI.create(name, "button", "text-align:center;", translate(title));
        button.setAttribute("help", translate(options.help));
    } else {
        button = GUI.create(name, "button", "text-align:center;", translate(title));
    }
    if (options.classname)
        button.className = options.classname + " " + button.className;
    if (options.x != undefined || options.left != undefined)
        button.style.left = ((options.x != undefined ? options.x : options.left) * zoom) + "px";
    else if (options.right != undefined)
        button.style.right = (options.right * zoom) + "px";
    if (options.y != undefined || options.top != undefined)
        button.style.top = ((options.y != undefined ? options.y : options.top) * zoom) + "px";
    else if (options.bottom != undefined)
        button.style.bottom = (options.bottom * zoom) + "px";
    button.style.width = (options.w * zoom) + "px";
    button.style.height = (options.h * zoom) + "px";
    button.style.lineHeight = ((options.h * zoom) - (options.help ? 0 : 6)) + "px";
    button.style.zIndex = 101;
    if (callback)
        GUI.onclick(button, callback);
    return button;
}

function getProfileCharacter(data) {
    // Body
    var html = "<div id=\"profilecharacter\" class=\"pixelimage\" style=\"-ms-transform:scale(2.5); -webkit-transform:scale(2.5); transform:scale(2.5); position:absolute; top: 25px; left:-35px;\">";
    if (data.body)
        html += "<img draggable=\"false\" ondragstart=\"return false;\" src=\"" + GUI.getimageforitem({
            itemtype: "armor",
            armor: data.body
        }) + "\" style=\"" +
        "position:absolute; left:145px; top:46px; " +
        "clip: rect(0px 48px 48px 0px);\" class=\"pixelimage\">";

    // Head + arms
    if (data.head) {
        let headimage = GUI.getimageforitem({
            itemtype: "head",
            head: data.head
        });
        html += "<img draggable=\"false\" ondragstart=\"return false;\" src=\"" + headimage + "\" style=\"" +
            "position:absolute;left:145px;top:23px;clip: rect( 0px 48px 48px  0px);\" class=\"pixelimage\">";
        html += "<img draggable=\"false\" ondragstart=\"return false;\" src=\"" + headimage + "\" style=\"" +
            "position:absolute;left:134px;top:15px;clip: rect(48px 24px 60px 13px);\" class=\"pixelimage\">";
        html += "<img draggable=\"false\" ondragstart=\"return false;\" src=\"" + headimage + "\" style=\"" +
            "position:absolute;left: 12px;top:15px;clip: rect(48px 24px 60px 13px);\" class=\"pixelimage flipximage\">";
    }

    // Hat
    if (data.hat) {
        html += "<img draggable=\"false\" ondragstart=\"return false;\" src=\"" + GUI.getimageforitem({
                itemtype: "hat",
                hat: data.hat
            }) + "\" style=\"" +
            "position:absolute; left:133px; top:2px; " +
            "clip: rect(0px 73px 72px 0px);\" class=\"pixelimage\">";
    }

    // Load story
    if (data.profilestoryid)
        this.triggerserver("loadstory", data.profilestoryid);

    return html + "</div>";
}

function onServerStory(player, data) {
    // Replace the character with the profile story
    let div = GUI.get("profilecharacter");
    div.style.cssText = "position:absolute; left:50%; top:180px; display: flex; align-items: center; justify-content: center; transform: scale(1.1);";
    div.innerHTML = "<canvas id=\"profilecanvas\" width=160 height=160 style=\"width:320px;height:320px;\"></canvas>";

    data = JSON.parse(data);
    data[0].name = ""; // remove name
    for (let attr of ["head", "hat", "body"])
        data[0][attr == "body" ? "armor" : attr] = this.playerprofiledata[attr];
    GUI.drawstory("profilecanvas", {
        type: "game",
        data: data
    });
}

function addButtonHandlers() {
    let self = this;
    
    GUI.onclick("profilebuttonaddfriend", function(e) {
        GUI.hidepopup();
        self.triggerserver("addfriend", self.playerprofiledata.userid);
    });
    GUI.onclick("profilebuttonremovefriend", function(e) {
        GUI.hidepopup();
        self.triggerserver("removefriend", self.playerprofiledata.userid);
    });
    GUI.onclick("profilebuttonmessage", function(e) {
        GUI.writepm(self.playerprofiledata.userid, self.playerprofiledata.name + (self.playerprofiledata.isonline ? "" : " (offline)"));
    });
    GUI.onclick("profilebuttonclan", function(e) {
        GUI.hidepopup();
        GUI.viewclan(self.playerprofiledata.clanname);
    });
    GUI.onclick("profilebuttonlike", function(e) {
        self.triggerserver("addlike", self.playerprofiledata.userid);
    });
    GUI.onclick("profilebuttonunlike", function(e) {
        self.triggerserver("removelike", self.playerprofiledata.userid);
    });
    GUI.onclick("profilebuttonmore", function(e) {
        self.showProfileMore();
    });
    GUI.onclick("partner_link", function(e) {
        GUI.hidepopup();
        //player.chat = "Status: " + self.playerprofiledata.partner;
        player.showprofile(self.playerprofiledata.partner);
    });
}

function showProfileMore() {
    this.popup = GUI.showpopup({
        title: this.playerprofiledata.name,
        width: 710
    });
    GUI.addmenubuttons(this.popup, "profilemore", this.playerprofiledata);

    let socialButtons = GUI.create("profile_socialbuttons", "", "",
        "<div class=\"profilebuttons\">" +
        "<div id=\"profilebuttonsocial\"></div>" +
        "<div id=\"profilebuttonprofile\" class=\"profilebutton\">" + translate("Profile") + "</div>" +
        "<div id=\"profilebuttonmore\" class=\"profilebutton selected\">" + translate("More") + "</div>" +
        "</div>");
    this.popup.parentNode.appendChild(socialButtons);

    let self = this;
    GUI.onclick("profilebuttonprofile", function(e) {
        self.showPlayerProfile();
    });
}

function showEditStatus() {
    this.popup = GUI.showpopup({
        title: "Edit Status",
        backbutton: true
    });

    // Show status edit field
    let status = (this.playerprofiledata.status ? this.playerprofiledata.status : "");
    if (status.replaceAll)
        status = status.replaceAll("<br>", "\n").replaceAll("<hr>", "<hr>\n");
    this.popup.innerHTML = "<div style=\"font-size:24px\">" +
        "New Status:<br><textarea type=\"text\" id=\"editstatusstatus\" name=\"editstatusstatus\"" +
        " style=\"position: absolute; top: 0px; left: 170px; width:485px; height:180px\">" + status + "</textarea>\n" +
        "<label style=\"position:absolute;top:30px;width:100px\">(html)</label>\n" +
        "<label style=\"position:absolute;top:200px;width:100%\">YouTube/Insta:" +
        "<input type=\"text\" id=\"editstatussocial\" name=\"editstatussocial\"" +
        " style=\"position:absolute;left:170px;width:485px;height:32px;font-size:18px;\" value=\"" +
        (this.playerprofiledata.youtube ? "https://www.youtube.com/watch?v=" + this.playerprofiledata.youtube :
            this.playerprofiledata.instagram ? "https://www.instagram.com/p/" + this.playerprofiledata.instagram + "/" :
            this.playerprofiledata.tiktok ? "https://www.tiktok.com/video/" + this.playerprofiledata.tiktok :
            this.playerprofiledata.facebook ? "https://www.facebook.com/" + decodeURIComponent(this.playerprofiledata.facebook) :
            this.playerprofiledata.twitch ? "https://player.twitch.tv/?" + this.playerprofiledata.twitch : "") + "\"></label>" +
        "<label style=\"position:absolute;top:255px;width:100%\">" +
        translate("Write about how you feel or announce news. Please be nice to other players!") + "</label>\n" +
        "<br><div id=\"statussubmitbutton\" class=\"button\" style=\"\position:absolute; bottom:20px; left:280px;" +
        " width:200px; height:40px; line-height:40px; text-shadow:none; text-align:center;\">" + translate("Update") + "</div>" +
        "</div>";

    let self = this;
    GUI.onclick("statussubmitbutton", function() {
        let status = GUI.get("editstatusstatus").value;
        if (status) status = status.trim();
        if (status && status.replaceAll)
            status = status.replaceAll("<br>\n", "<br>").replaceAll("<hr>\n", "<hr>").replaceAll("\n", "<br>");
        let social = GUI.get("editstatussocial").value;
        if (social) social = social.trim();
        GUI.hidepopup();
        self.triggerserver("savestatus", status, social);
    });
    GUI.onback(function() {
        self.showPlayerProfile();
    });

    // GUI.focus("editstatusstatus");
}