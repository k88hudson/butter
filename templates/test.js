document.addEventListener( "DOMContentLoaded", function( e ){

  Butter({
    config: "../config/default.conf",
    ready: function( butter ){
      var media = butter.media[ 0 ],
          _popcorn = Popcorn.instances[ 0 ],
          _targets = butter.targets,
          _currentTrackEvent,
          _imageGallery = []; //stores a gallery of uploaded images
           template = {};

      function start(){ 
        var targetSelectors, i;

        //EDITORS
        function sendData( trackEvent, data ) {
          var currentOptions = trackEvent.popcornOptions;
          for( i in currentOptions) {
            data[ i ] || ( data[ i ] = currentOptions[ i ] );
          }
          trackEvent.update( data );
        }

        function updatePanel(data) {
          console.log( data );
          var t = data.data.trackEvent.popcornOptions.target;
          document.querySelector( "[data-butter-input='target'] > button > .btn-title" ).innerHTML = t; //Change title of button
          document.querySelector( "[data-butter-input='target'] > ul > a[href='" + t + "']" ).classList.add( "active" ); //Activate current target
          document.getElementById(t).querySelector( ".target-label" ).style.background = "#F6C333";

        }


        butter.listen("trackeventupdated", function( e ) {
          console.log( "trackeventupdated" );
          template.blink();
        });

        butter.listen("trackeventadded", function( e ) {

          e.data.view.listen( "trackeventdoubleclicked", function(e) {
            _currentTrackEvent = e.data.trackEvent;
            butter.ui.visible = false; //collapse panel
            document.getElementById("editor-panel").style.marginRight = 0; //show editor
            updatePanel( e );

          }, false );

        });

        butter.listen("trackeventremoved", function( e ) {
          console.log( "trackeventremoved" );
        });

        butter.listen( "trackeventupdatefailed", function( e ) {
          if( e.data === "invalidtime" ){
            document.getElementById( "message" ).innerHTML = "You've entered an invalid start or end time. Please verify that they are both greater than 0, the end time is equal to or less than the media's duration, and that the start time is less than the end time.";
          } //if
        });

        tabs("editor-tabs", "tab-panels");
        targetSelectors = document.querySelectorAll("[data-butter-input='target']");
        makeTargetSelectors( targetSelectors );
        makeImageDropper("drop-target");

  
        //FUNCTIONS
        template.blink = function(control) {
          var i, j, targetName, targetLabel;
          for( i in _targets ) {
            if( _targets[ i ].element ) {
              if( control === "on" ) {
                _targets[ i ].element.classList.add( "butter-blink");  
              } 
              else if( control === "off" ) {
                _targets[ i ].element.classList.remove( "butter-blink");
                console.log( _targets[ i ].element.querySelector( ".target-label" ) );  
              } 
            }
          }
        };

        template.apply = function(elements, func) {
          console.log(elements);
          for(var elem=0;elem<elements.length;elem++) {
            func( elements[elem] );
          }
        }

        function makeTargetSelectors( targetSelectors ) {
          var i, j, menuEl, optionEl, targetLabel ;
          for ( i in targetSelectors ) {
            if ( targetSelectors[ i ].classList && targetSelectors[ i ].classList.contains("btn-group") ) {
              menuEl = document.createElement( "ul" );
              menuEl.classList.add( "dropdown-menu" );

              for( j=0;j<_targets.length;j++) {
                console.log( _targets[ j ] );
                optionEl = document.createElement( "li" ).appendChild( document.createElement( "a") );
                optionEl.setAttribute("href", _targets[ j ].elementID);
                optionEl.innerHTML = _targets[ j ].elementID;
                menuEl.appendChild( optionEl );

                targetLabel = document.createElement( "div");
                targetLabel.classList.add( "target-label" );
                targetLabel.innerHTML = _targets[ j ].elementID;
                targetLabel.setAttribute( "data-butter-exclude", true ) ;
                targetLabel.style.top = _targets[ j ].element.offsetBottom + "px";
                targetLabel.style.left = _targets[ j ].element.offsetLeft + "px";
                targetLabel.style.width = _targets[ j ].element.clientWidth + parseFloat(window.getComputedStyle(_targets[ j ].element, null).getPropertyValue("border-width"))*2 + "px";
                _targets[ j ].element.appendChild( targetLabel );

                (function( targetLabel, optionEl ) {
                  optionEl.addEventListener( "click", function(e){
                    e.preventDefault();
                    var newTargetID = optionEl.innerHTML;
                    this.parentNode.querySelector( ".active" ) && this.parentNode.querySelector( ".active" ).classList.remove( "active" );
                    this.classList.add( "active" );
                    optionEl.parentNode.parentNode.querySelector( "button > span.btn-title").innerHTML = newTargetID;
                    //Make all targets un-active
                    template.apply( document.querySelectorAll(".target-label"), function(elem) {
                      elem.style.background = "";
                    });
                    //Colourise current label
                    targetLabel.style.background = "#F6C333";
                    //Todo: change target, send data
                    sendData( _currentTrackEvent, { "target" : newTargetID } );

                  }, false);
                })( targetLabel, optionEl );
              }
              targetSelectors[ i ].appendChild( menuEl );

              targetSelectors[ i ].children[ 0 ].addEventListener( "click", function(e) { 
                e.preventDefault();
                if( !this.parentNode.classList.contains( "open" ) ) {
                  this.parentNode.classList.add( "open" )
                  template.blink( "on" );
                  this.classList.add( "active" );
                  template.apply( document.querySelectorAll( ".target-label"), function(elem) {
                    elem.style.opacity = .7;
                  });
                } else {
                  closeTarget( this );
                }
                 
              }, false);

             function closeTarget( button ) {
                //e.preventDefault();
                button.parentNode.classList.remove( "open" )
                template.blink( "off" );
                template.apply( document.querySelectorAll( ".target-label"), function(elem) {
                  elem.style.opacity = 0;
                });
                window.removeEventListener( "click", closeTarget );
              }

            }//if
          }//for
        }//makeTargetSelectors

        function makeImageDropper(id) {
          var canvas = document.createElement( "canvas" ),
              context,
              dropTarget,
              imgGallery;

          canvas.id = "grabimage";
          canvas.style.display = "none";
          dropTarget = document.getElementById( id )
          dropTarget.innerHTML = "<span>Drag an image<br />from your desktop...</span";

          imgGallery = document.createElement( "div");
          imgGallery.classList.add( "img-gallery" );
          imgGallery.appendChild( document.createElement("ul") );

          dropTarget.parentNode.appendChild( imgGallery );
          

          _currentTrackEvent && _currentTrackEvent.popcornOptions.src && ( dropTarget.style.backgroundImage = "url('" + _currentTrackEvent.popcornOptions.src + "')" ); 

          dropTarget.addEventListener( "dragover", function( event ) {
            event.preventDefault();
            dropTarget.classList.add( "dragover" );
          }, false);

          dropTarget.addEventListener( "dragleave", function( event ) {
            event.preventDefault();
            dropTarget.classList.remove( "dragover" );
          }, false);

          document.getElementById("editor-panel").addEventListener( 'drop', function( event ) {
            dropTarget.classList.remove( "dragover" );
            event.preventDefault();
            var file = event.dataTransfer.files[ 0 ],
                imgSrc,
                image,
                imgURI;

            if( window.URL ) { 
              imgSrc = window.URL.createObjectURL( file );
            } else if ( window.webkitURL ) {
              imgSrc = window.webkitURL.createObjectURL( file );
            }
            
            image = document.createElement( 'img' );
            image.onload = function () {
                var galleryItem;
                
                canvas.width = this.width;
                canvas.height = this.height;
                context = canvas.getContext( '2d' );
                context.drawImage( this, 0, 0, this.width, this.height );
                imgURI = canvas.toDataURL();
                sendData( _currentTrackEvent, { "src" : imgURI } );
                dropTarget.style.backgroundImage = "url('" +  imgURI + "')";
                dropTarget.firstChild.innerHTML = file.name || file.fileName;
                
                galleryItem = document.createElement("li");
                galleryItem.appendChild( this );

                this.addEventListener( "click", function() {
                  dropTarget.style.backgroundImage = "url('" +  imgURI + "')";
                  sendData( _currentTrackEvent, { "src" : imgURI } );
                }, false);
                imgGallery.firstChild.style.width = (imgGallery.firstChild.children.length + 1) * 120 + "px";
                imgGallery.firstChild.appendChild( galleryItem );
            };
            image.src = imgSrc;
        
          }, false);
          /*
          field.addEventListener( "change", function( e ){
            console.log ( field.value );
            if( field.value ) {
              console.log( field.value );
              dropTarget.style.backgroundImage = "url('" + field.value + "')";
              sendData( false, field.value );
            }
          }, false );
          */

        }//makeImageDropper

        function tabs( id, panels ) { 
          var list, elements, i, j, k, selectedEls, allPanels, panelID, panel;
          list = document.getElementById( id );
          elements = list.children;
          allPanels = document.getElementById( panels ).children;

          for( i = 0; i < elements.length; i++ ) {
            panelID = elements[ i ].firstChild.href.split("#")[1]; //ID of panel
            panel = document.getElementById( panelID );
            if ( panel ) { 
              if( !elements[ i ].classList.contains("selected") ) { panel.style.display = "none"; }
              (function ( panel ){
                elements[ i ].addEventListener( "click", function( e ) {
                e.preventDefault();

                selectedEls = document.getElementsByClassName( "selected")
                for( j in selectedEls ) {
                  if( selectedEls[ j ].classList ) { selectedEls[ j ].classList.remove( "selected" ); }
                }

                this.classList.add( "selected" );

                for( k in allPanels ) {
                  if( allPanels[ k ].style ) {  allPanels[ k ].style.display = "none"; }
                }

                console.log( panel );
                panel.style.display = "block";

              }, false);

              })( panel );
              

            } 
          }//for
        }

        //TRACKS
        var track = media.addTrack( "Track1" );
        media.addTrack( "Track" + Math.random() );
        media.addTrack( "Track" + Math.random() );

        var event = track.addTrackEvent({
          type: "text",
          popcornOptions: {
            start: 0,
            end: 3,
            text: "test",
            target: "Scott"
          }
        });

        butter.tracks[ 2 ].addTrackEvent({ 
          type: "image",
          popcornOptions: {
            start: 0,
            end: 2,
            target: "Ben"
          }
        });

        butter.tracks[ 2 ].addTrackEvent({ 
          type: "text",
          popcornOptions: {
            start: 100,
            text: "bloob",
            target: "Bobby"
          }
        });

      } //START

      media.onReady( start );
      
      window.butter = butter;
    } 
  }); //Butter
}, false );
