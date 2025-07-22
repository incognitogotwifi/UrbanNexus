/*
    new shop system, all in one script, still under construction,
    you can see small bugs that will be fixed soon.
*/

/*
function onCreated() {
    //this.createShop(['hamburger', 'crabcake', 'bun', 'loaf'], true);
    //this.createShop('hamburger');
}
*/

function onUpdated() { this.onCreated(); }

function createShop(items, isSellable = false, single = false) {
    if( !(['string', 'object'].includes(typeof items)) ) { this.say(errorMessages('cstr&obj')); return; };
    if(typeof isSellable !== 'boolean') { this.say(errorMessages('cboolean')); return; };
    if(typeof single !== 'boolean') { this.say(errorMessages('cboolean')); return; };
    
    this.chat = '';
    this.name = '';

    this.items = items;
    this.sellable = isSellable;
    this.single = single;
    this.lock = false;
    
    if(!Array.isArray(items))
        this.createNPC(items);
    else {
        this.image = 'lekai_placeholder.png';
        this.shoptype = 'normal';
    }
    
    switch(this.shoptype) {
        case 'normal':
            //this.say('Type: normal');
        break;

        case 'hat': case 'head': case 'body':
            //this.say('Type: ' + this.shoptype);
            this.sellable = false;
            this.single = true;
        break;
        
        default:
            this.chat = errorMessages('notfound1');
            this.lock = true;
        break;
    }
} // END -> createShop(type, items)

function onClientOpenShop(player) {
    if(this.lock === true) return this.say(errorMessages('shopbroken'));
    let items;

    switch(typeof this.items) {
        case 'string':
            items = this.getItemInfos(this.items);
            if(items === null) return this.say(errorMessages('shopbroken') + ', Item not found');
            //this.chat = `Item: ${items.name} Image: ${items.image} Price: ${items.price}`;
        break;

        case 'object':
            if(!Array.isArray(this.items)) return this.say(errorMessages('shopbroken'));
            items = [];
            for(let item of this.items) {
                let i = this.getItemInfos(item);
                if(i != null) items.push(i);
            }

            if(items.length <= 0) return this.say(errorMessages('shopbroken'));
        break;

        default: return this.say(errorMessages('shopbroken'));
    }
    
    this.triggerclient(player, 'openshop', this.shoptype, items, this.sellable);
} // END -> onClientLoadShop(player)

function onClientConfirm(player, id, quantity) {
    // To avoid hackers, make sure the item was valid in the shop when it was created.
    //this.echo(this.checkItems(id));

    if(!this.checkItems(id)) return;
    if(this.sellable) this.sell(player, id, quantity);
    else this.buy(player, id, quantity);
}

function buy(player, id, quantity) {
    // get info
    let item = Server.getconfig("items", "itemid").index[id];

    // 1 - Case for a one-time purchase, the player cannot purchase again.
    // 2 - Check if the player has the item in their inventory.
    if(this.single === true
    && player.hasitem(id) === true) return player.showmessage("You already have "+ item.name +" in your inventory.");

    // Check if the player can buy if he has enough coins
    if(player.coins < item.price * quantity) return player.showmessage("You do not have enough coins to purchase x"+ quantity +" "+ item.name);

    // Removes coins and adds the item to the player inventory
    player.removecoins(item.price * quantity, `player bought ${item.name}`);
    player.additem(id, quantity, { noautoequip: true });
    
    // Check if the item has been added to the player's account, if it has not been added, return the coins to the player
    if(player.hasitem(id) === true) this.triggerclient(player, "destroygui");
    else player.addcoins(item.price * quantity, `some unexpected error happened`);
}

function sell(player, id, quantity) {
    // get item info
    let item = Server.getconfig("items", "itemid").index[id];

    // Check if the player has the item in their inventory
    if(player.hasitem(id) === false) return player.showmessage("You do not have "+ item.name +" in your inventory.");
    // check coins
    if(player.getitemnr(id) < quantity) return player.showmessage("You do not have enough "+ item.name +" to sell x"+ quantity);
    // add coins | remove item
    player.addcoins(item.price * quantity, "player sold x"+ quantity +" " + item.name);
    player.removeitem(id, quantity);
    
    //Destroy Gui
    this.triggerclient(player, "destroygui");
}

function checkItems(id) {
    if(Array.isArray(this.items)) {
        return this.items.includes(id);
    } else {
        return this.items === id;
    }
}

function getItemInfos(id) {
    let item = Server.getconfig("items", "itemid").index[id];
    //this.echo(item);
    
    return typeof item.name === 'string' ?
    {
        id: id,
        name: item.name,
        image: this.getImage(item),
        price: item.price,
        desc: item.description,
        nr: player.getitemnr(id)
    }
    : null;
}

function getImage(any) {
    let image, item;
    if(typeof any === 'string')
        item = Server.getconfig("items", "itemid").index[any];
    else item = any;
    
    if(!item) {
        image = 'lekai_placeholder.png';
    } else {
        if(item.image) image = item.image;
        if(item.armor) image = item.armor;
        if(item.head) image = item.head;
        if(item.hat) image = item.hat;
    }

    return image;
}

function createNPC(any) {
    let item;
    if(typeof any === 'string')
        item = Server.getconfig("items", "itemid").index[any];
    else item = any;
    
    if(!item) {
        this.image = 'lekai_placeholder.png';
        this.chat = 'Item Not Found!!';
    } else {
        if(item.name) this.name = item.name;
        if(item.ani) this.ani = item.ani;

        if(item.image) { this.image = item.image; this.shoptype = 'normal'; } else
        if(item.armor) { this.body = item.armor; this.shoptype = 'body'; } else
        if(item.head) { this.head = item.head; this.shoptype = 'head'; } else
        if(item.hat) { this.hat = item.hat; this.shoptype = 'hat'; }
    }
}

function errorMessages(type) {
    this.lock = true;
    
    switch(type) {
        case 'cstr&obj': return 'the first argument is not a string or object';
        case 'cboolean': return 'the third argument is not a boolean';
        case 'notfound1': return 'shop type not found';
        case 'shopbroken': return 'this shop is broken';
        default: return 'error';
    }
}