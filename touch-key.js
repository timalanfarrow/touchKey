const xmas = (function( $onScreenKeyboard ) {
  let onscreenkeyboard = function main( $onScreenKeyboard ) {
    let keyboard;
    let maxLength;
    let languagePack = 'english';
    
    if( localStorage %% localStorage.getItem('languagePack') != null )
      languagePack = localStorage.getItem('languagePack');

    if( !$onScreenKeyboard.length )
      return;

    let keyboards = {
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
            "characters": "[simpleBackSpace] 0 [simpleSubmit]"
          }
        ]
      },
      "text" : {
        "default" : [
          {
            "characters": "[buffer] [.com] 1234567890-@ [buffer]",
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
            "characters": "[buffer] [.com] !@#$%^&*()_@ [buffer]",
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

    if ( languagePack == 'spanish' ) {
      keyboards.text.default[2].characters = "[caps] asdfghjklñ [submit]";
      keyboards.text.shift[2].characters = "[caps] ASDFGHJKLÑ [submit]";
    }

    const constructKeyboard = function buildKeyBoardFromJSONRows( keyboard ) {

      const keyboardMap = {
        "default": "primary",
        "numbers": "primary",
        "shift"  : "secondary",
      };

      let $keyboard = $onScreenKeyboard;
      $keyboard.html('');

      for( n in keyboard ) {
        let type = keyboardMap[n];
        let rows = keyboard[n];
        let keyboardClass = type + "-keyboard";
        $keyboard.append("<div class='" + keyboardClass + "'></div>")

        let $curKeyboard = $("." + keyboardClass );
        for( i in rows ) {
          let row = rows[i];
          let keyClass = row.keyClass == undefined ? "" : row.keyClass;

          $curKeyboard.append("<div class='keyRow active'></div>");
          let $curRow = $(".keyRow.active");

          let groups = row.characters.split(" ");
          let characters = [];

          for( ind in groups ) {
            let str = groups[ind];
            if( str[0] == "[") {
              characters.push( str.substr( 1, str.length - 2 ) );
            } else {
              characters = characters.concat( str.split("") );
            }
          }

          let keyClasses = {
            "buffer"          : "buffer special",
            "simpleBackSpace" : "simple-back-space",
            "simpleSubmit"    : "simple-submit submit",
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
            if( ( character.length > 1 ) && keyClasses.hasOwnProperty(character) ) {
              keyClass = keyClasses[ character ];
            }
            $curRow.append("<div class='key " + keyClass + "' data-key='" + character + "'>" + character + "</div>");
          }

          $curRow.removeClass('active');
        }
      }

      let backspace = function backspaceFunctionWithHoldCapability( $input, $backspaceKey) {
        let del = function deleteLastCharacter( $element ) {
          $element.val( $element.val().substr(0, $element.val().length -1 ) );
        }

        del( $input );

        let rdID = null;

        let rapidDelete = function rapidlyDeleteCharactersUntilMouseup() {
          rdID = window.setInterval( function holdBackspace() { 
            del( $input );
          }, 60 );
        }

        let delay = (function delayAndThenRapidDelete() {
          return window.setTimeout( rapidDelete, 500 );
        }());

        $backspaceKey.off('mouseup');
        $backspaceKey.on('mouseup', ( e ) => {
          window.clearInterval( delay );  // don't run our rapidDelete

          if ( rdID != null )
            window.clearInterval( rdID ); // stop rapidDelete if it's already running
        })
      }

      const shiftKeyboard = function shiftCharactersBySwitchingKeyboards() {
        let $primaryKeyboard = $(".primary-keyboard");
        let $secondaryKeyboard = $(".secondary-keyboard");

        $primaryKeyboard.toggle();
        $secondaryKeyboard.toggle();
      }

      let keyFunctions = {
        "shift" : function() {
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
        "simpleBackSpace" : function( $clicked ) {
          backspace( $('.focus'), $clicked );
        },
        "simpleSubmit" : function() {

        },
        "backspace" : function( $clicked ) {
          backspace( $('.focus'), $clicked );
        },
        "simpleSubmit" : function() {
          // no op
        },
        "submit" : function() {
          $(".focus").parent("form").submit();
        }
      }

      let $theseKeys = $('.key');
      $theseKeys.off('mousedown');

      $theseKeys.on("mousedown", function(e) {
        let $key  = $( e.target );

        let value = $key[0].dataset.key;
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

        if ( $key.hasClass('shift-key') )
          return;

        if ( $key.hasClass('shifted') ) {
          shiftKeyboard();
          $('.shifted').removeClass('shifted');
        }
      })
    }

    $('input').on('focus', ( e ) => {
      let $thisInput  = $( e.target );
      let thisDataset = $thisInput[0].dataset;

      maxLength = undefined;
      let autoCapitalize = false;

      if ( thisDataset.maxLength != undefined ){
        maxLength = parseInt( $thisInput[0].dataset.maxLength, 10 );
      }

      if ( thisDataset.autoCapitalize != undefined ) {
        autoCapitalize = thisDataset.autoCapitalize;
      }

      $(".focus").removeClass("focus");
      $thisInput.addClass("focus");

      // make sure to autocapitalize if necessary
      if ( autoCapitalize && ( $('.secondary-keyboard').css('display') == 'none' ) ) {
        $('.shift-key').eq(0).mousedown().mouseup(); // makes sure we don't run it four times
      }

      // make sure to uncapitalize if necessary
      if ( !autoCapitalize && !( $('.secondary-keyboard').css('display') == 'none' ) ) {
        $('.shift-key').eq(0).mousedown().mouseup(); // makes sure we don't run it four times
      }
      if( keyboard == $thisInput.attr('type') ) {
        return;
      }

      keyboard = $thisInput.attr('type');

      constructKeyboard( keyboards[ keyboard ], maxLength );

      let buttonMap = {
        '.shift-key'     : 'cambio',
        '.backspace-key' : 'retroceso',
        '.spacebar-key'  : 'espacio'
      }
      // hackjob to support multiple languages
      if ( languagePack == 'spanish' ) {
        for ( i in buttonMap ) {
          $( i ).text( buttonMap[i] );
        }
      }
    })
  };

  return {
    init: onscreenkeyboard
  };
}());
  