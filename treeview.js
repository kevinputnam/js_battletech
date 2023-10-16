function flipCaret(tag){
      tag.parentElement.querySelector(".nested").classList.toggle("active");
      tag.classList.toggle("caret-down");
}

class TreeNode {
  static next_id = 0;

  constructor(dataObject) {
    this.id = TreeNode.next_id;
    TreeNode.next_id += 1;
    this.dataObject = dataObject;
    this.node = document.createElement("div");
    this.node.setAttribute("class","treeNode");
    this.span = document.createElement("span");
    this.span.innerHTML = '<b>'+ dataObject.name + ':</b> ' + dataObject.description;//dataObject.text();
    var me = this;
    this.span.addEventListener(
      "click",
      function () {
        var highlighted_divs = document.getElementsByClassName('select-highlight');
        for (const d of highlighted_divs){
          d.classList.remove('select-highlight');
        }
        me.span.classList.add('select-highlight');
        me.edit();
      },
      false,
    );
    this.node.append(this.span);
    this.has_children = false;
  }

  append(tree_node) {
    this.node.append(tree_node);
    if (!this.has_children){
      this.span.setAttribute('class','caret');
      this.span.setAttribute('onclick','flipCaret(this)');
    }
    this.has_children = true;
  }

  // STEPS
  // get attributes
  // add handling for each of the types:
  //   * boolean: true/false selector
  //   * string: text field
  //   * list of things: add/remove things with selector of available things - thing may be in only one place at a time.
  //   * list of actions: treeview of actions in upper view (nested)
  //   * sprite: fixed image or animations - dialog?
  //   * collisions: not sure
  // display them
  // make sure the changes are accessible to update object
  // bind save method to save button
  // other option is to validate and update in realtime (no save button)
  // need to break out logic into child methods
  edit(){
    var editView = document.getElementById("editview");
    editView.innerHTML = ""; //clear out whatever was there
    var attrs = this.dataObject.getAttributes();
    //every object that comes through here will have an ID and a type
    var title = document.createElement("span");
    var bold = document.createElement("b");
    bold.innerHTML = this.dataObject.type + "[" + this.dataObject.id + "]";
    title.append(bold);
    editView.append(title)
    var itemdiv = document.createElement("div");
    itemdiv.setAttribute("class","itemview");
    for (const [key,val] of Object.entries(this.dataObject.attributes)){
      var br = document.createElement("br");
      var theArgs = [itemdiv,key,val];
      this["edit"+val[0]](...theArgs)
    }
    editView.append(itemdiv);
    var saveButton = document.createElement("button");
    saveButton.setAttribute("class","editsave");
    saveButton.innerHTML = "Save";
    var me = this;
    saveButton.addEventListener(
      "click",
      function () {
        me.save();
      },
      false,
    );
    editView.append(saveButton);
  }

  editList(parent,attr,type){
    console.log("edit list");
    if (type[1] == "Action"){
      console.log("edit Actions");
    } else if (type[1] == "Collision"){
      console.log("edit Collisions");
    }
  }

  editString(parent,attr,type){
    var currVal = this.dataObject[attr];
    var itemLabel = document.createElement("label");
    itemLabel.setAttribute("for",attr + "Text");
    itemLabel.innerHTML = attr + ": ";
    var inputField = document.createElement("input");
    inputField.setAttribute("type","text");
    inputField.setAttribute("name",attr);
    inputField.setAttribute("size",75);
    inputField.value = currVal;
    parent.append(itemLabel);
    parent.append(inputField);
    parent.append(document.createElement("br"));
    console.log("edit string");
  }

  editSprite(parent,attr,type){
    console.log("edit sprite");
  }

  editBoolean(parent,attr,type){
    var currVal = this.dataObject[attr];
    var itemLabel = document.createElement("label");
    itemLabel.setAttribute("for",attr + "Select");
    itemLabel.innerHTML = attr + ": ";
    var valSelect = document.createElement("select");
    valSelect.setAttribute("id",attr + "Select");
    var trueOption = document.createElement("option");
    trueOption.setAttribute("value","true");
    trueOption.innerHTML = "True";
    var falseOption = document.createElement("option");
    falseOption.setAttribute("value","false");
    falseOption.innerHTML = "False";
    if (currVal){
      trueOption.setAttribute("selected","True");
    }else{
      falseOption.setAttribute("selected","True");
    }
    valSelect.append(trueOption);
    valSelect.append(falseOption);
    parent.append(itemLabel);
    parent.append(valSelect);
    parent.append(document.createElement("br"));
  }

  save(){
    console.log("Save edits to " + this.dataObject.type + " [" + this.dataObject.id + "]");
    var attributes = document.getElementsByClassName("itemattr");
    console.log(attributes);
  }
}


class Variable {
  constructor(){
    this.type = "Variable";
    this.name = '';
    this.value = '';
  }

  text(){
    return this.name + ": " + this.value;
  }
}

function actionFactory(action_list){
  if (!action_list){
    return [];
  }
  var actions = []
  for (a_data of action_list){
    var action = new Action(a_data);
    action.actions = actionFactory(a_data.actions);
    actions.push(action);
  }
  return actions;
}

class Action {

  constructor(attributes) {
    this.type = "Action";
    this.name = 'name';
    this.description = "It does something.";
    this.actions = [];

    for (const [key,value] of Object.entries(attributes)){
        this[key] = value;
    }

    this.attributes = {
      "name":["String"],
      "description":["String"],
      "actions":["List","Action"],
    }
  }

  text(){
    return this.name + ": " + this.description;
  }

  getAttributes(){
    return this.attributes;
  }

  setAttributes(){

  }

}

class Thing {

  constructor(attributes) {
    this.type = "Thing";
    this.id = 0; //this needs to be assigned when the thing is added to the game
    this.name = 'name';
    this.description = "It's something all right.";
    this.canTake = false;
    this.hidden = false;
    this.actions = [];
    this.on_collision = [];
    this.trigger = false;
    this.triggered = false;

    this.location = [0,0];
    this.dimensions = [0,0];
    this.dx = 0;
    this.dy = 0;
    this.direction = 'none';

    this.sprite = null;

    for (const [key,value] of Object.entries(attributes)){
        this[key] = value;
    }

    this.attributes = {
      "name":["String"],
      "description":["String"],
      "canTake":["Boolean"],
      "hidden":["Boolean"],
      "actions":["List","Action"],
      "on_collision":["List","Collision"], //needs some thought - current form in json doesn't really make sense
      "trigger":["Boolean"],
      "sprite":["Sprite"]
    }
  }

  text(){
    return this.name + ": " + this.description;
  }

  getAttributes(){
    return this.attributes;
  }

  setAttributes(){

  }
}

function treeNodeTesting() {
  var tv = document.getElementById('treeview');
  var banana = new Thing({"id":0,"name":"Banana","description":"It is a little over ripe. Maybe it is time to make some banana bread.","canTake":true});
  var apple = new Thing({"id":1,"name":"Apple","description":"A lovely, red example of the fruit."});
  var seed = new Thing({"id":2,"name":"Seed","description":"Small and innocuos. Get enough of them, and it could be deadly."});
  var peach = new Thing({"id":3,"name":"Peach","description":"A little fuzzy. Super delicious"})
  var pit = new Thing({"id":4,"name":"Pit","description":"Gnarly, big, and a tooth cracker."})

  var banana_tn = new TreeNode(banana);
  tv.append(banana_tn.node);

  var apple_tn = new TreeNode(apple);
  tv.append(apple_tn.node);

  var seed_tn = new TreeNode(seed);
  apple_tn.node.append(seed_tn.node);

  var peach_tn = new TreeNode(peach);
  tv.append(peach_tn.node);

  var pit_tn = new TreeNode(pit);
  peach_tn.node.append(pit_tn.node);
}
