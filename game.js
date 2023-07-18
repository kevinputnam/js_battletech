class Game {
  constructor(gameData){
    this.name = "";
    this.author = "";
    this.first_scene = 0;
    this.player = {};
    this.scenes = {};
    this.start_player_pos = [];
    this.variables = {};
    this.actions = [];
    this.things = {};

    for (const [key,value] of Object.entries(gameData)){
      this[key] = value;
    }
    this.attributes = {
      "gamename": ["string"],
      "author": ["string"],
      "first_scene": ["integer"],
      "start_player_pos":["list","integer"],
      "variables":["dictionary","variable"],
      "actions":["list","action"],
      "player":["thing"],
      "scenes":["dictionary","scene"],
      "things":["dictionary","thing"]
    }
  }
}