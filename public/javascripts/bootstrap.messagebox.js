(function ($) {
	/* Twitter Bootstrap Message Helper
	** Usage: Just select an element with `alert` class and then pass this object for options.
	** Example: $("#messagebox").message({text: "Hello world!", type: "error"});
	** Author: Afshin Mehrabani <afshin.meh@gmail.com>
	** Date: Monday, 08 October 2012 
	*/
	$.fn.message = function(options) {
		//remove all previous bootstrap alert box classes
		this[0].className = this[0].className.replace(/alert-(success|error|warning|info)/g , '');
		this.html(options.text).addClass("fade in alert-" + (options.type || "warning"));
                this.show();
	};
})(jQuery);
