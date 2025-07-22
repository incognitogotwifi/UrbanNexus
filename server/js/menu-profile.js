function onActivated(player, data, menu) {
    this.onClientLoadProfile(player, data.userid);
}

function onClientLoadProfile(player, otherid) {
    // echo("loadprofile: " + otherid + " -> " + player.id);

    let self = this;
    // let other = player;
    DB.loadplayer(otherid, function(other, updatetime) {
        if (other)
            self.sendProfile(player, other, updatetime);
        else
            player.showmessage("No player with that ID found.");
    });
}

function sendProfile(player, other, updatetime) {
    let config = Server.getconfig();

    let data = {id:other.networkid, userid:other.id, isself:(other == player)};
    this.addBasicInfo(data, other);
    this.addSpecialInfo(data, config, player, other, updatetime);
    this.addStatus(data, config, player, other);
    this.addBlocksFriendAndInvitations(data, config, player, other);
    if (player.adminlevel > 0)
        this.addAdminInfo(data, config, player, other);
    this.addLikes(data, config, player, other);
    this.addJailed(data, config, player, other);
    this.addClanInfo(data, config, player, other);
    this.addHouseInfo(data, config, player, other);

    this.triggerclient(player, "profile", data);
}

function addBasicInfo(data, other) {
    let copyattr = ["cases", "score", "name", "relationship", "partner", "horsecount", "faction", "adminlevel", "body", "bombs", "bow", "coins", "deaths", "hat", "head", "hp", "isonline", "kills",
        "maxhp", "mobkills", "shield", "sparwins", "sparlost", "profilestoryid", "streak", "title", "weapon"];
    for (let attr of copyattr)
        data[attr] = other[attr];
        
    // fix the horse count
    data["horsecount"] = player.getitems(['mount']).length || 0;
}

function addSpecialInfo(data, config, player, other, updatetime) {
    if (other.muted && player.adminlevel > 0)
        data.name += " (muted)";

    //data.onlinetime = this.printTime(other.onlinetime, true);
    data.onlinetime = this.printTimeFull(other.onlinetime, true);
    if (!data.isonline && updatetime)
         data.offlinetime = this.printTime(Math.floor((Date.now() - updatetime.getTime()) / 1000), false);

    // Show translation button if auto-translate is turned off
    let mysettings = player.getsettings();
    if (data.isonline && !data.isself && other.chat && other.chat.length > 0 && other.map == player.map && !other.stealth &&
            mysettings && mysettings.notranslate) {
        data.chat = other.chat;
        data.cantranslate = true;
    }
    if (other.language)
        data.chatlanguage = other.language;
    data.achievementstatus = other.getachievementstatus();
    data.arrows = (other.hasunlimitedammo()? "" : other.arrows | 0);

    if (!data.profilestoryid && config.profilestoryid)
        data.profilestoryid = config.profilestoryid;
    data.canviewstories = true;

    if (other.ping && (data.isself || player.adminlevel > 0 || this.isSparring(other))) {
        data.ping = other.ping;
        if (data.isonline)
            data.os = (["iOS","Android"].indexOf(other.os) >= 0? other.os : "Desktop");
    }
    //kavu'a script
    if (data.cases == undefined) {
        data.cases = 0;
    }
    if (data.score == undefined) {
        data.score = 0;
    }


    if (config.isxmas && config.xmascurrency)
        data[config.xmascurrency] = other.getitemnr(config.xmascurrency);
    if (config.eventcurrency)
        data.ec = other.getitemnr(config.eventcurrency);
    if (config.sharecurrency)
        data.nc = other.getitemnr(config.sharecurrency);
}

function isSparring(other) {
    return other.map && other.map.template && (other.map.template.indexOf("event") >= 0 ||
      (other.map.template.indexOf("spar") >= 0 && other.map.template.indexOf("lobby") < 0));
}

function addStatus(data, config, player, other) {
    if (other.statusban) {
        data.statusban = other.statusban;
        data.caneditstatus = false;
        return;
    }

    data.status = other.status;
    // Add youtube video, instagram post or Twitch video at top
    //Note: in custom profiles we could display all social media links, not just one
    if (other.instagram && other.instagram.length > 0 && config.instagramlink) {
        data.instagram = other.instagram;
        data.status2 = player.translate(config.instagramlink, [other.instagram]);
    } else if (other.youtube && other.youtube.length > 0 && config.youtubelink) {
        data.youtube = other.youtube;
        data.status2 = player.translate(config.youtubelink, [other.youtube]);
    } else if (other.facebook && other.facebook.length > 0 && config.facebooklink) {
        data.facebook = other.facebook;
        data.status2 = player.translate(config.facebooklink, [other.facebook]);
    } else if (other.twitch && other.twitch.length > 0 && config.twitchlink) {
        data.twitch = other.twitch;
        data.status2 = player.translate(config.twitchlink, [other.twitch]);
    } else if (other.tiktok && other.tiktok.length > 0 && config.tiktoklink) {
        data.tiktok = other.tiktok;
        data.status2 = player.translate(config.tiktoklink, [other.tiktok]);
    }
    data.caneditstatus = data.isself;
    if (data.caneditstatus)
        data.statusallowed = true;
}

function addBlocksFriendAndInvitations(data, config, player, other) {
    data.isfriend = player.isfriend(other.id);
    data.isblocked = player.isblocked(other.id);
    data.canblock = !data.isself && !data.isblocked && !data.isfriend && (!data.adminlevel || data.adminlevel <= 0);
    data.canunblock = data.isblocked;
    let otherblockedme = player.adminlevel <= 0 && other.isblocked(player.id);
    data.anyblocked = data.isblocked || otherblockedme;

    // Friends and actions
    let settings = other.getsettings();
    let isspar = this.isSparring(other);

    data.canaddfriend = !data.anyblocked && !data.isself && !data.isfriend;
    data.canmessage = !data.anyblocked && !data.isself && (data.isonline || config.offlinepms);
    data.canspar = !config.nosparinvites && !data.anyblocked && !data.isself && data.isonline &&
        !(settings && settings.nosparinvites) && !isspar;
    data.canbowspar = data.canspar && other.bow && player.bow;
    data.canmanagesidekick = data.isself && player.sidekick;
    data.cantrade = config.allowtrade && !data.anyblocked && !data.isself && data.isonline && !isspar &&
        !(settings && settings.notradeinvites) && !other.itemset && !other.injail && !other.intrade &&
        !player.itemslockedorbyevent && !other.itemslockedorbyevent;
} 

function addAdminInfo(data, config, player, other) {
    let ishigheradmin = (!data.adminlevel || player.adminlevel > data.adminlevel);
    let ishigherorsame = (!data.adminlevel || player.adminlevel >= data.adminlevel);

    data.canadministrate = true;
    data.cansummon = data.isonline && !data.isself && ishigherorsame;
    data.canwarpto = data.isonline && !data.isself;
    data.canunstick = data.isonline && ishigherorsame;
    data.canrefillarrows = data.isonline;
    data.canrefillbombs = data.isonline;
    data.canresetname = ishigherorsame;
    data.canresetstatus = ishigherorsame && ((other.status && other.status.length > 0) ||
        other.youtube || other.instagram || other.facebook || other.twitch || other.tiktok) &&
        player.hasadmincommand("resetstatus");
    data.canresetstory = ishigherorsame && other.profilestoryid && player.hasadmincommand("resetstory");
    data.canjail = (!data.adminlevel || data.adminlevel <= 0);
    data.cantojail = true;
    data.canaddcoins = player.hasadmincommand("addcoins");
    data.canaddeventcoin = player.hasadmincommand("addeventcoin") || player.hasadmincommand("addeventgem");
    data.canstealth = (data.isself && player.hasadmincommand("stealth"));
    data.canstealthhigh = data.canstealth && player.adminlevel >= (config.adminlevelhighstealth? config.adminlevelhighstealth : 7);
    data.canviewinventory = ishigherorsame;
    data.canrefundupload = player.hasadmincommand("refundupload");
    data.canadmintag = data.isself;
    data.candisconnect = data.isonline && ishigheradmin;
    data.canremoveitem = player.hasadmincommand("removeitem");
    data.caneditstories = player.hasadmincommand("stories");
    data.canviewtrades = player.hasadmincommand("tradeadmin");
    data.canlockitems = (!other.itemslocked && player.hasadmincommand("lockitems") && ishigheradmin);
    data.canunlockitems = (other.itemslocked && player.hasadmincommand("lockitems") && ishigheradmin);
    data.canblockuploads = (!other.uploadsblocked && player.hasadmincommand("blockuploads") && ishigheradmin);
    data.canunblockuploads = (other.uploadsblocked && player.hasadmincommand("blockuploads") && ishigheradmin);
    data.canmute = (!other.muted && player.hasadmincommand("mute") && ishigheradmin);
    data.canunmute = (other.muted && player.hasadmincommand("mute") && ishigheradmin);

    data.canvisithouse = ishigheradmin;
}

async function addLikes(data, config, player, other) {
    data.nrlikes = await DB.getlikescount(other.id);
    data.like = await DB.hasliked(player.id, other.id);
}

async function addJailed(data, config, player, other) {
    let info = await DB.getjailinfo(other.id);
    if (!info)
        return;

    data.injail = true;
    data.jailtime = info.jailtime;
    data.jailtimeleft = info.timeleft;
    data.jailreason = info.reason;
    data.jailadminid = info.adminid;
    data.jailadminname = info.adminname;

    data.cantrade = false;
}

function addClanInfo(data, config, player, other) {
    data.clanname = other.clanname;
    let settings = other.getsettings();
    if (!data.anyblocked && player.clanname && player.clanname != data.clanname &&
            !(settings && settings.noclaninvites)) {
        // Check if we can recruit this player
        data.canrecruit = data.isonline && !this.isSparring(other);
    }
}

async function addHouseInfo(data, config, player, other) {
    if (anyblocked || !data.isonline || data.isself)
        return;
    
    // Show if we can visit the other players land
    let settings = other.getsettings();
    if (settings && settings.houseopen)
        data.canvisithouse = true;

    // Check extra things for online players
    // House invitations
    if ((settings && settings.nohouseinvites) || this.isSparring(other))
        return;

    let houses = await DB.getplayerhouses(player.id);
    data.caninvitetohouse = (houses && houses.length > 0);
}

function printTime(time, uptohours, twoparts) {
    let secs = Math.max(0, time | 0);
    if (secs < 60*2)
        return secs + "s";

    let mins = Math.floor(secs / 60);
    secs -= mins * 60;
    if (mins < 60*2)
        return mins + "m";

    let hours = Math.floor(mins / 60);
    mins -= hours * 60;
    if (uptohours || hours < 24*2)
        return hours + "h" + (twoparts && mins > 0? " " + mins + "m" : "");

    let days = Math.floor(hours / 24);
    hours -= days * 24;
    return days + " days" + (twoparts && hours > 0? " " + hours + "h" : "");
}

function printTimeFull(time, uptohours, twoparts) {
    let secs = Math.max(0, time | 0);
    if (secs < 60*2)
        return secs + " seconds";

    let mins = Math.floor(secs / 60);
    secs -= mins * 60;
    if (mins < 60*2)
        return mins + " minutes";

    let hours = Math.floor(mins / 60);
    mins -= hours * 60;
    if (uptohours || hours < 24*2)
        return hours + " hours" + (twoparts && mins > 0? " " + mins + "m" : "");

    let days = Math.floor(hours / 24);
    hours -= days * 24;
    return days + " days" + (twoparts && hours > 0? " " + hours + " Hours" : "");
}

async function onClientLoadStory(player, storyid) {
    // Only send the data (player movement), don't need tiles etc.
    let story = await DB.loadstory(storyid);
//    echo("loadstory: " + storyid, story);
    if (story)
        this.triggerclient(player, "story", story.data);
}

async function onClientAddLike(player, otherid) {
    await DB.addlike(player.id, otherid);
    this.onClientLoadProfile(player, otherid);

    player.scheduleevent(0, "likesent", otherid);

    let other = Server.searchplayers({id: otherid})[0];
    if (other) {
        let settings = other.getsettings();
        if (!(settings && settings.nolikemsg) && !other.isblocked(player.id) && !this.isSparring(other))
            other.showmessage("Player %s has liked your profile!", [player.name], player);
        other.scheduleevent(0, "likereceived", player.id);
    }
}

async function onClientRemoveLike(player, otherid) {
    await DB.removelike(player.id, otherid);
    this.onClientLoadProfile(player, otherid);
}

async function onClientAddFriend(player, otherid) {
    if (!otherid || player.id == otherid)
        return;

    let other = await DB.loadplayer(otherid);
    if (!other || other.isblocked(player.id))
        return;
}

module.exports = {
    onActivated,
    onClientLoadProfile,
    sendProfile,
    addBasicInfo,
    addSpecialInfo,
    isSparring,
    addStatus,
    addBlocksFriendAndInvitations,
    addAdminInfo,
    addLikes,
    addJailed,
    addClanInfo,
    addHouseInfo,
    printTime,
    printTimeFull,
    onClientLoadStory,
    onClientAddLike,
    onClientRemoveLike,
    onClientAddFriend
};