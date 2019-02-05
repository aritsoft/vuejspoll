( function() {
	var ajaxurl = "http://localhost/wordpress/testing/wp-admin/admin-ajax.php";
	var pkPoll = Vue.component('vuepoll',{
		template: '<div class="vuepoll-question">\
			<h2>{{atts.question}}</h2>\
			<div class="radio-group">\
				<label v-for="(answer, key) in atts.answers" :key="key"><input type="radio" v-model="selectedAnswer" :value="key" > {{answer}}</label>\
			</div>\
			<button @click="submitPoll">Submit</button>\
		</div>',
		props: ['atts'],
		data: function() { return {
			selectedAnswer: null,
		} },
		methods: {
			submitPoll: function() {
				if( null === this.selectedAnswer ) return;
				var queryString = '?action=vuepoll_submit&id=' + this.atts.id + '&answer=' + this.selectedAnswer;
				//alert(ajaxurl + queryString);
				fetch(ajaxurl + queryString).then( function(msg) {
					this.$emit('submitted');
				}.bind(this) );
				
			}
		}
	});

	var pkResults = Vue.component('vuepoll-results',{
		template: '<div class="vuepoll-results">\
			<h2>{{atts.question}}</h2>\
			<div class="results-group">\
				<p v-for="(answer, key) in atts.answers" :key="key">\
					<span>{{answer}} ({{getAnswerRatio(key)}})</span>\
					<span class="percentage-bar" :style="getAnswerStyle(key)"></span>\
				</p>\
			</div>\
		</div>',
		props: ['atts'],
		data: function() { return {
			results: Object.assign( {}, this.atts.answers )
		} },
		created: function() {
			Object.keys( this.results ).forEach( function( key ) {
				this.results[key] = 0;
			}.bind(this))
		},
		mounted: function() {
			var queryString = '?action=vuepoll_get_data&id=' + this.atts.id
			fetch(ajaxurl + queryString)
				.then( function(response) { return response.json() })
				.then( function(json) { 
					this.results = json;
				 }.bind(this) );
		},
		methods: {
			getAnswerRatio( key ) {
				var total = Object.values(this.results).reduce( function( acc, cur ) { return acc+cur; }, 0 );
				var count = parseInt(this.results[key], 10) || 0;
				return count + ' / ' + total;  
			},
			getAnswerStyle( key ) {
				var total = Object.values(this.results).reduce( function( acc, cur ) { return acc+cur; }, 0 );
				var count = parseInt(this.results[key], 10) || 0;
				var percentage = (count / total) * 100;
				return 'width: '+ percentage + '%;';  
			}
		}
	});

	var elements = document.querySelectorAll('[vuepoll-atts]');
	elements.forEach( function( element ) {
		var atts = JSON.parse( element.getAttribute('vuepoll-atts') )
		var vm = new Vue({
			el: element,
			data: {
				vueSubmitted: false
			},
			template: '<div class="vuepoll-container">\
			\<vuepoll :atts="atts" @submitted="vueSubmitted=true" v-if="!vueSubmitted"/>\
			\<vuepoll-results :atts="atts" v-else/>\
			</div>',
			created: function() {
				this.atts = atts;
			}
		} );
	});
	
})();