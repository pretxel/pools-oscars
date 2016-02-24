Categories = new Meteor.Collection("categories");
Predictions = new Meteor.Collection("predictions");


var totalCategories;
var categoriesChecked = 0;
var collectionCat = {};

$(document).ready(function(){
    $('.modal-trigger').leanModal();
    $('#modal1').openModal();

  });

var pos_scroll = 0;
$(document).on('click.card', '.card', function (e) {
  if ($(this).find('> .card-reveal').length) {
    if ($(e.target).is($('.card-reveal .card-title')) || $(e.target).is($('.card-reveal .card-title i')) || $(e.target).is($('.selectNom .summary')) ) {
          // Make Reveal animate down and display none


          if ($(e.target).is($('.selectNom .summary'))){
              $(this).find('.corner').removeClass('corner');
              var nameCategory = $(this).find(".collection-nominate:first-child input[type=radio]")[0].name;
              if (collectionCat[nameCategory] == undefined){
                collectionCat[nameCategory] = 1;
                categoriesChecked++;
                showStatus();
              }

              if (categoriesChecked == totalCategories){
                // Show button
                $("#mainButton").removeClass("disabled");
                $("#mainButton").removeAttr("disabled");
                // $('.modal-trigger').leanModal();
                $('#modal2').openModal();
              }

          }

          // $(this).height(<300);
          $(this).css("height","100%");
          $(this).css("position","relative");
          $(this).css("bottom","0px");
          $(this).css("top","0px");
          $(this).css("right","0px");
          $(this).css("left","0px");
          $(this).css("z-index","1");
          $(window).scrollTop(pos_scroll)



        }
        else if ($(e.target).is($('.card .activator')) ||
         $(e.target).is($('.card .activator i')) ) {
          pos_scroll = $(window).scrollTop();
        $(this).height($(window).height() - 100);
        $(this).css("position","fixed");
        $(this).css("bottom","0px");
        $(this).css("top","64px");
        $(this).css("right","5%");
        $(this).css("left","5%");
        $(this).css("z-index","999");

        $(window).scrollTop(0);
        // disableScroll();
      }
    }

    $('.card-reveal').closest('.card').css('overflow', 'hidden');

  });

$(document).on('click.card', '.card', function (e) {
      if ($(this).find('> .card-reveal').length) {
        if ($(e.target).is($('.card-reveal .card-title')) || $(e.target).is($('.card-reveal .card-title i')) || $(e.target).is($('.selectNom .summary')) ) {
          // Make Reveal animate down and display none
          $(this).find('.card-reveal').velocity(
            {translateY: 0}, {
              duration: 225,
              queue: false,
              easing: 'easeInOutQuad',
              complete: function() { $(this).css({ display: 'none'}); }
            }
          );
        }
        else if ($(e.target).is($('.card .activator')) ||
                 $(e.target).is($('.card .activator i')) ) {
          $(e.target).closest('.card').css('overflow', 'hidden');
          $(this).find('.card-reveal').css({ display: 'block'}).velocity("stop", false).velocity({translateY: '-100%'}, {duration: 300, queue: false, easing: 'easeInOutQuad'});
        }
      }

      $('.card-reveal').closest('.card').css('overflow', 'hidden');

});

function disableScroll() {
  if (window.addEventListener) // older FF
      window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove  = preventDefault; // mobile
  document.onkeydown  = preventDefaultForScrollKeys;
}

function showStatus(){
  console.log("Total Categories " + totalCategories);
  console.log("Categories Checked " + categoriesChecked);
}


$(document).on('click','#resetButton', function(){

  $('.backLoader').show();
  var opt = {category: 1, prediction: 1};
  resetDB(opt);

});

$(document).on('click','#mainButton', function(){
  $('#modal2').openModal();
 
});




function resetDB(opt){
  Meteor.call('resetDB', opt , function (err, result) {
    console.log(result);
    $('.backLoader').hide();
  });
}


Meteor.call('getCategories', function (err, result) {
  if (err)
    console.log(err);
  else
    // console.log(result.length);
    totalCategories = result.length;
    Session.set('myMethodResult', result);
  });


Meteor.call('getPredictions', function (err, result) {
  if (err)
    console.log(err);
  else
    // console.log(result.length);
    Session.set('myMethodResultPred', result);
  });


Template.body.helpers({
  categories_obj: function(){
    return Session.get('myMethodResult');
  }
});

Template.body.helpers({
  prediction_obj: function(){
    return Session.get('myMethodResultPred');
  }
});


Template.body.events({
  "submit .newPrediction" : function (event){
    event.preventDefault();
    $('.backLoader').show();
    var name = event.target.name.value;

    var categories = [];
    var nameCategory = "";
    var listNominates = $(".list_nominates li input");
    $(listNominates).each(function(index, element){

      if (nameCategory != $(element).attr("name")){
        nameCategory = $(element).attr("name");
        var selectedId = $('input[name='+nameCategory+']:checked').attr("data");

        var category = {
          category: nameCategory,
          selectedId: selectedId
        }

        categories.push(category);
      }

    });

var prediction = {
      name: name,
      categories: categories,
      createdAt: new Date()
    };

    if (name.trim() == ""){
      console.log("No tiene nombre");
      Materialize.toast('Name required', 4000);
      $('.backLoader').hide();
      $('#modal2').openModal();
    }else{
      Meteor.call('insertPrediction', prediction , function (err, result) {
      console.log(result);
      if (result == "exist_name"){
        Materialize.toast('Name already exists', 4000);
        $('.backLoader').hide();
        $('#modal2').openModal();
      }else if(result === "Success"){
        $('.backLoader').hide();
        $('#modal3').openModal();
      }else if (result === "Data not valid"){
        Materialize.toast(result, 4000);
        $('.backLoader').hide();
        $('#modal2').openModal();
      }
    });
    }


    // location.reload();

  }
});