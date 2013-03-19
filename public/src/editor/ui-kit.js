/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

define( [ "editor/editor", "editor/base-editor", "ui/helpers", "text!layouts/ui-kit.html" ],
  function( Editor, BaseEditor, UI, LAYOUT_SRC ) {

  Editor.register( "ui-kit", LAYOUT_SRC, function( rootElement, butter ) {

    var tabsEl = rootElement.querySelector( ".tab-group" ),
        urlInputEl = rootElement.querySelector( ".url-input" ),
        mediaTogglerBtn = rootElement.querySelector( ".toggle-media-panel" );

    UI.tabs( tabsEl );
    UI.textarea( urlInputEl );
    UI.switchButton( mediaTogglerBtn, tabsEl );

    Editor.BaseEditor.extend( this, butter, rootElement, {
      open: function() {
      },
      close: function() {
      }
    });
  });
});
