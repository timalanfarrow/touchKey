const tk = (function( $onScreenKeyboard ) {
  let onscreenkeyboard = function main( $onScreenKeyboard ) {
    let keyboard;
    let maxLength;
    
    if( $onScreenKeyboard.length ) {
      console.log("Keyboard required");
    } else {
      return;
    }

    console.log( keyboard );

    var keyboards = {
      "number" : {
        "default" : [
          {
            "characters": "123"
          },
          {
            "characters": "456"
          },
          {
            "characters": "789"
          },
          {
            "characters": "[simpleSubmit] 0 [simpleBackSpace]"
          }
        ]
      },
      "text" : {
        "default" : [
          {
            "characters": "[buffer] 1234567890- [buffer]",
          },
          {
            "characters": "[buffer] qwertyuiop [backspace]"
          },
          {
            "characters": "[caps] asdfghjkl [submit]"
          },
          {
            "characters": "[shift] zxcvbnm. [shift]"
          },
          {
            "keyClass"  : "spacebar",
            "characters": "[space]"
          }
        ],
        "shift" : [
          {
            "characters": "[buffer] !@#$%^&*()_ [buffer]",
          },
          {
            "characters": "[buffer] QWERTYUIOP [backspace]"
          },
          {
            "characters": "[caps] ASDFGHJKL [submit]"
          },
          {
            "characters": "[shift] ZXCVBNM, [shift]"
          },
          {
            "characters": "[space]"
          }
        ]
      }
    };

    const constructKeyboard = function buildKeyBoardFromJSONRows( keyboard ) {

      const keyboardMap = {
        "default": "primary",
        "numbers": "primary",
        "shift"  : "secondary",
      };

      let $keyboard = $onScreenKeyboard;
      $keyboard.html('');

      for( n in keyboard ) {
        console.log( n );
        let type = keyboardMap[n];
        let rows = keyboard[n];
        let keyboardClass = type + "-keyboard";
        $keyboard.append("<div class='" + keyboardClass + "'></div>")

        let $curKeyboard = $("." + keyboardClass );
        for( i in rows ) {
          var row = rows[i];
          var keyClass = row.keyClass == undefined ? "" : row.keyClass;

          $curKeyboard.append("<div class='keyRow active'></div>");
          var $curRow = $(".keyRow.active");

          var groups = row.characters.split(" ");
          var characters = [];

          for( ind in groups ) {
            var str = groups[ind];
            if( str[0] == "[") {
              characters.push( str.substr( 1, str.length - 2 ) );
            } else {
              characters = characters.concat( str.split("") );
            }
          }

          var keyClasses = {
            "buffer"          : "buffer special",
            "simpleBackSpace" : "simple-back-space",
            "simpleSubmit"    : "simple-submit",
            "shift"           : "shift-key special",
            "space"           : "spacebar-key special",
            "backspace"       : "backspace-key special",
            "caps"            : "caps-key special",
            "next"            : "next-key special",
            "submit"          : "submit special",
          };

          for( j in characters ) {
            let keyClass = ' simple';
            let character = characters[j];
            if( ( character.length > 1 ) && keyClasses.hasOwnProperty(character) )
              keyClass = keyClasses[ character ];
            $curRow.append("<div class='key " + keyClass + "'>" + character + "</div>");
          }

          $curRow.removeClass('active');
        }
      }

      let backspace = function deleteLastCharacter( $input ) {
        $input.val( $input.val().substr(0, $input.val().length -1 ) );
      }

      const shiftKeyboard = function shiftCharactersBySwitchingKeyboards() {
        let $primaryKeyboard = $(".primary-keyboard");
        let $secondaryKeyboard = $(".secondary-keyboard");

        $primaryKeyboard.toggle();
        $secondaryKeyboard.toggle();
      }

      let keyFunctions = {
        "shift" : function() {
          console.log('hi');
          shiftKeyboard();

          let $keys = $('.key');
          $keys.toggleClass('shifted');
        },
        "space" : function() {
          let $focus = $('.focus');
          $focus.val( $focus.val() + " " );
        },
        "caps" : function() {
          shiftKeyboard();
        },
        "simpleBackSpace" : function( clicked ) {
          backspace( $('.focus') );
        },
        "backspace" : function( clicked ) {
          backspace( $('.focus') );
        },
        "submit" : function() {
          $(".focus").parent("form").submit();
        },
        "next" : function() {
          console.log( 'hi' );
        }
      }

      let $theseKeys = $('.key');
      $theseKeys.off('click');

      $theseKeys.on("click", function(e) {
        let $key  = $( e.target );

        let value = $key.text();
        let $focus = $(".focus");
        
        if( keyFunctions.hasOwnProperty(value) ) {
          keyFunctions[value]( $(this) );
        } else {
          if( maxLength != undefined && $focus.val() != undefined ) {
            if( $focus.val().length == maxLength )
              return;
          }
          $focus.val( $focus.val() + value );
        }

        if( $key.hasClass('shift-key') )
          return;

        if( $key.hasClass('shifted') ) {
          shiftKeyboard();
          $('.shifted').removeClass('shifted');
        }
      })
    }


    $('input').on('focus', ( e ) => {
      let $thisInput = $( e.target );

      if( $thisInput[0].dataset.maxLength != undefined ){
        maxLength = parseInt( $thisInput[0].dataset.maxLength, 10 );
      }
      
      $(".focus").removeClass("focus");
      $thisInput.addClass("focus");

      console.log( keyboard, $thisInput.attr('type') );

      if( keyboard == $thisInput.attr('type') ) {
        console.log('lay the foundation pupper');
        return;
      }

      keyboard = $thisInput.attr('type');

      constructKeyboard( keyboards[ keyboard ], maxLength );
    })

  };

  return {
    init: onscreenkeyboard
  };
}());
