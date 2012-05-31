document.addEventListener( "DOMContentLoaded", function( e ){

  Butter({
    config: "config.json",
    ready: function( butter ){
      var media = butter.media[ 0 ],
          t = new Template();

      function start(){
        var track = media.addTrack( "Track1" );
        media.addTrack( "Track" + Math.random() );
        media.addTrack( "Track" + Math.random() );

        var event = track.addTrackEvent({
          type: "image",
          popcornOptions: {
            start: 0,
            end: 1,
            target: "video-overlay"
          }
        });


      }

      media.onReady( start );
      window.butter = butter;
    } 
  }); //Butter
}, false );
