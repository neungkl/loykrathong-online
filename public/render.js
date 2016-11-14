var render = (function() {

  var SIZE = 20;

  var IDLE = 0;
  var FADE_OUT = 1;

  var krathong = [];
  var data = [];
  var text = [];

  var width = 800;
  var height = 600;

  function onKrathongClick() {
    var $this = this;
    var i = this.id;
    $.ajax({
      url: './attack',
      type: 'post',
      data: {
        id: data[i].kid
      },
      dataType: 'json',
      success: function(res) {
        if(res.success == 'yes') {
          if(res.isDown) {
            myScore += 10;
            data[i].state = FADE_OUT;
            $this.tint = 0xff0000;
          } else {
            $this.tint = 0xffffff;
          }
          myScore += 2;
        } else if(res.msg == "you're die") {
          alertify.alert('กระทงคุณล่มไปแล้ว ไม่มีพลังโจมตีต่อ');
        } else if(res.msg == 'yourself') {
          alertify.alert('ไม่สามารถโจมตีตัวเองได้');
        } else {
          alertify.alert('โจมตีไม่ได้ T_T');
        }
      },
      error: function(err) {
        alertify.alert('โจมตีไม่ได้ T_T');
      }
    });
  }

  function initRender(w, h) {

    width = w;
    height = h;

    var renderer = PIXI.autoDetectRenderer(width, height,{backgroundColor : 0x333333});
    document.getElementById('render').appendChild(renderer.view);

    // create the root of the scene graph
    var stage = new PIXI.Container();

    // create a texture from an image path
    var texture = PIXI.Texture.fromImage('./images/krathong.png');

    // create a new Sprite using the textures

    for(var i=0; i<SIZE; i++) {

      text[i] = new PIXI.Text(
        'This is a pixi text',
        {fontFamily : 'Arial', fontSize: 32, fill : 0xffffff, dropShadow:true, dropShadowColor:0x333333, align : 'left'}
      );

      krathong[i] = new PIXI.Sprite(texture);
      krathong[i].anchor.x = 0.5;
      krathong[i].anchor.y = 0.5;

      var x = Math.random() * width;
      var y = Math.random() * height;

      krathong[i].position.x = x;
      krathong[i].position.y = y;
      krathong[i].id = i;

      text[i].position.x = x;
      text[i].position.y = y;
      text[i].anchor.x = 0.5;

      krathong[i].visible = false;
      text[i].visible = false;

      var scale = Math.random() * 0.3 + 0.1;
      krathong[i].scale.set(scale);
      text[i].scale.set(Math.max(0.35, scale * 1.5));

      krathong[i].interactive = true;

      krathong[i].on('mousedown', onKrathongClick);
      krathong[i].on('touchstart', onKrathongClick);

      data[i] = {
        x: x,
        y: y,
        kid: 0,
        state: IDLE,
        swing: Math.random() * 1,
        swingTensity: Math.random() * 5 + 3,
        show: false
      };

      stage.addChild(krathong[i]);
      stage.addChild(text[i]);
    }

    var time = 0;

    // start animating
    animate();
    function animate() {
        requestAnimationFrame(animate);

        // just for fun, let's rotate mr rabbit a little
        for(var i=0; i<SIZE; i++) {
          if(data[i].show) {

            if(data[i].state == FADE_OUT) {
              krathong[i].alpha = Math.max(0, krathong[i].alpha - 0.05);
              text[i].alpha = Math.max(0, text[i].alpha - 0.05);

              if(krathong[i].alpha == 0) {
                data[i].state = IDLE;
                data[i].show = false;
              }
            }

            krathong[i].position.y = (data[i].y + Math.sin(time + data[i].swing) * data[i].swingTensity);
            text[i].position.y = (data[i].y + 10 + Math.sin(time + data[i].swing) * data[i].swingTensity);

            krathong[i].visible = true;
            text[i].visible = true;
          } else {
            krathong[i].visible = false;
            text[i].visible = false;
          }
        }
        time += 0.1;

        // render the container
        renderer.render(stage);
    }
  }

  function spawnKrathong(name, kid) {
    for(var i=0; i<SIZE; i++) {
      if(data[i].show) continue;

      var x = Math.random() * width;
      var y = Math.random() * height;

      krathong[i].position.x = x;
      krathong[i].position.y = y;
      krathong[i].id = i;

      text[i].position.x = x;
      text[i].position.y = y;
      text[i].anchor.x = 0.5;

      var scale = Math.random() * 0.3 + 0.1;
      krathong[i].scale.set(scale);
      text[i].scale.set(Math.max(0.35, scale * 1.5));

      krathong[i].alpha = 1;
      text[i].alpha = 1;

      text[i].text = name;

      data[i].kid = kid;

      data[i].show = true;
      data[i].state = IDLE;

      return true;
    }

    return false;
  }

  return {
    initRender: initRender,
    spawnKrathong: spawnKrathong
  };

})();
