/*
 * BrowserQuest Player Profile Menu System
 * Integrated from iappsbeats-inspired profile system
 */

define(['jquery'], function($) {
    
    var ProfileMenu = Class.extend({
        init: function(game) {
            this.game = game;
            this.playerprofiledata = null;
            this.popup = null;
        },

        createProfileDiv: function(headimage, bodyimage, hatimage) {
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
            
            .hands-left {
                width: 8px; 
                height: 11px;
                z-index: 28;
                left: 6px;
                position: absolute;
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
        },

        onActivated: function(player, data, menu) {
            // Request profile data from server
            this.game.client.sendMessage([Types.Messages.PROFILE_REQUEST, data.userid]);
        },

        onServerProfile: function(player, data) {
            this.playerprofiledata = data;
            
            if (player.map && player.map.name && player.map.name.includes("kavua")) { 
                this.showCloneBerryProfile(player); 
            } else {
                this.showPlayerProfile();
            }
        },

        showCloneBerryProfile: function(player) {
            var data = this.playerprofiledata;
            if (!data) return;

            // Create popup container
            this.popup = this.createPopupContainer(data.name, 250, 460);
            
            var head_image_url = this.getImageForItem('head', data.head);
            var body_image_url = this.getImageForItem('armor', data.body);
            var hat_image = this.getImageForItem('hat', data.hat);
            
            var profileHTML = `
                <div style="top: 0; left: 0; display: flex; flex-direction: column; width: 100%;">
                  <div style="background-color: transparent; display: flex; justify-content: space-between; align-items: center;">
                    <div style="color: white;" class="profile-name">${data.name}</div>
                    <div class='customclosebtn' style='cursor: pointer; display:flex'></div>
                  </div>

                  <div style="display: flex; margin-top: 12px;">
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
                        ${this.createProfileDiv(head_image_url, body_image_url, hat_image)}
                      </div>
                    </div>
                    
                    <div style="font-size: 14px; margin-left: 12px;"></div>
                    <div style="background-color: transparent; flex: 1; padding-left: 12px;"></div>
                  </div>

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
                    ${data.status || 'No status set'}
                  </div>
                  
                   <div style="max-height: 60px; padding: 12px; font-size: 16px">
                        <div>Cases: ${data.cases || 0}</div>
                        <div>Achievement Score: ${data.score || 0}</div>
                   </div>
                </div>
            `;
            
            this.popup.innerHTML = profileHTML;
            this.setupCloseButton();
        },

        showPlayerProfile: function() {
            var data = this.playerprofiledata;
            if (!data) return;

            this.popup = this.createPopupContainer(data.name, 710, 400);
            
            var html = "<div class='profile-content'>";
            
            // Basic stats
            html += this.makeTextDiv("Coins:", data.coins || 0, "profile_coins");
            html += this.makeTextDiv("Event Coins:", data.ec || 0, "profile_eventcoins");
            html += this.makeTextDiv("Mobs Killed:", data.mobkills || 0, "profile_mobkills");
            html += this.makeTextDiv("Deaths:", data.deaths || 0, "profile_deaths");
            
            var killstr = data.kills || 0;
            if (data.streak > 0) {
                killstr += " <span class='profile_streak'>Streak of " + data.streak + "</span>";
            }
            html += this.makeTextDiv("Kills:", killstr, "profile_kills");
            html += this.makeTextDiv("Spar Record:", (data.sparwins || 0) + "-" + (data.sparlost || 0), "profile_spar");
            
            if (data.onlinetime) {
                html += this.makeTextDiv("Online Time:", data.onlinetime, "profile_onlinetime");
            }
            
            if (data.ping) {
                html += this.makeTextDiv("Ping:", data.ping + "ms", "profile_ping");
            }
            
            // Additional stats
            html += this.makeTextDiv("Arrows:", data.arrows || 0, "profile_arrows");
            html += this.makeTextDiv("Faction:", data.faction || "none", "profile_faction");
            
            // Admin info
            if (data.adminlevel > 0) {
                html += this.makeTextDiv("Admin Level:", data.adminlevel, "profile_adminlevel");
            }
            
            html += "</div>";
            
            this.popup.innerHTML = html;
            this.setupCloseButton();
        },

        makeTextDiv: function(label, value, className) {
            return `<div class="${className}" style="margin: 5px 0; padding: 5px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                        <strong>${label}</strong> ${value}
                    </div>`;
        },

        getImageForItem: function(itemtype, itemvalue) {
            if (!itemvalue) return 'img/guard.png'; // default image
            
            // Map item values to actual image paths
            var imagePath = 'img/';
            switch(itemtype) {
                case 'head':
                    imagePath += itemvalue + '.png';
                    break;
                case 'armor':
                    imagePath += itemvalue + '.png';
                    break;
                case 'hat':
                    imagePath += itemvalue + '.png';
                    break;
                default:
                    imagePath += 'guard.png';
            }
            
            return imagePath;
        },

        createPopupContainer: function(title, width, height) {
            // Remove existing popup if any
            if (this.popup) {
                this.hideProfile();
            }
            
            var popup = document.createElement('div');
            popup.className = 'profile-popup';
            popup.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: ${width}px;
                height: ${height}px;
                background: #3D3D3D;
                border: 2px solid #656565;
                border-radius: 10px;
                z-index: 1000;
                padding: 20px;
                box-shadow: 0 0 20px rgba(0,0,0,0.5);
                color: white;
                font-family: Arial, sans-serif;
                overflow-y: auto;
            `;
            
            // Add title
            var titleElement = document.createElement('h3');
            titleElement.textContent = title;
            titleElement.style.cssText = `
                margin: 0 0 15px 0;
                text-align: center;
                color: #fff;
                border-bottom: 1px solid #656565;
                padding-bottom: 10px;
            `;
            popup.appendChild(titleElement);
            
            document.body.appendChild(popup);
            this.popup = popup;
            
            return popup;
        },

        setupCloseButton: function() {
            if (!this.popup) return;
            
            var closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 15px;
                background: #ff4444;
                color: white;
                border: none;
                width: 25px;
                height: 25px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                line-height: 1;
            `;
            
            var self = this;
            closeBtn.onclick = function() {
                self.hideProfile();
            };
            
            this.popup.appendChild(closeBtn);
            
            // Also close on escape key
            this.escapeHandler = function(e) {
                if (e.key === 'Escape') {
                    self.hideProfile();
                }
            };
            document.addEventListener('keydown', this.escapeHandler);
        },

        hideProfile: function() {
            if (this.popup) {
                document.body.removeChild(this.popup);
                this.popup = null;
            }
            
            if (this.escapeHandler) {
                document.removeEventListener('keydown', this.escapeHandler);
                this.escapeHandler = null;
            }
        },

        // Handle profile data received from server
        handleProfileData: function(data) {
            this.playerprofiledata = data;
            this.showPlayerProfile();
        }
    });

    return ProfileMenu;
});