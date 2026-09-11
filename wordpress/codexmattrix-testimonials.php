<?php
/**
 * Plugin Name: CodeXmattriX — Testimonial CPT
 * Plugin URI:  https://github.com/Mehak9011/my-next-app
 * Description: Registers the "testimonial" custom post type for the headless
 *              Next.js frontend. Exposed via WPGraphQL as "testimonials" and
 *              via REST at /wp-json/wp/v2/testimonial.
 * Version:     1.0.0
 * Author:      CodeXmattriX
 * License:     GPL-2.0-or-later
 *
 * INSTALL: copy this file into  wp-content/mu-plugins/  (no activation needed).
 *          Testimonials appear under wp-admin → Testimonials.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'init',
	function () {
		register_post_type(
			'testimonial',
			array(
				'label'               => 'Testimonials',
				'labels'              => array(
					'name'          => 'Testimonials',
					'singular_name' => 'Testimonial',
					'add_new_item'  => 'Add New Testimonial',
					'edit_item'     => 'Edit Testimonial',
					'new_item'      => 'New Testimonial',
					'view_item'     => 'View Testimonial',
					'menu_name'     => 'Testimonials',
				),
				'description'         => 'Client testimonials shown on the Next.js Home page.',
				'public'              => true,
				'publicly_queryable'  => false, // Headless: frontend is Next.js.
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_nav_menus'   => false,
				'show_in_rest'        => true,   // Exposes /wp-json/wp/v2/testimonial
				'queryable'           => false,
				'supports'            => array( 'title', 'editor' ),
				'menu_icon'           => 'dashicons-format-quote',
				// ---- WPGraphQL support (requires the WPGraphQL plugin) ----
				'show_in_graphql'     => true,
				'graphql_single_name' => 'Testimonial',
				'graphql_plural_name' => 'Testimonials',
			)
		);
	},
	11 // After core CPT registration, before WPGraphQL schema build.
);