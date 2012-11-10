/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

define([ "text!dialog/dialogs/ipad.html", "dialog/dialog" ],
  function( LAYOUT_SRC, Dialog ){

  Dialog.register( "ipad", LAYOUT_SRC, function( dialog, media ) {
    dialog.registerActivity( "ok", function( e ){
      media.load();
      dialog.activity( "default-close" );
    });

    dialog.enableElements( ".continue" );
    dialog.assignButton( ".continue", "ok" );
  });
});