let term_table, perf_table, pile_table;
let terms_array;
let term_objects = {};
let piles_array;
let pile_objects = {};
let perfs_array;
let perf_objects = {};

let perf_lines = [];
let pile_lines = [];
let term_lines = [];
let clicked_objects = [];
let term_strings = [];
let term_string = "";

let default_settings;
let sound;

function preload() {
  term_table = loadTable("data/term_data1.csv", 'csv', 'header');
  perf_table = loadTable("data/perf_data1.csv", 'csv', 'header');
  pile_table = loadTable("data/pile_data1.csv", 'csv', 'header');
  sound = loadSound('excerpts/asd.mp3');
}

function setup() {

  default_settings_dark = {
    perf_line:color(120,140),
    perf_background:color(200,50),
    //pile_line:color(183, 172, 68, 230),
    //term_line: color(255,170,0,230),
    background: color(0),
    
    group1_from:color(23, 244, 120, 100),
    group1_to:color(23, 23, 244, 100),
    group2_from:color(218, 0, 32, 150),
    group2_to:color(72, 218, 9, 150),

    text_normal:color(220,160),
    text_normal_p:color(210,235),
    text_highlight:color(220,255),
  
    height:800,
    width:1500,
    font_size: 10,

  };

  default_settings_light = {
    perf_line:color(120,140),
    perf_background:color(200,50),
    //pile_line:color(183, 172, 68, 230),
    //term_line: color(255,170,0,230),
    background: color(255),
    
    group1_from:color(23, 244, 120, 100),
    group1_to:color(23, 23, 244, 100),
    group2_from:color(218, 0, 32, 150),
    group2_to:color(72, 218, 9, 150),

    text_normal:color(220,160),
    text_normal_p:color(210,235),
    text_highlight:color(220,255),
  
    height:800,
    width:1500,
    font_size: 10,

  };

  default_settings = default_settings_dark;
  let initial_width = max(1520, windowWidth-40);
  let max_height = initial_width - 920;
  default_settings.height = min(max(800, windowHeight ),max_height);
  default_settings.width = default_settings.height+920
  default_settings.font_size = default_settings.height /45 /5 *3;

  textFont('Helvetica');
  
  //select('#text_container').style("left", ((default_settings.height+900)/2).toString()+"px");
  select('#text_container').style("top", (default_settings.height+20+50).toString()+"px");
  
  if (initial_width == (windowWidth-40)) {  //(default_settings.height+900+20)/2 > 1500/2
    select('#canvas_container').style("width", ((default_settings.width)).toString()+"px");
    select('#canvas_container').style("margin-left", "-"+((default_settings.width)/2).toString()+"px");

  } else {
    select('#canvas_container').style("width", (default_settings.width).toString()+"px");
    select('#canvas_container').style("margin-left", "-"+(windowWidth/2-10).toString()+"px");

  }
  

  let canvas = createCanvas(default_settings.width, default_settings.height +20 );
  canvas.parent("canvas_container")
  canvas.mousePressed(checkclick);
  create_objects();
  noLoop();
  noStroke();
  
}

function draw() {
  background(default_settings.background);
  translate(10,10);
  push();
  stroke(default_settings.perf_line)
  strokeWeight(2)
  line(-1,-1,-1, default_settings.height+1);
  line(default_settings.height+1+900,-1,default_settings.height+1+900, default_settings.height+1);
  line(-1,-1,default_settings.height+1+900, -1);
  line(-1, default_settings.height+1,default_settings.height+1+900, default_settings.height+1);
  pop();

  push();
  fill(20);
  circle(default_settings.height/2+400,default_settings.height/2, default_settings.height-4 )
  pop();
  for (var key in pile_objects) {
    pile_objects[key].display();
    }
  for (var key in perf_objects) {
    perf_objects[key].display();
    }

  for (var key in pile_lines) {
    pile_lines[key].display();
      }
  for (var key in perf_lines) {
    perf_lines[key].display();
      }
  for (var key in term_lines) {
    term_lines[key].display();
      }

  for (var key in term_objects) {
    term_objects[key].display();
    }
  for (var key in term_objects) {
    term_objects[key].display_text();
    }


  push();
  
  fill(default_settings.text_highlight);
  textSize(12);  
  if (term_strings.length > 0){
    text("Currently highlighted terms:", 230, default_settings.height/2-(term_strings.length/2-1)*12-15*2);
  }
  text(term_string, 230, default_settings.height/2-(term_strings.length/2-1)*12-15);
 
  textSize(10);
  for (var key in term_strings) {
    text(term_strings[key], 230, default_settings.height/2-(term_strings.length/2-1)*12+key*12);
    }
  
  pop();


}




function create_objects() {
  // find the pile neighbors for each term
  terms_array = term_table.rows.map(parse_term_row);
  terms_array.map((term_object)=> {term_objects[term_object.id]=term_object;})
  piles_array = pile_table.rows.map(parse_pile_row);
  piles_array.map((pile_object)=> {pile_objects[pile_object.id]=pile_object;})
  perfs_array = perf_table.rows.map(parse_perf_row);
  perfs_array.map((perf_object)=> {perf_objects[perf_object.music_id]=perf_object;})
}


function parse_term_row(r){
  let row = r.arr;
  return new Term(parseFloat(row[6]), parseFloat(row[7]),
            str(row[4]), parseInt(row[5]),
            parseInt(row[0]), parseInt(row[1]),
            str(row[2]), str(row[3]),
            JSON.parse(row[8]),
            JSON.parse(row[9]),
            JSON.parse(row[10]),
              )
}

function parse_pile_row(r){
  // pile_idx,pile_name,pile_group,within_group_idx,term_idx
  let row = r.arr;
  return new Pile(str(row[1]), parseInt(row[0]),
            parseInt(row[2]), parseInt(row[3]),
            JSON.parse(row[4])
              )
}

function parse_perf_row(r){
  // perf_idx,within_perf_idx,perf_name,term_idx
  let row = r.arr;
  return new Performance(str(row[2]), parseInt(row[0]),
            parseInt(row[1]),
            JSON.parse(row[3])
              )
}



function create_pile_lines_from_pile(pile_id, term_idx){
  pile_lines=pile_lines.concat(term_idx.map((term_id)=>{term_objects[term_id].clicked = true;
    return new Connection(pile_objects[pile_id].x_conn,
                          pile_objects[pile_id].y_conn,
                          term_objects[term_id].x,
                          term_objects[term_id].y,
                          pile_objects[pile_id].color)}))
}

function create_pile_lines_from_term(pile_idx, term_id){
  pile_lines=pile_lines.concat(pile_idx.map((pile_id)=>{pile_objects[pile_id].clicked = true;
    return new Connection(pile_objects[pile_id].x_conn,
                          pile_objects[pile_id].y_conn,
                          term_objects[term_id].x,
                          term_objects[term_id].y,
                          pile_objects[pile_id].color)}))
}

function create_perf_lines_from_term(term_id, perf_idx){
  perf_lines=perf_lines.concat(perf_idx.map((perf_id)=>{perf_objects[perf_id].clicked = true;
    return new Connection(perf_objects[perf_id].x_conn,
                          perf_objects[perf_id].y_conn,
                          term_objects[term_id].x,
                          term_objects[term_id].y,
                          default_settings.perf_line)}))
    }

function create_perf_lines_from_perf(term_idx, perf_id){
  perf_lines=perf_lines.concat(term_idx.map((term_id)=>{term_objects[term_id].clicked = true;
    return new Connection(perf_objects[perf_id].x_conn,
                          perf_objects[perf_id].y_conn,
                          term_objects[term_id].x,
                          term_objects[term_id].y,
                          default_settings.perf_line)}))
}

function create_term_lines_from_term(term_id_orig, term_idx, col){
  //console.log("create term lines", term_id_orig, term_idx);
  term_lines= term_lines.concat(term_idx.map((term_id)=>{ term_objects[term_id].clicked = true;
    return new Connection(term_objects[term_id_orig].x,
                          term_objects[term_id_orig].y,
                          term_objects[term_id].x,
                          term_objects[term_id].y,
                          col)}))
}







class Connection {
  constructor(x1,y1, x2,y2,colorinput) {
    this.x1 = x1;
    this.y1 = y1; 
    this.x2 = x2;
    this.y2 = y2;
    this.color = color(...colorinput.levels.slice(0,3), 255);;
  }
  display () {
    push();
    fill(this.color);
    stroke(this.color);
    strokeWeight(1.5);
    line(this.x1, this.y1, this.x2, this.y2);
    pop();
  }
}






class Term {
  constructor(x,y,name, id, id_pile1, id_pile2, name_pile1, name_pile2, neighbors1, neighbors2, performances) {
    this.x = x*default_settings.height/2 + default_settings.height/2 + 400;
    this.y = y*default_settings.height/2 + default_settings.height/2;
    this.name = name.split("_").join(" ");
    this.id = id;
    this.id_pile1 = id_pile1;
    this.id_pile2 = id_pile2;
    this.ids_pile = [id_pile1, id_pile2];
    this.name_pile1 = name_pile1.split("_").join(" ");
    this.name_pile2 = name_pile2.split("_").join(" ");
    this.neighbors1 = neighbors1;
    this.neighbors2 = neighbors2;
    this.perf_idx = performances;
    this.clicked = false;
  }

  display() {
    let diameter = 20;
    let bcolor1 = pile_objects[this.id_pile1].color;
    let bcolor2 = pile_objects[this.id_pile2].color;
    if (this.clicked) {
      diameter = 34;
      bcolor1 = color(...bcolor1.levels.slice(0,3), 255);
      bcolor2 = color(...bcolor2.levels.slice(0,3), 255);

    }
    push();
    //stroke(pile_objects[this.id_pile1].color);
    fill(bcolor1);
    circle(this.x, this.y, diameter);
    pop();
    push();
    //stroke(pile_objects[this.id_pile2].color);
    fill(bcolor2);
    circle(this.x, this.y, diameter/2);
    pop();


  }

  display_text() {
    push();
    let fontsize = default_settings.font_size;
    let text_color = default_settings.text_normal;
    let text_string = this.name;
    noStroke();
    
    if (this.clicked) {
      fontsize = fontsize + 2;
      text_color = default_settings.text_highlight;//color(255,255);//
      text_string = text_string.toUpperCase();
      strokeWeight(2);
      stroke(40);
      term_strings.push(this.name.concat(" --- (pile 1: ", this.name_pile1, ", pile 2: ", this.name_pile2, ")"));
    }
    


    //stroke(color(0));
    
    textSize(fontsize);
    fill(text_color);
    
    
    text(text_string, this.x, this.y);
    pop();
  }


  tryclick() {
    this.clicked = false;
    if(Math.sqrt((mouseX-this.x)**2 + (mouseY-this.y)**2)<= 10){
  
     clicked_objects.push(this);
     this.clicked = true;
     term_string = "Clicked term: ".concat(this.name," (pile 1: ", this.name_pile1, ", pile 2: ", this.name_pile2, ")");
    }
  }
  click() {
    //console.log("clicked term", this.name)
    create_perf_lines_from_term(this.id, this.perf_idx);
    create_pile_lines_from_term(this.ids_pile, this.id);
    create_term_lines_from_term(this.id, this.neighbors1, pile_objects[this.id_pile1].color);
    create_term_lines_from_term(this.id, this.neighbors2, pile_objects[this.id_pile2].color);

    

    }
}








class Pile {
  constructor(name, id, group, within_group_id, term_idx) {

    this.name = name.split("_").join(" ");
    this.id = id;
    this.group = group;
    this.within_group_id = within_group_id;
    this.term_idx = term_idx;

    this.x = 10;
    this.yl = default_settings.height /45;
    this.y = this.compute_y();
    this.xl = 200;
    this.x_conn = 220;
    this.y_conn = this.y + 0.5*this.yl;
    
    this.clicked = false;
    // piles are colored according to gradient per group
    this.color = this.compute_color();
  }

  compute_y () {
    let offset = 0;
    
    if (this.group == 2) {
      offset = this.yl * 26;
    }
    let y = (this.within_group_id) * this.yl + offset;
    return y
  }
  compute_color() {
    if (this.group == 2) {
      colorMode(RGB); // Try changing to HSB.
      return lerpColor(default_settings.group2_from, default_settings.group2_to, this.within_group_id/18)
    }
    else if (this.group == 1) {
      colorMode(RGB); // Try changing to HSB.
      return lerpColor(default_settings.group1_from, default_settings.group1_to, this.within_group_id/24)
    }
  }



  display() {
    let x_extra = 0;
    let bcolor = this.color;
    let font_size = default_settings.font_size;
    let text_color = default_settings.text_normal_p;
    if (this.clicked) {
      x_extra = 10;
      bcolor = color(...this.color.levels.slice(0,3), 255);
      font_size = default_settings.font_size + 2;;
      text_color = default_settings.text_highlight;
    }

    push();
    fill(bcolor);
    rect(this.x-x_extra, this.y, this.xl+2*x_extra, this.yl-1, 10);
    pop();

    push();
    textSize(font_size);
    fill(text_color);
    text(this.name, this.x+50, this.y+0.8*this.yl);
    pop();
  
  }

  tryclick() {
    this.clicked = false;
    if(mouseX>=this.x && mouseX<this.x+this.xl && mouseY>=this.y && mouseY<this.y+this.yl){
     //console.log("clicked pile", this.name);
     clicked_objects.push(this);
     this.clicked = true;
    }
  }
  click() {
     create_pile_lines_from_pile(this.id, this.term_idx);
     for(var i = 0; i < this.term_idx.length; i++){
       let connected_term = terms_array[this.term_idx[i]];
       create_perf_lines_from_term(connected_term.id, connected_term.perf_idx);
     }
    }
}










class Performance {
  constructor(name, music_id, within_id,term_idx) {
    //let namesplit = name.split("_");
    //namesplit = namesplit.map((word)=>{return word.charAt(0).toUpperCase()+word.slice(1,word.length);})
    this.name = this.format_name(name)// namesplit.join(" ");
    this.music_id = music_id;
    this.within_id = within_id;
    this.term_idx = term_idx;

    this.x = default_settings.height+400+50;//1090;
    this.yl = default_settings.height/45;
    this.y = this.compute_y();
    this.xl = 440;
    this.x_conn = this.x-10;
    this.y_conn = this.y + 0.5*this.yl;

    this.color = default_settings.perf_background;
    this.clicked = false;
    
    
    

  }

  format_name (name) {
    let replace_strings = {
      "Bach": "J.S.Bach BWV 846 Prelude",
      "Beethoven": "Beethoven Op. 27 No. 2 1st mvt",
      "Brahms": "Brahms Op. 119 No. 2",
      "Liszt": "Liszt S. 216a",
      "Arabeske": "R. Schumann Op. 18",
      "Kreisleriana": "R. Schumann Op. 16 No. 3",
      "Mozart": "Mozart K. 545 2nd mvt",
      "Excerpt1": "(1)",
      "Excerpt2": "(2)"
    }
    let namesplit = name.split("_");
    namesplit = namesplit.map((word)=>{return word.charAt(0).toUpperCase()+word.slice(1,word.length);})
    namesplit = namesplit.filter(word=>word.indexOf("Schumann") < 0 );
    namesplit = namesplit.map((word)=>{
      if (replace_strings.hasOwnProperty(word)) {
        return replace_strings[word]
      }
      else {
        return word
      }
    }
    );
    return namesplit.join(" ");
  }

  compute_y () {
    let offset = 0;
    let y = (this.within_id) * this.yl + offset;
    return y
  }


  display() {
    let x_extra = 0;
    let bcolor = this.color;
    let font_size = default_settings.font_size;
    let text_color = default_settings.text_normal_p;
    if (this.clicked) {
      x_extra = 10;
      bcolor = color(...bcolor.levels.slice(0,3), 100);
      font_size = default_settings.font_size + 2;;
      text_color = default_settings.text_highlight;
    }


    push();
    fill(bcolor);
    rect(this.x-x_extra, this.y, this.xl+2*x_extra, this.yl-1, 10);
    pop();

    push();
    textSize(font_size);
    fill(text_color);
    text(this.name, this.x+50, this.y+0.8*this.yl);
    pop();
  }
  play_excerpt() {
    if (sound.isPlaying()) {
      sound.stop();
    } else {
      sound.play();
    }
  }

  tryclick() {
    this.clicked = false;
    if(mouseX>=this.x && mouseX<this.x+this.xl && mouseY>=this.y && mouseY<this.y+this.yl){
     //console.log("clicked performance", this.name);
     clicked_objects.push(this);
     this.clicked = true;
     this.play_excerpt();
    }
  }
  click() {
    create_perf_lines_from_perf(this.term_idx, this.music_id);
    for(var i = 0; i < this.term_idx.length; i++){
      let connected_term = terms_array[this.term_idx[i]];
      create_pile_lines_from_term(connected_term.ids_pile, connected_term.id);
    }
     

    }
}













function checkclick() {
  if (mouseButton === LEFT) {
    perf_lines = [];
    pile_lines = [];
    term_lines = [];
    clicked_objects = [];
    term_strings = [];
    term_string = "";
    for(var i = 0; i < piles_array.length; i++){
      piles_array[i].tryclick();
    }
    for(var i = 0; i < perfs_array.length; i++){
      perfs_array[i].tryclick();
    }
    for(var i = 0; i < terms_array.length; i++){
      terms_array[i].tryclick();
    }
    for(var i = 0; i < clicked_objects.length; i++){
      clicked_objects[i].click();

    }
    redraw();

  
  
  }
  else if (mouseButton === RIGHT) {
    perf_lines = [];
    pile_lines = [];
    term_lines = [];
    clicked_objects = [];
    } 
  }
