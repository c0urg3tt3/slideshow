var App = SC.Application.create();
/** 
      Model
  */
App.DiapoModel = SC.Object.extend({
  guid: null,
  picture: null,
  title: null,
  autor: null,
  
  index: function() {
    return this.get('guid') + 1;
  }.property('guid')
});

/** 
      Controller
  */
App.DiaposController = SC.ArrayProxy.create({
  content: [
    App.DiapoModel.create({
      guid: 0,
      picture: "http://www.kadactivity.net/image/kadactivity_begin.png",
      title: "supatest",
      autor: "kadactivity"
    }),
    App.DiapoModel.create({
      guid: 1,
      picture: "http://www.kadactivity.net/image/kadactivity_begin.png",
      title: "supatest 2",
      autor: "kadactivity"
    }),
    App.DiapoModel.create({
      guid: 2,
      picture: "http://www.kadactivity.net/image/kadactivity_begin.png",
      title: "supatest 3",
      autor: "kadactivity"
    }),
    App.DiapoModel.create({
      guid: 3,
      picture: "http://www.kadactivity.net/image/kadactivity_begin.png",
      title: "supatest 4",
      autor: "kadactivity"
    })
  ]
});

/** 
      Slide Show Controller
  */
App.SlideShowController = SC.Object.create({
  currentPosition: 0,
  // isLeft: NO,
  slideWidth: 512
});

/** 
      Slide Show View
  */
App.SlideShowView = SC.View.extend({
  classNames: ['slide-show'],
  elementId: "slide-show"
});

/** 
      Container View
  */
App.ContainerView = SC.View.extend({
  didInsertElement: function() {
    this.$().css('overflow', 'hidden');
  },
  _start: 0,
	_end: 0,
  isScrolling: NO,
	mouseDown: function(evt) {
		this._start = evt.pageX;
    this.set('isScrolling', YES);
		// return NO;
	},
	mouseUp: function(evt) {
    if( this.get('isScrolling')) {
      this._end = evt.pageX;
      this._sideToSlide();
    }
    this.set('isScrolling', NO);
		// return NO;
	},
	touchStart: function(evt) {
		this.mouseDown(evt);
	},
	touchEnd: function(evt) {
		this.mouseUp(evt);
	},
	_sideToSlide: function() {
    var cp = App.SlideShowController.get('currentPosition'),
        side = this._start - this._end;
		if(side > 0) {
			cp++;
		} else if(side < 0) {
			cp--;
		}
    App.SlideShowController.set('currentPosition', cp);
	}
});

/** 
      Diapo View
  */
App.DiapoView = SC.View.extend({
  classNames: ['slide'],
  didInsertElement: function() {
    var canvas = this.$('canvas.diapo')[0];
    if (!canvas) return;
    var image = new Image(), 
        title = this.getPath('content.title'),
        ctx = canvas.getContext('2d'),
        gradient = ctx.createLinearGradient(0,0,0,512);
      
    gradient.addColorStop(0,"white");
    gradient.addColorStop(0.3,"orange");
    gradient.addColorStop(0.5,"yellow");    
    gradient.addColorStop(0.7,"orange");
    gradient.addColorStop(1,"white");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,512,512);
            
    image.src = this.getPath('content.picture');
    image.onload = function() {
      // ctx.drawImage(image,50,50,500,500,0,0,256,256);
      ctx.drawImage(image,56,56,400,400);
    }    
    
    ctx.font = "normal 24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "black";
    ctx.fillText(title, 256, 10);
  }
});

/** 
      Diapos View
  */
App.DiaposView = SC.CollectionView.extend({
  itemViewClass: App.DiapoView,
  contentBinding: "App.DiaposController",
  width: 0,
  positionMax: 0,
  currentPositionBinding: "App.SlideShowController.currentPosition",
  slideWidthBinding: "App.SlideShowController.slideWidth",
  widthNeedChange: function(){
    var positionMax = this.get('content').get('length'),
        width = positionMax * this.get('slideWidth');
    this.$().css('width', width);
    this.set('width', width);
    this.set('positionMax', positionMax);
  }.observes('slideWidth', 'content'),
  didInsertElement: function() {
    this.widthNeedChange();
  },
  slide: function() {
    var cp = this.get('currentPosition'), 
        pm = this.get('positionMax');
    
    if( cp < 0 ) {
      cp = pm-1;
      App.SlideShowController.set('currentPosition', cp);
    } else if( cp >= pm ) {
      cp = 0;
      App.SlideShowController.set('currentPosition', cp);
    } else {
      cp *= -this.get('slideWidth');
      this.$().animate({'margin-left': cp}, 1000);
    }
  }.observes('currentPosition','slideWidth')
});

/** 
      Button Left / Right
  */
App.NavButtonView = SC.Button.extend({
	isLeft: null,
  isVisible: YES,
	classNames: ["btn-slide"],
	mouseDown: function(evt) {
		this._super(evt);
    var cp = App.SlideShowController.get('currentPosition');
    this.get('isLeft') ? cp-- : cp++;
    App.SlideShowController.set('currentPosition', cp);
		// return NO;
	}
});

/** 
      Button Play
  */
App.PlayButtonView = SC.Button.extend({
	classNames: ["btn-diapo"],
  autoPlay: NO,
  isVisible: YES,
  classNameBindings: ["isPlaying"],
  isPlaying: NO,
  playDelay: 2000,
  _interval: null,
  
	mouseDown: function(evt) {
		this._super(evt);
    if( this.get('isPlaying') ) {
      this._stop();
    } else {
      this._start();
    }
		// return NO;
	},
  /**
		@returns {void}
	  */
  _play: function() {
    var cp = App.SlideShowController.get('currentPosition') + 1;
    App.SlideShowController.set('currentPosition', cp);
  },
  /**
		@returns {void}
	  */
	_start: function() {
		this.set('isPlaying', YES);
		this._interval = setInterval(this._play, this.get('playDelay'));
	},
	/**
		@returns {void}
	  */
	_stop: function() {
		clearInterval(this._interval);
		this._interval = null;
		this.set('isPlaying', NO);
	},
  didInsertElement: function() {
    if( this.get('autoPlay') ){
      this._start();
    }
  }
});

/** 
      Nav View
  */
App.NavView = SC.CollectionView.extend({
  classNames: ['easy-nav'],
  contentBinding: "App.DiaposController",
  tagName: "ul"
});

/** 
      Button Nav Fast
  */
App.NavFastButtonView = SC.Button.extend({
  valueBinding: "itemView.content.guid",
  mouseDown: function(evt) {
    this._super(evt);
    this.goTo();
  },
  goTo: function() {
    App.SlideShowController.set('currentPosition', this.get('value') );
  }
});
