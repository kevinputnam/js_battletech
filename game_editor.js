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

function update_gameview(){
  var gametitle = document.getElementById('gametitle');
  gametitle.innerHTML = game.name;
  var treeview_html = '    <ul>\n';
  for (const [key,value] of Object.entries(game)){
    var type_string = Object.prototype.toString.call(value);
    if (type_string.includes("Object")){
      if (key == 'attributes' || key == 'things'){
        continue;
      }
      treeview_html += '      <li><span class="caret">' + key + '</span>\n';
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
  createTreeViewToggles();
}

function update_sceneview(scene_id){
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
      html_out += html_basic + key + ": " + value + '</li>\n';
    }else if (key == "name"){
      html_out += html_basic + key + ": " + value + '</li>\n';
    }else if (key == "collisions"){
      html_out += html_basic + key + ": [...]";
    }else if (key == "things"){
      html_out += '    <li><span class="caret">' + key + '</span>\n';
      html_out += '      <ul class="nested">\n';
      for (const thing_id of scene[key]){
        html_out += '        <li data-thing-id="' + thing_id + '" onclick="edit_thing(this)">' + game['things'][thing_id]['name'] + '</li>';
      }
      html_out += '        </ul>\n';
      html_out += '      </li>\n';
    }else if (key == "actions"){
      html_out += '    <li><span class="caret">' + key + '</span>\n';
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
  createTreeViewToggles();
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