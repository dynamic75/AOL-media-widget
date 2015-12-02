!(function($){
	$(document).ready(function(){
		var myModule = new MediaModule({
			container: $("#module"),
			feedUrl: "../gallery.json"
		})

		myModule.init.bind(myModule)();
	})
	
	function MediaModule(cfg){
		this.container = cfg.container;
		this.feedUrl = cfg.feedUrl;
		this.tabs = this.container.find(".tabs a");
		this.gallery = this.container.find("#gallery");
		this.video = this.container.find("video");
		this.mainImg = this.container.find('#mainImage');
		this.galleryTabContent = this.container.find("#galleryTabContent");
		this.videoTabContent = this.container.find("#videoTabContent");
		this.thumbNails = [];
		
		function initialize(){
			loadGallery.bind(this)();
			// set event listener on video end
			setVideoEndHandler.bind(this)();
			tabsToggleHandler.bind(this)();
		}
		
		function tabsToggleHandler(){
			var th = this;
			$.each(this.tabs, function(i, tab){
				var sibling = $(th.tabs[$(tab).attr('id') == th.tabs[0].id ? 1 : 0]);
				
				$(tab).on('click',function(e){
					e.preventDefault();
					if($(tab).hasClass('active')) return
					$(tab).toggleClass('active');
					
					sibling.toggleClass('active');
					// toggle content
					toggleContent.bind(th,$(tab).attr("id")+"Content")()
					toggleContent.bind(th,sibling.attr("id")+"Content")()
				})
			})
		}
		
		function toggleContent(type){
			this[type].slideToggle();
		}
		
		function setVideoEndHandler(){
			var th = this;
			this.video.on('ended', function(e){
				//th.videoTabContent.slideToggle();
				//th.galleryTabContent.slideToggle();
				toggleContent.bind(th,"videoTabContent")()
				toggleContent.bind(th,"galleryTabContent")()
				
				$(th.tabs).each(function(i,t){
					$(this).toggleClass('active');
				})
			})
		}
		
		function setMainImage(item){
			this.mainImg.empty().html(
				[
					'<a href="'+item.clickthroughUrl+'"><img src="'+item.mainImage+'" /></a>',
				].join('')
			)
		}
		
		function setGalleryClickHandler(thumbNails){
			var th = this;
			$.each(thumbNails, function(i,t){
				$(t).on('click', function(e){
					e.preventDefault();
					setMainImage.bind(th,{
						clickthroughUrl: $(t).attr('data-url'),
						mainImage: $(t).attr('data-main-img')
					})()
				})
			})
		}
		
		function galleryTemplate(item,addMainImg,index){
			// set initial main image
			if(addMainImg) setMainImage.bind(this,item)();
			
			return [
				'<li><a href="#" id="thumbImg_'+index+'" data-url="'+item.clickthroughUrl+'" data-main-img="'+item.mainImage+'">',
					'<img src="'+item.thumbImage+'" />',
				'</a></li>'
			].join("")
		}
		
		function renderGallery(items){
			var th = this;
			$.each(items, function(i, item){
				th.gallery.append(galleryTemplate.bind(th,item,i==0,i)());
			})
			// store reference to thumbnails
			this.thumbNails = this.gallery.find('li a');
			setGalleryClickHandler.bind(this, this.thumbNails)();
		}
		
		function loadGallery(){
			var th = this;
			$.ajax({
				url: this.feedUrl,
				method: "GET"
			})
			.done(function(data){
				// store gallery in MediaModule
				th.galleryData = data;
				
				renderGallery.bind(th,data.galleryImages)();
			})
		}
		
		//public functions and properties
		return {
			init: 	initialize,
			container: this.container,
			feedUrl: this.feedUrl,
			tabs: this.tabs,
			gallery: this.gallery,
			video: this.video,
			mainImg: this.mainImg,
			galleryTabContent: this.galleryTabContent,
			videoTabContent: this.videoTabContent,
			thumbNails: this.thumbNails
		}
		
	}
	
})(jQuery);