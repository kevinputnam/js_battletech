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
  treeview_html = '<ul id="game-treeview" class="treeview">\n';
  treeview_html += '  <li><span class="caret">Game</span>\n';
  treeview_html += '    <ul class="nested">\n';
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
  treeview_html += '  </li>';
  treeview_html += '</ul>';
  var gameview = document.getElementById('gamedata');
  gameview.innerHTML = treeview_html;
  createTreeViewToggles();
}

function edit_game_item(arg_string){
  var args = arg_string.split(",");
  if (args.length == 2){
    console.log(game[args[0]][args[1]]);
  }else{
    console.log(game[args[0]]);
  }
}