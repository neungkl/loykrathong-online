var otherData = [];
var spawnList = [];

var myScore = -1;
var isDie = false;

function initStyle() {
  $('.game').css('height', $('html').height() - $('.header').outerHeight() - $('.footer').outerHeight());
}

function fetchLog() {
  $.ajax({
    url: './log',
    dataType: 'json',
    success: function(res) {

      var txt = res.splice(res.length - 10).map(function(x) {
        x = x.message;

        if(x.indexOf(' born.') !== -1) {
          x = x.replace(' born.', '');
          return '<div class="pure-u-1-1">' +
          '<span>กระทงของ ' + x + ' </span><span class="pass">สร้างแล้ว</span>' +
          '</div>';
        } else {
          x = x.replace(' has drown.', '');
          return '<div class="pure-u-1-1">' +
          '<span>กระทงของ ' + x + ' </span><span class="fail">จมแล้ว</span>' +
          '</div>';
        }
      }).join('');

      if(txt == '') txt = '<div class="pure-u-1-1" style="color:#888;">ยังไม่มีกระทงใดๆเลย ฮืออ</div>';

      $('.game .report .pure-g').html(txt);
    },
    error: function(err) {
      console.error(err);
      return alertify.alert('ไม่สามารถดึงข้อมูลได้ กรุณารีเฟรชหน้านี้ใหม่');
    }
  })
}

function fetchData() {

  if(otherData.length >= 20) return ;

  $.ajax({
    url: './data',
    dataType: 'json',
    success: function(res) {
      if(res.success == "yes") {
        for(i in res.data) {
          var check = true;
          for(j in spawnList)
            if(spawnList[j] == res.data[i].id) check = false;

          if(check) {
            spawnList.push(res.data[i].id);
            otherData.push(res.data[i]);
          }
        }
      }
    }
  })
}

function fetchMe() {
  $.ajax({
    url: './me',
    dataType: 'json',
    success: function(res) {
      if(res.success) {
        if(isDie) return ;
        if(res.attack <= res.life) {
          $('.footer .enter-name').hide();
          $('.footer .scoring').show();
          $('.footer .scoring .btn').hide();

          isDie = false;
          if(myScore == -1) myScore = 10;
          $('.footer .scoring span').text('กระทงคุณลอยได้ไกล ' + myScore + ' เมตร (เหลือชีวิตอีก ' + (res.life - res.attack) + ' ชีวิต)');
        } else {
          if(myScore != -1) {
            if(!isDie) share(myScore);
            $('.footer .scoring span').text('กระทงคุณจมแล้ว ด้วยระยะทาง ' + myScore + ' เมตร');
            $('.footer .scoring .btn').show();

            isDie = true;
          }
        }
      } else {
        myScore = -1;
      }
    }
  })
}

function add() {
  var name = $('#name').val();
  name = $.trim(name);

  if(name.length === 0 || name.length > 50) {
    return alertify.alert('กรุณากรอกข้อมูล และความยาวต่ำกว่า 50 อักษร');
  }

  $.ajax({
    url: './add',
    type: 'post',
    dataType: 'json',
    data: {
      name: name
    },
    success: function(res) {
      if(res.success != 'yes') {
        if(res.msg === 'already created') {
          alertify.alert('คุณเคยสร้างไปแล้ว');
        } else {
          alertify.alert('ไม่สามารถเพิ่มได้ กรุณาลองใหม่อีกครั้ง');
        }
      } else {
        alertify.alert('สร้างกระทงของคุณเสร็จแล้ว คุณสามารถกดที่กระทงของเพื่อนเพื่อคว่ำกระทงเพื่อนได้เลยนะ :P');
        isDie = false;
        myScore = 10;
      }
    },
    error: function(err) {
      console.error(err);
      alertify.alert('ไม่สามารถเพิ่มได้ กรุณาลองใหม่อีกครั้ง');
    }
  })
}

function spawn() {
  if(otherData.length > 0) {
    render.spawnKrathong(otherData[0].name, otherData[0].id);
    otherData.shift();
  }
}

function share(score) {

  $('.share .score').text(score);
  $('.share').show();

  $(window).one('click', function() {
    $('.share').hide();
  });

  $('.share .ok').one('click', function() {
    $('.share').hide();
  });
}

$(function() {
  initStyle();

  setInterval(fetchLog, 4000);
  setInterval(fetchMe, 1000);
  setInterval(fetchData, 5000);
  setInterval(spawn, 500);

  setInterval(function() {
    if(myScore != -1 && !isDie) {
      myScore++;
    }
  }, 1000);

  fetchData();
  fetchLog();
  fetchMe();
  spawn();

  $('.footer .scoring .btn').click(function() {
    myScore = -1;
    $('.footer .enter-name').show();
    $('.footer .scoring').hide();
  });

  render.initRender($('#render').width(), $('#render').height());

  $('.footer .add-btn').click(add);
});
