var game_files = ["test.json"];
var game;

function populate_game_picker(){
  var gameselector = document.getElementById('gamefilepicker');
  for (const gamefile of game_files){
    var opt = new Option;
    opt.value = gamefile;
    opt.innerHTML = gamefile;
    gameselector.appendChild(opt);
  }
}

function get_game_data(){
  var gameselector = document.getElementById('gamefilepicker');
  fetch(gameselector.value).then(response => response.text()).then(respText => load_game(respText));
}

function load_game(text){
  var jstuff = JSON.parse(text);
  game = new Game(jstuff);
  update_gameview();
}

function populate_scene_picker(){
  var sceneselector = document.createElement('select');
  sceneselector.setAttribute('id','sceneselector');
  for (const [key,value] of Object.entries(game.scenes)){
    var opt = new Option;
    opt.value = value.id;
    opt.innerHTML = value.name;
    sceneselector.appendChild(opt);
  }
  sceneselector.addEventListener("change",selectScene);
  return sceneselector;
}

function selectScene(){
  update_sceneview(document.getElementById("sceneselector").value);

}

function update_gameview(){
  var gametitle = document.getElementById('gametitle');
  gametitle.innerHTML = game.name;
  var treeview_html = '    <ul>\n';
  for (const [key,value] of Object.entries(game)){
    var type_string = Object.prototype.toString.call(value);
    if (type_string.includes("Object")){
      if (key == 'attributes' || key == 'things' || key == 'scenes'){
        continue;
      }
      treeview_html += '      <li><span class="caret" onclick="flipCaret(this)">' + key + '</span>\n';
      treeview_html += '        <ul class="nested">\n';
      for (const [k,v] of Object.entries(game[key])){
        edit_string = key + ',' + k;
        if (key == 'scenes'){
          display_string = v['name'];
        }else{
          display_string = k + ":" + v;
        }
        treeview_html += '          <li onclick="edit_game_item(\''+edit_string+'\')">' + display_string + '</li>\n';
      }
      treeview_html += '        </ul>\n';
      treeview_html += '      </li>\n';
    }else{
      treeview_html += '      <li onclick="edit_game_item(\''+key+'\')">' + key + ': ' + value + '</li>';
    }
  }
  treeview_html += '    </ul>';
  var gameview = document.getElementById('gamedata');
  gameview.innerHTML = treeview_html;
  var sceneLabel = document.createElement('span');
  sceneLabel.innerHTML = '<b>Current Scene:</b>';
  gameview.append(sceneLabel);
  gameview.append(populate_scene_picker());
  selectScene();
}

function update_thingview_list(thing_view, thing_list){
  thing_view.innerHTML = '';
  for (const id of thing_list){
    var t = new Thing(game.things[id]);
    var tn = new TreeNode(t);
    thing_view.append(tn.node);
  }
}

function update_actionview(action_view, actions){
  action_view.innerHTML = '';
  for (const action of actions){
    var tn = new TreeNode(action);
    if (action.actions.length > 0){
      var new_tv = document.createElement('div');
      new_tv.setAttribute('class','nested');
      update_actionview(new_tv,action.actions);
      tn.append(new_tv);
    }
    action_view.append(tn.node);
  }
}

function update_sceneview(scene_id){
  scene = game.scenes[scene_id];
  var scenetitle = document.getElementById('scenetitle');
  scenetitle.innerHTML = scene['name'] + ' (ID: ' + scene.id + ')';
  var sceneview = document.getElementById('scenedata');
  sceneview.innerHTML = '';
  var editview = document.getElementById('editview');
  editview.innerHTML = '';
  var top_tree = document.createElement('ul');
  for (const [key,value] of Object.entries(scene)){
    if (key == 'background'){
      var mapview = document.getElementById('mapview');
      var img = document.createElement('img');
      img.setAttribute('src',value);
      mapview.innerHTML = '';
      mapview.append(img);
    } else if (key == 'name'){
      var li = document.createElement('li');
      li.innerHTML = key + ': ' + value;
      top_tree.append(li);
    } else if (key == 'collisions'){
      var li = document.createElement('li');
      li.innerHTML = key + ': [...]';
      top_tree.append(li);
    } else if (key == 'things'){
      var li = document.createElement('li');
      var sp = document.createElement('span');
      var thing_tv = document.createElement('div');
      sp.setAttribute('class','caret');
      sp.setAttribute('onclick','flipCaret(this)');
      sp.innerHTML = key;
      li.append(sp);
      thing_tv.setAttribute('class','nested');
      li.append(thing_tv);
      update_thingview_list(thing_tv,scene.things);
      top_tree.append(li);
    } else if (key == 'actions'){
      var li = document.createElement('li');
      var sp = document.createElement('span');
      var action_tv = document.createElement('div');
      sp.setAttribute('class','caret');
      sp.setAttribute('onclick','flipCaret(this)');
      sp.innerHTML = key;
      li.append(sp);
      action_tv.setAttribute('class','nested');
      li.append(action_tv);
      var actions = actionFactory(scene.actions);
      update_actionview(action_tv,actions);
      top_tree.append(li);
    }
  }
  sceneview.append(top_tree)
}

function old_update_sceneview(scene_id){
  scene = game.scenes[scene_id];
  var scenetitle = document.getElementById('scenetitle');
  scenetitle.innerHTML = scene['name'] + ' (ID: ' + scene.id + ')';
  var sceneview = document.getElementById('scenedata');
  var html_out = '<ul>\n';
  for (const [key,value] of Object.entries(scene)){
    console.log(key);
    html_basic = '  <li data-scene-id="' + scene.id + '" data-key="' + key + '" onclick="edit_scene_item(this)">'
    if (key == "background"){
      var mapview = document.getElementById('mapview');
      mapview.innerHTML = '<img src="' + value + '">';
    }else if (key == "name"){
      html_out += html_basic + key + ": " + value + '</li>\n';
    }else if (key == "collisions"){
      html_out += html_basic + key + ": [...]";
    }else if (key == "things"){
      html_out += '    <li><span class="caret" onclick="flipCaret(this)">' + key + '</span>\n';
      html_out += '      <ul class="nested">\n';
      for (const thing_id of scene[key]){
        html_out += '        <li data-thing-id="' + thing_id + '" onclick="edit_thing(this)">' + game['things'][thing_id]['name'] + '</li>';
      }
      html_out += '        </ul>\n';
      html_out += '      </li>\n';
    }else if (key == "actions"){
      html_out += '    <li><span class="caret" onclick="flipCaret(this)">' + key + '</span>\n';
      html_out += '      <ul class="nested">\n';
      for (const action of scene[key]){
        html_out += '        <li data-scene-id="' + scene.id + '" data-action-index="' + scene[key].indexOf(action) + '" onclick="edit_scene_action(this)">' + action['name'] + '</li>';
      }
      html_out += '        </ul>\n';
      html_out += '      </li>\n';
    }
  }
  html_out += '</ul>\n'
  sceneview.innerHTML = html_out;
}

function edit_thing(item){
  thing_id = item.getAttribute('data-thing-id');
  console.log(game['things'][thing_id]);
}

function edit_scene_action(item){
  scene_id = item.getAttribute('data-scene-id');
  action_index = item.getAttribute('data-action-index');
  console.log(game['scenes'][scene_id]['actions'][action_index]);

}

function edit_scene_item(item){
  scene_id = item.getAttribute('data-scene-id');
  key = item.getAttribute('data-key');
  console.log(game['scenes'][scene_id][key]);
}

function edit_game_item(arg_string){
  var args = arg_string.split(",");
  if (args.length == 2){
    console.log(game[args[0]][args[1]]);
    if (args[0] == 'scenes'){
      update_sceneview(args[1]);
    }
  }else{
    console.log(game[args[0]]);
  }
}