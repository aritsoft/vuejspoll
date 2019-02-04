<?php
/*
Plugin Name: VueJS Poll
Description: Live-updating polls for your WordPress website
Version: 0.1
Author: Tahir Mahmood
Author URI: https://arwebsoft.com
*/

if ( ! class_exists( 'VueJSPoll' ) ) {
	
	class VueJSPoll
	{
		private $shortcode_name = 'vuejspoll';

        public function register() {
            add_shortcode( $this->shortcode_name, [$this, 'shortcode'] );
            add_action( 'wp_enqueue_scripts', [$this, 'scripts'] );
			add_action( 'wp_ajax_nopriv_vuepoll_submit', [$this, 'submit_poll'] );
			add_action( 'wp_ajax_nopriv_vuepoll_get_data', [$this, 'get_poll_data'] );
        }

        public function shortcode( $atts ) {
			$id = sanitize_title_with_dashes( $atts['id'], '', 'save' );
			$answers = [];
			foreach ( $atts as $key => $val ) {
				if( strstr( $key, 'answer-' ) ) {
					$answers[ str_replace( 'answer-', '', $key ) ] = $val;
				}
			} 
			$vue_atts = esc_attr( json_encode( [
				'id'       => $id, 
				'question' => $atts['question'],
				'answers'  => $answers,
			] ) );

    		return "<div vuepoll-atts='{$vue_atts}'>loading poll...</div>";
        }
		
		public function scripts() {
            global $post;
            // Only enqueue scripts if we're displaying a post that contains the shortcode
            if( has_shortcode( $post->post_content, $this->shortcode_name ) ) {
                wp_enqueue_script( 'vue', plugin_dir_url( __FILE__ ) . 'js/vue.js', [], '2.5.22' );
                wp_enqueue_script( 'vuejspoll', plugin_dir_url( __FILE__ ) . 'js/vuejspoll.js', [], '0.1', true );
                wp_enqueue_style( 'vuejspoll', plugin_dir_url( __FILE__ ) . 'css/vuejspoll.css', [], '0.1' );
				wp_add_inline_script( 'vue-ajaxurl', 'window.ajaxurl = "' . admin_url( 'admin-ajax.php' ) . '"'); 
            }
        }
		
		public function submit_poll(){
			$id = sanitize_title_with_dashes( $_GET['id'], '', 'save' );
			$answer = sanitize_text_field( $_GET['answer'] );
			$option_name = 'vuejspoll_' . $id;
			$option_value = get_option( $option_name, []); 
			$answer_count = isset( $option_value[ $answer ] ) ? $option_value[ $answer ] : 0;
			$option_value[ $answer ] = $answer_count + 1;  
			update_option( $option_name, $option_value );
			exit('success');
		}
		public function get_poll_data() {
			$id = sanitize_title_with_dashes( $_GET['id'], '', 'save' );
			$option_name = 'vuejspoll_' . $id;
			$option_value = get_option( $option_name, [] );
			exit( json_encode( $option_value ) );
		}


	}
	(new VueJSPoll())->register();
}