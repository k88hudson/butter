define([ "../util/time" ], function( TimeUtil ) {

  var _inProgress;

  function getHeight( element ) {
    var testClone,
        h;

    testClone = element.cloneNode( true );

    testClone.style.visibility = "none";
    testClone.style.display = "block";
    testClone.style.height = "";

    element.parentNode.appendChild( testClone );
    h = testClone.getBoundingClientRect().height;
    element.parentNode.removeChild( testClone );
    return h;
  }

  function toggleHeight( element, duration ) {
    var hMax,
        direction;

    if ( _inProgress ) {
      return;
    }

    duration = duration || 200;

    if ( element.offsetHeight ) {
      direction = "up";
    } else {
      direction = "down";
    }

    function setTransition( on ) {
      if ( on ) {
        element.style.webkitTransition = "height " + duration/1000 + "s ease";
        element.style.mozTransition = "height " + duration/1000 + "s ease";
        element.style.oTransition = "height " + duration/1000 + "s ease";
        element.style.transition = "height " + duration/1000 + "s ease";
      } else {
        element.style.webkitTransition = "";
        element.style.mozTransition = "";
        element.style.oTransition = "";
        element.style.transition = "";
      }
    }

    function onSlideDownEnd() {
      setTransition( false );
      element.style.overflow = "";
      element.style.height = "";
      _inProgress = false;
    }

    function onSlideUpEnd() {
      setTransition( false );
      element.style.height = "";
      element.style.display = "none";
      element.style.overflow = "";
      _inProgress = false;
    }

    if ( direction === "down" ) {
      _inProgress = true;
      element.style.display = "";
      element.style.overflow = "hidden";
      setTransition( true );
      hMax = getHeight( element );
      element.style.height = hMax + "px";
      setTimeout( onSlideDownEnd, duration );
    } else if ( direction === "up" ) {
      _inProgress = true;
      hMax = element.offsetHeight;
      element.style.height = hMax + "px";
      element.style.overflow = "hidden";
      setTimeout( function() {
        setTransition( true );
        element.style.height = 0;
        setTimeout( onSlideUpEnd, duration );
      }, 0 );
    }
  }

  return {
    input: function( element ) {
        if ( element.classList.contains( "timecode-input" ) ) {
          element.addEventListener( "blur", function( e ) {
            element.value = TimeUtil.toTimecode( element.value );
          }, false );
          element.setAttribute( "placeholder", "00:00:00" );
        }
    },
    textarea: function ( element ) {
      var EXPANDMIN = 31,
          EXPANDMAX = 100,
          oldLength,
          oldWidth;

      if ( !( element && (
        element.type === "text" ||
        element.type === "textarea" ||
        element.type === "url" )
      )) {
        throw "Textbox: Expected an input element of type text";
      }

      function __highlight( e ) {
        var element = e.target;
        element.select();
        element.removeEventListener( "focus", __highlight, false );
      }

      function __ignoreMouseUp( e ) {
        e.preventDefault();
        var element = e.target;
        element.removeEventListener( "mouseup", __ignoreMouseUp, false );
      }

      function __addListeners( input ) {
        element.addEventListener( "focus", __highlight, false );
        element.addEventListener( "mouseup", __ignoreMouseUp, false );
      }

      function resizeTextbox( e ) {
        // Based on http://blogs.sitepointstatic.com/examples/tech/textarea-expander/jquery.textarea-expander.js
        var el = e.target || e,
            vlen = el.value.length,
            ewidth = el.offsetWidth,
            h;

        if ( vlen !== oldLength || ewidth !== oldWidth ) {
          if ( vlen < oldLength || ewidth !== oldWidth ) {
            el.style.height = "0";
          }
          h = Math.max( EXPANDMIN, Math.min( el.scrollHeight, EXPANDMAX) );
          el.style.overflow = ( el.scrollHeight > h ? "auto" : "hidden" );
          el.style.height = h + "px";
          oldLength = vlen;
          oldWidth = ewidth;
        }
        return true;
      }

      element.addEventListener( "keyup", resizeTextbox, false );
      element.addEventListener( "focus", resizeTextbox, false );
      element.addEventListener( "blur", function( e ) {
        __addListeners( e.target );
      }, false);
      __addListeners( element );
      resizeTextbox( element );
    },
    selectBox: function( element ) {
      var sortIcon = element.querySelector( "i" );
      function collapseOnWindowClick() {
        element.classList.remove( "expanded" );
        sortIcon.classList.remove( "icon-angle-up" );
        sortIcon.classList.add( "icon-angle-down" );
        window.removeEventListener( "click", collapseOnWindowClick, false );
      }
      function switchSelect( e ) {
        element.removeEventListener( "click", switchSelect, false );
        element.addEventListener( "click", openList, false );
        if ( e.target.tagName !== "LI" ) {
          return;
        }
        element.insertBefore( e.target, element.firstChild );
      }
      function openList( e ) {
        element.classList.add( "expanded" );
        element.removeEventListener( "click", openList, false );
        element.addEventListener( "click", switchSelect, false );
        sortIcon.classList.add( "icon-angle-up" );
        sortIcon.classList.remove( "icon-angle-down" );
        setTimeout( function() {
          window.addEventListener( "click", collapseOnWindowClick, false );
        }, 0 );
      }
      element.addEventListener( "click", openList, false );
    },
    fitBottom: function( options ) {
      var element,
          parent,
          self = {};

      options = options || {};
      element = options.element || options.parent.children( options.parent.children.length - 1 );
      parent = options.parent || options.element.parentNode;

      function resizeFn() {
        element.style.height = parent.offsetHeight - element.offsetTop + "px";
      }

      window.addEventListener( "resize", resizeFn, false );
      resizeFn();
      self.element = element;
      self.update = resizeFn;
      return self;
    },
    tabs: function( options ) {
      var element,
          onUpdate;

      if ( options instanceof HTMLElement ) {
        // You can just pass it an element too
        element = options;
        options = {};
      } else {
        options = options || {};
        element = options.element;
      }
      onUpdate = options.onUpdate || function(){};

      var controls = element.querySelectorAll( "[data-tab-control]" ),
          panels = element.querySelectorAll( "[data-tab]" ),
          i;

      function onClick( e ) {
        var whichTab = this.getAttribute( "data-tab-control" ),
            j;

        e.preventDefault();

        for ( j = 0; j < controls.length; j++ ) {
          controls[ j ].classList.remove( "tab-on" );
        }
        this.classList.add( "tab-on" );

        if ( !whichTab ) {
          return;
        }

        for ( j = 0; j < panels.length; j++ ) {
          panels[ j ].classList.remove( "tab-on" );
        }
        element.querySelector( "[data-tab=\"" + whichTab + "\"]" ).classList.add( "tab-on" );
        onUpdate();
      }

      for ( i = 0; i < controls.length; i++ ) {
        controls[ i ].addEventListener( "click", onClick, false );
      }

    },
    accordion: function( options ) {
      var element,
          onUpdate;

      options = options || {};
      element = options.element;
      onUpdate = options.onUpdate || function(){};

      if ( !element ) {
        return;
      }

      var controls = element.querySelectorAll( "[data-tab-control]" );

      function onControlsClick( e ) {
        var whichTab;
        e.preventDefault();

        whichTab = this.getAttribute( "data-tab-control" );
        if ( !whichTab ) {
          return;
        }

       element.querySelector( "[data-tab=\"" + whichTab + "\"]" ).classList.toggle( "tab-on" );
       this.classList.toggle( "tab-on" );

       onUpdate();
      }

      for ( var i = 0; i < controls.length; i++ ) {
        controls[ i ].addEventListener( "click", onControlsClick, false );
      }

    },
    switchButton: function( element, toggledElement ) {
      toggledElement = toggledElement || document.querySelector( "[data-switch=\"" + element.getAttribute( "data-switch-control" )+ "\"]" );
      element.addEventListener( "click", function( e ) {
        e.preventDefault();
        element.classList.toggle( "pressed" );
        toggleHeight( toggledElement, 150 );
      }, false );
    }
  };
});
